/**
 * Pilot Journey Engine — Chat-Endpoint (SSE-Streaming + Tool-Loop).
 *
 * Öffentlich erreichbar (Widget), daher hart limitiert:
 * - 60 Nachrichten/Session, 240/Tag pro IP, 2.000 Zeichen/Nachricht
 * - E-Mail-Gate nach 6 Nutzer-Nachrichten (Lead + DSGVO-Consent)
 * - Kosten-Logging pro Nachricht (tokens_in/out)
 */
import Anthropic from "@anthropic-ai/sdk";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { and, asc, eq, gte, sql as dsql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  pilotSessions,
  pilotMessages,
  pilotProfiles,
  pilotEvents,
  type PilotProfile,
} from "@/lib/db/schema";
import {
  buildStaticSystem,
  buildDynamicSystem,
  maybeAdvanceStage,
  isPilotEngineConfigured,
  PILOT_ENGINE_MODEL,
} from "@/lib/pilot/engine";
import { toolsForStage, executeTool, type ToolContext, type Stage } from "@/lib/pilot/tools";

export const maxDuration = 300;

const MAX_MESSAGE_CHARS = 2000;
const MAX_SESSION_MESSAGES = 60;
const MAX_IP_MESSAGES_PER_DAY = 240;
const EMAIL_GATE_AFTER_USER_MSGS = 6;
const MAX_AGENT_ITERATIONS = 5;

