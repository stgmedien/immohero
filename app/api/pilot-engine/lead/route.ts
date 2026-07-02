/**
 * E-Mail-Gate der Pilot Journey Engine: Lead-Capture + DSGVO-Consent.
 * Erkennt wiederkehrende Piloten an der E-Mail und verknüpft die Session
 * mit dem bestehenden Profil (Session-übergreifendes Gedächtnis).
 */
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { pilotSessions, pilotProfiles, pilotEvents } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  let body: { sessionId?: string; email?: string; name?: string; consent?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const sessionId = String(body.sessionId ?? "");
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[a-f0-9-]{16,64}$/i.test(sessionId)) {
    return NextResponse.json({ ok: false, error: "bad_session" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "bad_email" }, { status: 400 });
  }
  if (!body.consent) {
    return NextResponse.json({ ok: false, error: "consent_required" }, { status: 400 });
  }

  const [session] = await db.select().from(pilotSessions).where(eq(pilotSessions.id, sessionId)).limit(1);
  if (!session) {
    return NextResponse.json({ ok: false, error: "session_not_found" }, { status: 404 });
  }

  // Wiederkehrer: bestehendes Profil zur E-Mail?
  const existing = await db.select().from(pilotProfiles).where(eq(pilotProfiles.email, email)).limit(1);
  let profileId: string;
  let returning = false;

  if (existing[0]) {
    profileId = existing[0].id;
    returning = true;
    if (typeof body.name === "string" && body.name.trim() && !existing[0].name) {
      await db.update(pilotProfiles).set({ name: body.name.trim().slice(0, 120) }).where(eq(pilotProfiles.id, profileId));
    }
  } else if (session.profileId) {
    profileId = session.profileId;
    await db
      .update(pilotProfiles)
      .set({
        email,
        consentAt: new Date(),
        ...(typeof body.name === "string" && body.name.trim() ? { name: body.name.trim().slice(0, 120) } : {}),
      })
      .where(eq(pilotProfiles.id, profileId));
  } else {
    const [created] = await db
      .insert(pilotProfiles)
      .values({
        email,
        name: typeof body.name === "string" ? body.name.trim().slice(0, 120) || null : null,
        persona: session.persona,
        locale: session.locale,
        consentAt: new Date(),
      })
      .returning({ id: pilotProfiles.id });
    profileId = created.id;
  }

  await db.update(pilotSessions).set({ profileId }).where(eq(pilotSessions.id, sessionId));
  await db.insert(pilotEvents).values({
    sessionId,
    profileId,
    type: "lead_captured",
    payload: { returning },
  });

  return NextResponse.json({ ok: true, returning });
}
