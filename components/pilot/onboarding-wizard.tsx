"use client";

/**
 * Traditioneller Onboarding-Wizard (/piloten/start).
 * Typeform-Gefühl: eine Fragengruppe pro Screen, Fortschrittsbalken,
 * Zustand überlebt Reloads via sessionStorage. Am Ende: Einstufung +
 * geroutete Aktion (Kurs / Assessor-Call mit Slot-Picker / Beispielauftrag).
 */
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  submitOnboarding,
  bookAssessorSlotAction,
  type OnboardingResult,
  type SlotOption,
} from "@/app/(marketing)/piloten/actions";

const STORAGE_KEY = "immohero.pilot-onboarding.v1";

const DRONE_CHIPS = [
  "DJI Mini 4 Pro",
  "DJI Mini 3",
  "DJI Air 3",
  "DJI Mavic 3 Pro",
  "DJI Avata 2",
  "FPV / Selbstbau",
];

const HOUR_SEGMENTS = [
  { label: "Noch keine", value: 0 },
  { label: "1–4 Std.", value: 3 },
  { label: "5–19 Std.", value: 10 },
  { label: "20–49 Std.", value: 30 },
  { label: "50+ Std.", value: 60 },
];

const GOALS = [
  { key: "nebenbei" as const, title: "Nebenbei verdienen", body: "Ein paar Aufträge im Monat, flexibel." },
  { key: "hobby-zum-beruf" as const, title: "Hobby zum Beruf machen", body: "Schritt für Schritt professionell werden." },
  { key: "vollzeit" as const, title: "Vollzeit-Pilot", body: "Maximale Auslastung, volle Karriere." },
];

const AVAILABILITY = [
  { label: "~2 Std./Woche", value: 2 },
  { label: "~5 Std./Woche", value: 5 },
  { label: "~10 Std./Woche", value: 10 },
  { label: "15+ Std./Woche", value: 15 },
];

const LEVEL_LABEL: Record<string, string> = {
  basic: "Einsteiger",
  intermediate: "Fortgeschritten",
  advanced: "Profi",
};

interface Draft {
  step: number;
  name: string;
  email: string;
  plz: string;
  consent: boolean;
  drones: string[];
  customDrone: string;
  noDrone: boolean;
  a1a3: boolean;
  a2: boolean;
  sts: boolean;
  flightHours: number | null;
  hasReFootage: boolean | null;
  portfolio: string;
  goal: "nebenbei" | "hobby-zum-beruf" | "vollzeit" | null;
  availability: number | null;
}

const EMPTY: Draft = {
  step: 0,
  name: "",
  email: "",
  plz: "",
  consent: false,
  drones: [],
  customDrone: "",
  noDrone: false,
  a1a3: false,
  a2: false,
  sts: false,
  flightHours: null,
  hasReFootage: null,
  portfolio: "",
  goal: null,
  availability: null,
};

const TOTAL_STEPS = 5; // 1 Wer · 2 Equipment · 3 Erfahrung · 4 Ziel · 5 Ergebnis