function sse(payload: Record<string, unknown>): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(request: NextRequest) {
  if (!isPilotEngineConfigured()) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 503 });
  }

  let body: { sessionId?: string; message?: string; persona?: string; locale?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_json" }), { status: 400 });
  }

  const sessionId = String(body.sessionId ?? "");
  const message = String(body.message ?? "").trim();
  if (!/^[a-f0-9-]{16,64}$/i.test(sessionId)) {
    return new Response(JSON.stringify({ error: "bad_session" }), { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE_CHARS) {
    return new Response(JSON.stringify({ error: "bad_message" }), { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  // Session laden/anlegen
  let [session] = await db.select().from(pilotSessions).where(eq(pilotSessions.id, sessionId)).limit(1);
  if (!session) {
    const persona = body.persona === "recruiter" ? "recruiter" : "academy";
    const locale = body.locale === "en" ? "en" : "de";
    [session] = await db
      .insert(pilotSessions)
      .values({ id: sessionId, persona, locale, ipHash })
      .returning();
    await db.insert(pilotEvents).values({ sessionId, type: "assessment_started", payload: { persona } });
  }

  // Rate-Limits
  if (session.messageCount >= MAX_SESSION_MESSAGES) {
    return new Response(JSON.stringify({ error: "session_limit" }), { status: 429 });
  }
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const [ipCount] = await db
    .select({ n: dsql<number>`count(*)::int` })
    .from(pilotMessages)
    .innerJoin(pilotSessions, eq(pilotSessions.id, pilotMessages.sessionId))
    .where(and(eq(pilotSessions.ipHash, ipHash), gte(pilotMessages.createdAt, dayStart)));
  if ((ipCount?.n ?? 0) >= MAX_IP_MESSAGES_PER_DAY) {
    return new Response(JSON.stringify({ error: "daily_limit" }), { status: 429 });
  }

  // Profil laden
  let profile: PilotProfile | null = null;
  if (session.profileId) {
    const rows = await db.select().from(pilotProfiles).where(eq(pilotProfiles.id, session.profileId)).limit(1);
    profile = rows[0] ?? null;
  }

  // E-Mail-Gate
  const [userMsgCount] = await db
    .select({ n: dsql<number>`count(*)::int` })
    .from(pilotMessages)
    .where(and(eq(pilotMessages.sessionId, sessionId), eq(pilotMessages.role, "user")));
  if ((userMsgCount?.n ?? 0) >= EMAIL_GATE_AFTER_USER_MSGS && !profile?.email) {
    await db.insert(pilotEvents).values({ sessionId, profileId: profile?.id ?? null, type: "lead_gate_shown" });
    return new Response(sse({ t: "gate" }) + sse({ t: "end" }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  // History
  const history = await db
    .select({ role: pilotMessages.role, content: pilotMessages.content })
    .from(pilotMessages)
    .where(eq(pilotMessages.sessionId, sessionId))
    .orderBy(asc(pilotMessages.createdAt))
    .then((rows) => rows.slice(-20));

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (payload: Record<string, unknown>) => controller.enqueue(encoder.encode(sse(payload)));
      let assistantText = "";
      let tokensIn = 0;
      let tokensOut = 0;
      const toolCallLog: { name: string; input: unknown }[] = [];

      try {
        const ctx: ToolContext = {
          sessionId,
          profile,
          persona: session.persona,
          locale: session.locale,
          profileDirty: false,
        };

        const messages: Anthropic.MessageParam[] = [
          ...history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
          { role: "user" as const, content: message },
        ];

        const system: Anthropic.TextBlockParam[] = [
          { type: "text", text: buildStaticSystem(session.persona), cache_control: { type: "ephemeral" } },
          { type: "text", text: buildDynamicSystem(session, profile) },
        ];

        for (let iteration = 0; iteration < MAX_AGENT_ITERATIONS; iteration++) {
          const tools = toolsForStage(session.stage as Stage);
          const response = anthropic.messages.stream({
            model: PILOT_ENGINE_MODEL,
            max_tokens: 1500,
            system,
            messages,
            tools,
          });

          response.on("text", (delta) => {
            assistantText += delta;
            emit({ t: "delta", text: delta });
          });

          const final = await response.finalMessage();
          tokensIn += final.usage.input_tokens;
          tokensOut += final.usage.output_tokens;

          if (final.stop_reason !== "tool_use") break;

          // Tool-Aufrufe ausführen
          const toolUses = final.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
          );
          const results: Anthropic.ToolResultBlockParam[] = [];
          for (const tu of toolUses) {
            toolCallLog.push({ name: tu.name, input: tu.input });
            emit({ t: "tool", name: tu.name });
            const result = await executeTool(tu.name, (tu.input ?? {}) as Record<string, unknown>, ctx);
            results.push({ type: "tool_result", tool_use_id: tu.id, content: result });
          }
          messages.push({ role: "assistant", content: final.content });
          messages.push({ role: "user", content: results });

          // Dynamischen System-Teil aktualisieren, falls Profil geändert
          if (ctx.profileDirty) {
            profile = ctx.profile;
            system[1] = { type: "text", text: buildDynamicSystem(session, profile) };
          }
        }

        // Persistieren
        await db.insert(pilotMessages).values([
          { sessionId, role: "user", content: message, tokensIn: 0, tokensOut: 0 },
          {
            sessionId,
            role: "assistant",
            content: assistantText || "…",
            toolCalls: toolCallLog.length > 0 ? toolCallLog : null,
            tokensIn,
            tokensOut,
          },
        ]);
        await db
          .update(pilotSessions)
          .set({
            messageCount: session.messageCount + 2,
            lastActiveAt: new Date(),
            profileId: profile?.id ?? session.profileId,
          })
          .where(eq(pilotSessions.id, sessionId));

        const newStage = await maybeAdvanceStage({ ...session, profileId: profile?.id ?? session.profileId }, profile);
        emit({
          t: "meta",
          stage: newStage,
          level: profile?.level ?? null,
          passportLevel: profile?.passportLevel ?? 0,
        });
        emit({ t: "end" });
      } catch (err) {
        console.error("[pilot-engine] chat failed", err);
        Sentry.captureException(err, { tags: { feature: "pilot_engine_chat" } });
        const raw = err instanceof Error ? err.message : String(err);
        let friendly = "Der Guide ist kurz nicht erreichbar — bitte gleich nochmal senden.";
        if (/credit balance/i.test(raw)) {
          friendly =
            "Der Guide macht gerade eine kurze Pause (Kontingent aufgebraucht). Das Team ist informiert — schau bitte später nochmal vorbei!";
        } else if (/overloaded|rate.?limit|429|529/i.test(raw)) {
          friendly = "Gerade ist viel los — bitte in ein paar Sekunden nochmal senden.";
        }
        emit({ t: "error", message: friendly });
        emit({ t: "end" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
