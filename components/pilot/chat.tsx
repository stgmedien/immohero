"use client";

/**
 * Chat-UI der Pilot Journey Engine (läuft im Widget-iframe und standalone).
 * SSE-Streaming, Tool-Status, E-Mail-Gate, Session in localStorage.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { mdLite } from "@/lib/markdown";
import type { Locale } from "@/lib/i18n";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const TOOL_LABELS: Record<string, { de: string; en: string }> = {
  update_pilot_profile: { de: "Profil wird aktualisiert …", en: "Updating profile …" },
  search_regulations: { de: "Suche in EU-Verordnungen & Handbüchern …", en: "Searching regulations & manuals …" },
  compute_earnings_estimate: { de: "Verdienst wird berechnet …", en: "Calculating earnings …" },
  recommend_equipment: { de: "Equipment-Katalog wird durchsucht …", en: "Checking equipment catalog …" },
  get_call_slots: { de: "Freie Termine werden geladen …", en: "Loading available slots …" },
  book_assessor_call: { de: "Termin wird gebucht …", en: "Booking your call …" },
  generate_sample_brief: { de: "Beispielauftrag wird erstellt …", en: "Generating sample brief …" },
  register_pilot: { de: "Registrierung im Piloten-Pool …", en: "Registering you in the pool …" },
};

function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("ih_pilot_session");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ih_pilot_session", id);
  }
  return id;
}

export function PilotChat({
  persona,
  locale,
  greeting,
  quickChips,
  embedded,
}: {
  persona: string;
  locale: Locale;
  greeting: string;
  quickChips: string[];
  embedded: boolean;
}) {
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const [showGate, setShowGate] = useState(false);
  const [gateEmail, setGateEmail] = useState("");
  const [gateName, setGateName] = useState("");
  const [gateConsent, setGateConsent] = useState(false);
  const [gateBusy, setGateBusy] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, toolStatus, showGate]);

  const send = useCallback(
    async (text: string) => {
      const msg = text.trim();
      if (!msg || busy) return;
      setBusy(true);
      setInput("");
      setMessages((m) => [...m, { role: "user", content: msg }, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/pilot-engine/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionId(), message: msg, persona, locale }),
        });
        if (res.status === 503) {
          setNotConfigured(true);
          setMessages((m) => m.slice(0, -1));
          return;
        }
        if (res.status === 429) {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: locale === "en" ? "Daily limit reached — please come back tomorrow." : "Tageslimit erreicht — bitte morgen wiederkommen.",
            };
            return copy;
          });
          return;
        }
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let gotGate = false;

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            let ev: { t: string; text?: string; name?: string; message?: string };
            try {
              ev = JSON.parse(line.slice(5));
            } catch {
              continue;
            }
            if (ev.t === "delta" && ev.text) {
              setToolStatus(null);
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + ev.text };
                return copy;
              });
            } else if (ev.t === "tool" && ev.name) {
              const label = TOOL_LABELS[ev.name];
              setToolStatus(label ? label[locale] : ev.name);
            } else if (ev.t === "gate") {
              gotGate = true;
            } else if (ev.t === "error" && ev.message) {
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: ev.message! };
                return copy;
              });
            }
          }
        }

        if (gotGate) {
          setMessages((m) => m.slice(0, -1));
          setPendingMessage(msg);
          setShowGate(true);
        }
      } catch {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content: locale === "en" ? "Connection hiccup — please send again." : "Kurzer Verbindungs-Schluckauf — bitte nochmal senden.",
          };
          return copy;
        });
      } finally {
        setToolStatus(null);
        setBusy(false);
      }
    },
    [busy, locale, persona],
  );

  async function submitGate() {
    if (!gateEmail || !gateConsent || gateBusy) return;
    setGateBusy(true);
    try {
      const res = await fetch("/api/pilot-engine/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId(), email: gateEmail, name: gateName, consent: gateConsent }),
      });
      const data = (await res.json()) as { ok: boolean; returning?: boolean };
      if (data.ok) {
        setShowGate(false);
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: data.returning
              ? locale === "en"
                ? "Welcome back! I've got your profile — let's continue."
                : "Willkommen zurück! Ich habe dein Profil — weiter geht's."
              : locale === "en"
                ? "Saved — your progress is now linked to your email. Let's continue!"
                : "Gespeichert — dein Fortschritt ist jetzt mit deiner E-Mail verknüpft. Weiter geht's!",
          },
        ]);
        if (pendingMessage) {
          const pm = pendingMessage;
          setPendingMessage(null);
          void send(pm);
        }
      }
    } finally {
      setGateBusy(false);
    }
  }

  const T = (de: string, en: string) => (locale === "en" ? en : de);

  return (
    <div className={`flex h-full flex-col bg-[var(--color-bg)] ${embedded ? "" : "mx-auto max-w-2xl rounded-2xl border border-[var(--color-line)] shadow-lg"}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-ink)] px-4 py-3 text-white">
        <div>
          <p className="text-sm font-semibold">{persona === "recruiter" ? "ImmoHero Pilot-Scout" : "Aero One Academy Guide"}</p>
          <p className="text-[11px] opacity-70">{T("Rechtssicher · zitiert Quellen · keine Rechtsberatung", "Legally grounded · cites sources · not legal advice")}</p>
        </div>
        {embedded && (
          <button
            onClick={() => window.parent.postMessage("ih-pilot-close", "*")}
            className="rounded p-1 opacity-70 hover:opacity-100"
            aria-label={T("Schließen", "Close")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-[var(--color-ink)] px-3.5 py-2.5 text-sm text-white"
                  : "max-w-[92%] rounded-2xl rounded-bl-md border border-[var(--color-line)] bg-white px-3.5 py-2.5 text-sm"
              }
            >
              {m.role === "assistant" ? (
                <div className="space-y-2 [&_a]:break-all" dangerouslySetInnerHTML={{ __html: mdLite(m.content || "…") }} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {toolStatus && (
          <div className="flex items-center gap-2 text-xs text-[var(--color-ink-mute)]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-primary)]" />
            {toolStatus}
          </div>
        )}

        {notConfigured && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
            {T(
              "Der Guide wird gerade eingerichtet (API-Key fehlt noch). Schau in Kürze wieder vorbei!",
              "The guide is being set up (API key pending). Please check back soon!",
            )}
          </div>
        )}

        {/* E-Mail-Gate */}
        {showGate && (
          <div className="rounded-xl border border-[var(--color-line)] bg-white p-4">
            <p className="text-sm font-medium">{T("Kurz speichern, dann geht's weiter", "Quick save, then we continue")}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">
              {T(
                "Damit dein Profil & Fortschritt nicht verloren gehen (und du beim nächsten Besuch weitermachen kannst).",
                "So your profile & progress aren't lost (and you can continue next time).",
              )}
            </p>
            <input
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              placeholder={T("Vorname (optional)", "First name (optional)")}
              className="mt-3 w-full rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm"
            />
            <input
              value={gateEmail}
              onChange={(e) => setGateEmail(e.target.value)}
              type="email"
              placeholder="E-Mail"
              className="mt-2 w-full rounded-lg border border-[var(--color-line)] px-3 py-2 text-sm"
            />
            <label className="mt-2 flex items-start gap-2 text-[11px] text-[var(--color-ink-soft)]">
              <input type="checkbox" checked={gateConsent} onChange={(e) => setGateConsent(e.target.checked)} className="mt-0.5" />
              <span>
                {T(
                  "Ich bin einverstanden, dass mein Profil gespeichert wird und ich Infos zur Academy/Aufträgen erhalte. Widerruf jederzeit.",
                  "I agree that my profile is stored and I receive academy/job info. Revocable anytime.",
                )}
              </span>
            </label>
            <button
              onClick={submitGate}
              disabled={!gateEmail || !gateConsent || gateBusy}
              className="mt-3 w-full rounded-lg bg-[var(--color-ink)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {gateBusy ? "…" : T("Speichern & weiter", "Save & continue")}
            </button>
          </div>
        )}

        {/* Quick chips (nur am Anfang) */}
        {messages.length <= 1 && !showGate && (
          <div className="flex flex-wrap gap-2 pt-1">
            {quickChips.map((chip) => (
              <button
                key={chip}
                onClick={() => void send(chip)}
                className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-xs hover:border-[var(--color-ink)]"
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-[var(--color-line)] bg-white p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={busy || showGate}
            placeholder={T("Frag mich was — z. B. „Darf ich über Wohngebiete fliegen?“", "Ask me anything — e.g. “Can I fly over residential areas?”")}
            maxLength={2000}
            className="flex-1 rounded-xl border border-[var(--color-line)] px-3.5 py-2.5 text-sm focus:border-[var(--color-ink)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy || !input.trim() || showGate}
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            aria-label={T("Senden", "Send")}
          >
            {busy ? "…" : "➤"}
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-[var(--color-ink-mute)]">
          {T("KI-Guide · kann Fehler machen · keine Rechtsberatung", "AI guide · may make mistakes · not legal advice")}
        </p>
      </div>
    </div>
  );
}