export function OnboardingWizard() {
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OnboardingResult | null>(null);
  const [pending, startTransition] = useTransition();
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setDraft({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, hydrated]);

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));
  const go = (step: number) => {
    setError(null);
    patch({ step });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stepValid = useMemo(() => {
    switch (draft.step) {
      case 1:
        return (
          draft.name.trim().length >= 2 &&
          /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.email) &&
          (draft.plz === "" || /^\d{4,5}$/.test(draft.plz)) &&
          draft.consent
        );
      case 2:
        return draft.noDrone || draft.drones.length > 0 || draft.customDrone.trim().length > 1;
      case 3:
        return draft.flightHours !== null && draft.hasReFootage !== null;
      case 4:
        return draft.goal !== null && draft.availability !== null;
      default:
        return true;
    }
  }, [draft]);

  function submit() {
    setError(null);
    const equipment = [
      ...draft.drones.map((model) => ({ model })),
      ...(draft.customDrone.trim() ? [{ model: draft.customDrone.trim() }] : []),
    ];
    const portfolioLinks = draft.portfolio
      .split(/\s+/)
      .filter((l) => /^https?:\/\//.test(l))
      .slice(0, 5);

    startTransition(async () => {
      const res = await submitOnboarding({
        name: draft.name.trim(),
        email: draft.email.trim(),
        plz: draft.plz.trim(),
        consent: draft.consent,
        website: "",
        equipment: draft.noDrone ? [] : equipment,
        certificates: { a1a3: draft.a1a3, a2: draft.a2, sts: draft.sts },
        flightHours: draft.flightHours ?? 0,
        hasRealEstateFootage: draft.hasReFootage ?? false,
        portfolioLinks: portfolioLinks.length ? portfolioLinks : undefined,
        goal: draft.goal ?? "hobby-zum-beruf",
        availabilityHoursPerWeek: draft.availability ?? 5,
        durationSec: Math.min(3600, Math.round((Date.now() - startedAt.current) / 1000)),
      });
      if (!res.ok) {
        setError(res.error ?? "Das hat nicht geklappt — bitte prüfe deine Angaben.");
        return;
      }
      setResult(res);
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      go(5);
    });
  }

  if (!hydrated) return null;

  /* ------------------------------ Ergebnis ------------------------------ */
  if (draft.step === 5 && result) {
    return <ResultScreen result={result} email={draft.email} />;
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Fortschritt */}
      {draft.step > 0 ? (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-[var(--color-ink-mute)]">
            <span>Schritt {draft.step} von 4</span>
            <span>~3 Minuten</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--color-bg-sunken)]">
            <div
              className="h-full rounded-full bg-[var(--color-brand-1)] transition-all duration-300"
              style={{ width: `${(draft.step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      ) : null}

      {/* Schritt 0: Intro */}
      {draft.step === 0 && (
        <div className="animate-slide-up text-center">
          <p className="label-mono text-[var(--color-brand-2)]">Piloten-Onboarding</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            Finde in 3 Minuten heraus,
            <br />
            was in dir steckt.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-[var(--color-ink-soft)]">
            Vier kurze Schritte — am Ende bekommst du deine Einstufung, deinen Academy-Kurs und
            deinen persönlichen Weg zu bezahlten Aufträgen.
          </p>
          <Button size="xl" className="mt-8" onClick={() => go(1)}>
            Los geht&apos;s →
          </Button>
          <p className="mt-4 text-xs text-[var(--color-ink-mute)]">
            Kostenlos · kein Passwort nötig · DSGVO-konform
          </p>
        </div>
      )}

      {/* Schritt 1: Wer bist du */}
      {draft.step === 1 && (
        <div className="animate-slide-up">
          <h2 className="font-serif text-3xl leading-tight">Wer bist du?</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="ob-name" className="text-sm font-medium">Vorname (oder voller Name)</label>
              <Input
                id="ob-name"
                value={draft.name}
                onChange={(e) => patch({ name: e.target.value })}
                placeholder="z. B. Alex"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="ob-email" className="text-sm font-medium">E-Mail</label>
              <Input
                id="ob-email"
                type="email"
                value={draft.email}
                onChange={(e) => patch({ email: e.target.value })}
                placeholder="du@beispiel.de"
                className="mt-1.5"
              />
              <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
                Hierhin schicken wir deine Einstufung + Login-Link (kein Passwort nötig).
              </p>
            </div>
            <div>
              <label htmlFor="ob-plz" className="text-sm font-medium">
                PLZ <span className="font-normal text-[var(--color-ink-mute)]">(optional — für Aufträge in deiner Nähe)</span>
              </label>
              <Input
                id="ob-plz"
                inputMode="numeric"
                value={draft.plz}
                onChange={(e) => patch({ plz: e.target.value.replace(/\D/g, "").slice(0, 5) })}
                placeholder="33332"
                className="mt-1.5 max-w-[140px]"
              />
            </div>
            <label className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-line)] p-3.5 text-sm">
              <input
                type="checkbox"
                checked={draft.consent}
                onChange={(e) => patch({ consent: e.target.checked })}
                className="mt-0.5 h-4 w-4 accent-[var(--color-brand-1)]"
              />
              <span className="text-[var(--color-ink-3)]">
                Ich bin einverstanden, dass meine Angaben zur Einstufung und Kontaktaufnahme
                gespeichert werden. Details in der{" "}
                <Link href="/datenschutz" className="underline" target="_blank">
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>
          </div>
          <WizardNav onBack={() => go(0)} onNext={() => go(2)} nextDisabled={!stepValid} />
        </div>
      )}

      {/* Schritt 2: Equipment */}
      {draft.step === 2 && (
        <div className="animate-slide-up">
          <h2 className="font-serif text-3xl leading-tight">Womit fliegst du?</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Mehrfachauswahl möglich.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {DRONE_CHIPS.map((model) => {
              const active = draft.drones.includes(model);
              return (
                <button
                  key={model}
                  type="button"
                  onClick={() =>
                    patch({
                      noDrone: false,
                      drones: active ? draft.drones.filter((d) => d !== model) : [...draft.drones, model],
                    })
                  }
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    active
                      ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)] text-[var(--color-brand-ink)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                  }`}
                >
                  {active ? "✓ " : ""}
                  {model}
                </button>
              );
            })}
          </div>
          <div className="mt-4">
            <label htmlFor="ob-custom-drone" className="text-sm font-medium">Anderes Modell</label>
            <Input
              id="ob-custom-drone"
              value={draft.customDrone}
              onChange={(e) => patch({ customDrone: e.target.value, ...(e.target.value ? { noDrone: false } : {}) })}
              placeholder="z. B. Autel EVO Lite+"
              className="mt-1.5"
            />
          </div>
          <button
            type="button"
            onClick={() => patch({ noDrone: !draft.noDrone, drones: [], customDrone: "" })}
            className={`mt-4 w-full rounded-[var(--radius-md)] border p-3.5 text-left text-sm transition-colors ${
              draft.noDrone
                ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                : "border-dashed border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
            }`}
          >
            {draft.noDrone ? "✓ " : ""}Ich habe noch keine Drohne{" "}
            <span className="text-[var(--color-ink-mute)]">— kein Problem, wir beraten dich.</span>
          </button>
          <WizardNav onBack={() => go(1)} onNext={() => go(3)} nextDisabled={!stepValid} />
        </div>
      )}

      {/* Schritt 3: Erfahrung */}
      {draft.step === 3 && (
        <div className="animate-slide-up">
          <h2 className="font-serif text-3xl leading-tight">Deine Erfahrung.</h2>
          <div className="mt-6 space-y-6">
            <div>
              <p className="text-sm font-medium">EU-Nachweise (ehrlich bleiben — wird später geprüft)</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["a1a3", "A1/A3-Nachweis"],
                    ["a2", "A2-Zeugnis"],
                    ["sts", "STS"],
                  ] as const
                ).map(([key, label]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border p-3 text-sm transition-colors ${
                      draft[key]
                        ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft[key]}
                      onChange={(e) => patch({ [key]: e.target.checked } as Partial<Draft>)}
                      className="h-4 w-4 accent-[var(--color-brand-1)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Flugstunden insgesamt</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {HOUR_SEGMENTS.map((seg) => (
                  <button
                    key={seg.value}
                    type="button"
                    onClick={() => patch({ flightHours: seg.value })}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      draft.flightHours === seg.value
                        ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)] text-[var(--color-brand-ink)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                    }`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Hast du schon Immobilien gefilmt oder fotografiert?</p>
              <div className="mt-2 flex gap-2">
                {[
                  { label: "Ja", value: true },
                  { label: "Noch nicht", value: false },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => patch({ hasReFootage: opt.value })}
                    className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                      draft.hasReFootage === opt.value
                        ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)] text-[var(--color-brand-ink)]"
                        : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="ob-portfolio" className="text-sm font-medium">
                Portfolio-Links <span className="font-normal text-[var(--color-ink-mute)]">(optional — YouTube, Insta, Website)</span>
              </label>
              <Input
                id="ob-portfolio"
                value={draft.portfolio}
                onChange={(e) => patch({ portfolio: e.target.value })}
                placeholder="https://…"
                className="mt-1.5"
              />
            </div>
          </div>
          <WizardNav onBack={() => go(2)} onNext={() => go(4)} nextDisabled={!stepValid} />
        </div>
      )}

      {/* Schritt 4: Ziel */}
      {draft.step === 4 && (
        <div className="animate-slide-up">
          <h2 className="font-serif text-3xl leading-tight">Wo soll die Reise hingehen?</h2>
          <div className="mt-6 space-y-2.5">
            {GOALS.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => patch({ goal: g.key })}
                className={`w-full rounded-[var(--radius-md)] border p-4 text-left transition-colors ${
                  draft.goal === g.key
                    ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                }`}
              >
                <p className="font-medium">
                  {draft.goal === g.key ? "✓ " : ""}
                  {g.title}
                </p>
                <p className="mt-0.5 text-sm text-[var(--color-ink-soft)]">{g.body}</p>
              </button>
            ))}
          </div>
          <div className="mt-6">
            <p className="text-sm font-medium">Wie viel Zeit hast du pro Woche?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVAILABILITY.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => patch({ availability: a.value })}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    draft.availability === a.value
                      ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)] text-[var(--color-brand-ink)]"
                      : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-[var(--color-danger)]">{error}</p> : null}
          <WizardNav
            onBack={() => go(3)}
            onNext={submit}
            nextDisabled={!stepValid || pending}
            nextLabel={pending ? "Wird ausgewertet …" : "Einstufung ansehen 🚀"}
          />
        </div>
      )}
    </div>
  );
}

function WizardNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel = "Weiter →",
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled: boolean;
  nextLabel?: string;
}) {
  return (
    <div className="mt-8 flex items-center justify-between">
      <Button variant="ghost" onClick={onBack}>
        ← Zurück
      </Button>
      <Button size="lg" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}

/* ------------------------------ Ergebnis-Screen ------------------------------ */

function ResultScreen({ result, email }: { result: OnboardingResult; email: string }) {
  const level = result.level ?? "basic";
  const score = result.levelScore ?? 0;

  return (
    <div className="mx-auto w-full max-w-xl animate-slide-up">
      <div className="text-center">
        <p className="label-mono text-[var(--color-brand-2)]">Deine Einstufung</p>
        <div className="mx-auto mt-6 grid h-36 w-36 place-items-center rounded-full border-[6px] border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]">
          <div>
            <p className="font-serif text-4xl leading-none text-[var(--color-brand-ink)]">{score}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-mute)]">/ 100</p>
          </div>
        </div>
        <h1 className="mt-5 font-serif text-4xl leading-tight">{LEVEL_LABEL[level]}</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Pilot-Passport Stufe {result.passportLevel ?? 0} von 4
          {result.monthlyEur ? ` · Potenzial ~${result.monthlyEur.toLocaleString("de-DE")} €/Monat` : ""}
        </p>
      </div>

      <Card className="mt-8 bg-[var(--color-brand-softer)] p-5 text-sm">
        📬 <strong>Check dein Postfach ({email}):</strong>{" "}
        {result.magicLinkSent
          ? "Dein Login-Link für den Lernbereich + deine Willkommens-Mail sind unterwegs."
          : "Deine Willkommens-Mail ist unterwegs. Einloggen kannst du dich jederzeit über immohero.org/login."}
      </Card>

      {result.nextAction === "course" ? (
        <Card className="mt-4 p-6">
          <p className="label-mono text-[var(--color-ink-mute)]">Dein nächster Schritt</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight">
            {result.courseTitle ? `Du bist eingeschrieben: ${result.courseTitle}` : "Starte in der Academy"}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Dein Kurs wartet im Lernbereich — Login-Link kommt per E-Mail. Erste Lektion geht auch
            sofort ohne Login:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {result.courseSlug ? (
              <Button asChild>
                <Link href={`/academy/${result.courseSlug}`}>Zum Kurs →</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link href="/academy">Zur Academy →</Link>
              </Button>
            )}
          </div>
        </Card>
      ) : null}

      {result.nextAction === "call" ? (
        <SlotPicker profileId={result.profileId ?? ""} slots={result.slots ?? []} courseTitle={result.courseTitle} />
      ) : null}

      {result.nextAction === "brief" && result.brief ? (
        <Card className="mt-4 p-6">
          <p className="label-mono text-[var(--color-ink-mute)]">Dein Probeauftrag</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight">{result.brief.title}</h2>
          <ol className="mt-4 space-y-2">
            {result.brief.shotlist.map((s) => (
              <li key={s.nr} className="flex gap-3 text-sm">
                <span className="font-mono text-[var(--color-ink-mute)]">{String(s.nr).padStart(2, "0")}</span>
                <span>
                  <strong>{s.name}</strong> — {s.beschreibung}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3 text-sm text-[var(--color-ink-3)]">
            <strong>Abgabe:</strong> {result.brief.abgabe} · {result.brief.deadlineTage} Tage Zeit.
            Schick uns den Link an hello@immohero.org — das Team reviewt persönlich.
          </p>
          <Badge tone="accent" className="mt-4">Besteh das Review → Passport 4</Badge>
        </Card>
      ) : null}

      <p className="mt-8 text-center text-sm text-[var(--color-ink-soft)]">
        Fragen? <button type="button" className="underline" onClick={() => window.ihPilotOpen?.()}>Frag den Guide</button>{" "}
        oder schreib an hello@immohero.org
      </p>
    </div>
  );
}

function SlotPicker({
  profileId,
  slots,
  courseTitle,
}: {
  profileId: string;
  slots: SlotOption[];
  courseTitle?: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ confirmed: boolean; meetUrl?: string | null; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (booked) {
    return (
      <Card className="mt-4 border-[var(--color-brand-1)]/40 bg-[var(--color-brand-softer)] p-6">
        <h2 className="font-serif text-2xl">🎉 {booked.confirmed ? "Termin steht!" : "Anfrage eingegangen!"}</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-3)]">
          {booked.label} ·{" "}
          {booked.confirmed
            ? "Die Kalender-Einladung mit Google-Meet-Link ist per E-Mail unterwegs."
            : "Das Team bestätigt den Termin per E-Mail mit Video-Link."}
        </p>
        {booked.meetUrl ? (
          <p className="mt-2 break-all font-mono text-xs text-[var(--color-ink-3)]">{booked.meetUrl}</p>
        ) : null}
      </Card>
    );
  }

  return (
    <Card className="mt-4 p-6">
      <p className="label-mono text-[var(--color-ink-mute)]">Dein nächster Schritt</p>
      <h2 className="mt-2 font-serif text-2xl leading-tight">Buch dein Assessment-Gespräch.</h2>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        30 Minuten Videocall mit dem Aero-One-Team — danach bist du auf Passport-Stufe 3 und für
        bezahlte Aufträge sichtbar.{courseTitle ? ` (Parallel bist du im Kurs „${courseTitle}" eingeschrieben.)` : ""}
      </p>
      {slots.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
          Gerade sind keine Slots frei — das Team meldet sich per E-Mail bei dir.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {slots.map((s) => (
              <button
                key={s.startIso}
                type="button"
                onClick={() => setPicked(s.startIso)}
                className={`rounded-[var(--radius-md)] border px-4 py-2.5 text-left text-sm transition-colors ${
                  picked === s.startIso
                    ? "border-[var(--color-brand-1)] bg-[var(--color-brand-softer)]"
                    : "border-[var(--color-line)] hover:border-[var(--color-ink-4)]"
                }`}
              >
                {picked === s.startIso ? "✓ " : ""}
                {s.label}
              </button>
            ))}
          </div>
          {error ? <p className="mt-3 text-sm text-[var(--color-danger)]">{error}</p> : null}
          <Button
            className="mt-4"
            size="lg"
            disabled={!picked || pending}
            onClick={() => {
              if (!picked) return;
              setError(null);
              startTransition(async () => {
                const res = await bookAssessorSlotAction(profileId, picked);
                if (!res.ok) {
                  setError(res.error ?? "Buchung fehlgeschlagen — bitte anderen Slot wählen.");
                  return;
                }
                const label = slots.find((s) => s.startIso === picked)?.label ?? "";
                setBooked({ confirmed: Boolean(res.confirmed), meetUrl: res.meetUrl, label });
              });
            }}
          >
            {pending ? "Wird gebucht …" : "Verbindlich buchen ✓"}
          </Button>
        </>
      )}
    </Card>
  );
}
