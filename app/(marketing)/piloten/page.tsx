import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EarningsTeaser } from "@/components/pilot/earnings-teaser";
import { OpenGuideButton } from "@/components/pilot/open-guide-button";
import { REF_PER_PROJECT_EUR } from "@/lib/pilot/earnings";

export const metadata: Metadata = {
  title: "Werde Drohnen-Pilot — Mach dein Hobby zum Beruf",
  description:
    "Verdiene mit deiner Drohne echtes Geld: Aero One × ImmoHero bildet dich aus, stuft dich fair ein und vermittelt dir bezahlte Immobilien-Aufträge in OWL & NRW. Ø 339 € pro Projekt.",
};

const PROCESS = [
  {
    n: "01",
    title: "Einstufung in 3 Minuten",
    body: "Equipment, Erfahrung, Ziele — unser Onboarding stuft dich fair und transparent ein. Sofortiges Ergebnis, kein Bewerbungsstress.",
  },
  {
    n: "02",
    title: "Academy & Assessment",
    body: "Kostenlose Kurse zu Drohnenrecht und Immobilien-Aufnahmen. Fortgeschrittene buchen direkt das Assessment-Videogespräch.",
  },
  {
    n: "03",
    title: "Probeauftrag fliegen",
    body: "Du bekommst einen echten ImmoHero-Beispielauftrag mit Shotliste aus der Produktion — und beweist, was du kannst.",
  },
  {
    n: "04",
    title: "Bezahlte Aufträge",
    body: `Ab Passport-Stufe 3 wirst du für echte Aufträge sichtbar. Ø ${REF_PER_PROJECT_EUR} € pro Projekt, faire Abrechnung über die Plattform.`,
  },
];

const PASSPORT = [
  { level: 1, title: "Profil vollständig", body: "Deine Basis steht: Equipment, Nachweise, Erfahrung." },
  { level: 2, title: "A1/A3-Nachweis", body: "Der EU-Kompetenznachweis — in der Academy in 4 Wochen machbar." },
  { level: 3, title: "Assessment bestanden", body: "30 Minuten Videogespräch mit dem Team. Danach: sichtbar für bezahlte Aufträge." },
  { level: 4, title: "Probeauftrag eingereicht", body: "Dein Material überzeugt — du bist voll freigeschaltet." },
];

const FAQ = [
  {
    q: "Brauche ich schon eine Drohne?",
    a: "Nein. Im Onboarding sagst du einfach: noch keine Drohne — wir beraten dich, welches Gerät zu deinem Budget passt und ImmoHero-ready ist (los geht's ab ~300 €).",
  },
  {
    q: "Wie alt muss ich sein?",
    a: "Für den EU-Kompetenznachweis A1/A3 gilt in Deutschland ein Mindestalter von 16 Jahren. Lernen und üben kannst du bei uns schon vorher.",
  },
  {
    q: "Was verdiene ich wirklich?",
    a: `Unsere Referenz ist die echte Plattform-Auszahlung: Ø ${REF_PER_PROJECT_EUR} € pro Drohnen-Projekt. Nebenberuflich sind 2–6 Projekte im Monat realistisch — der Rechner oben zeigt dir dein Potenzial.`,
  },
  {
    q: "Welche Scheine brauche ich?",
    a: "Für die meisten Immobilien-Flüge den EU-Kompetenznachweis A1/A3, oft zusätzlich das A2-Fernpiloten-Zeugnis. Beides begleiten wir in der Academy — inklusive Prüfungsvorbereitung.",
  },
  {
    q: "Ist das seriös? Wer steckt dahinter?",
    a: "Aero One ist ein Schülerunternehmen aus Gütersloh und betreibt mit ImmoHero eine echte Immobilienmedien-Plattform mit zahlenden Kunden in OWL & NRW. Jede Einstufung ist deterministisch und nachvollziehbar — keine Blackbox.",
  },
  {
    q: "Was kostet mich das?",
    a: "Einstufung, Grundlagen-Kurse und der Pilot-Passport sind kostenlos. Du investierst nur in dein eigenes Equipment und ggf. amtliche Prüfungsgebühren.",
  },
];

export default function PilotenPage() {
  return (
    <>
      {/* ------------------------------- Hero ------------------------------- */}
      <section className="container-page pt-14 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="label-mono text-[var(--color-brand-2)]">Aero One × ImmoHero · Piloten-Programm</p>
            <h1 className="mt-4 font-serif text-5xl leading-[1.02] md:text-7xl">
              Mach dein Hobby
              <br />
              zum <span className="text-brand-grad">Beruf.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-[var(--color-ink-soft)]">
              Du fliegst gern Drohne? Wir sind das am schnellsten wachsende
              Immobilienvermarktungs-Startup der Region — und suchen Piloten wie dich. Ausbildung,
              faire Einstufung, echte bezahlte Aufträge. Alles auf einer Plattform.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="xl">
                <Link href="/piloten/start">In 3 Minuten starten →</Link>
              </Button>
              <OpenGuideButton>Lieber im Chat? Frag den Guide</OpenGuideButton>
            </div>
            <dl className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-[var(--color-line)] pt-6">
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Ø pro Projekt</dt>
                <dd className="mt-1 font-serif text-3xl">{REF_PER_PROJECT_EUR} €</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Einstufung</dt>
                <dd className="mt-1 font-serif text-3xl">3 Min.</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Passport-Stufen</dt>
                <dd className="mt-1 font-serif text-3xl">0–4</dd>
              </div>
            </dl>
          </div>
          <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[28px] lg:block">
            <Image
              src="/hero/03.jpg"
              alt="Drohnenaufnahme einer Immobilie"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 40vw, 0px"
              priority
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-4 py-2 text-sm shadow-[var(--shadow-card)] backdrop-blur">
              📍 Echte ImmoHero-Produktion, OWL
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Verdienst-Rechner --------------------------- */}
      <section className="container-page py-16 md:py-20" id="verdienst">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Rechne selbst</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
            Was dein Hobby wert ist.
          </h2>
        </div>
        <EarningsTeaser />
      </section>

      {/* ------------------------------- Prozess ------------------------------- */}
      <section className="container-page py-8 md:py-12">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Dein Weg</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
            Vom ersten Flug zum ersten Auftrag.
          </h2>
        </div>
        <ol className="grid gap-6 md:grid-cols-4">
          {PROCESS.map((step) => (
            <li
              key={step.n}
              className="rounded-[var(--radius-lg)] border border-[var(--color-line)] bg-[var(--color-bg-elev)] p-6"
            >
              <p className="font-serif text-3xl text-[var(--color-brand-3)]">{step.n}</p>
              <h3 className="mt-3 font-serif text-xl leading-tight">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------- Pilot-Passport ---------------------------- */}
      <section className="container-page py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Pilot-Passport</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
              Vier Stufen. Null Willkür.
            </h2>
            <p className="mt-4 text-[var(--color-ink-soft)]">
              Dein Fortschritt wird deterministisch berechnet — aus Nachweisen, Flugstunden und
              Ergebnissen, nicht aus Bauchgefühl. Jede Stufe schaltet echte Vorteile frei, und du
              siehst jederzeit, was dir zur nächsten fehlt.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/piloten/start">Meine Stufe herausfinden →</Link>
            </Button>
          </div>
          <ol className="space-y-3">
            {PASSPORT.map((p) => (
              <li key={p.level}>
                <Card className="flex items-start gap-4 p-5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--color-brand-1)] font-serif text-lg text-white">
                    {p.level}
                  </span>
                  <div>
                    <p className="font-medium">
                      {p.title}
                      {p.level === 3 ? (
                        <Badge tone="accent" className="ml-2">
                          Aufträge freigeschaltet
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{p.body}</p>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------ Equipment ------------------------------ */}
      <section className="container-page py-8">
        <Card className="grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <div>
            <h2 className="font-serif text-3xl leading-tight">Noch keine Drohne? Kein Problem.</h2>
            <p className="mt-2 max-w-xl text-[var(--color-ink-soft)]">
              Sag im Onboarding einfach „noch keine Drohne" — wir zeigen dir, welche Geräte
              ImmoHero-ready sind und was zu deinem Budget passt. Ehrliche Empfehlungen, keine
              Affiliate-Links.
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/piloten/start">Beratung im Onboarding →</Link>
          </Button>
        </Card>
      </section>

      {/* --------------------------------- FAQ --------------------------------- */}
      <section className="container-page py-16 md:py-20">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">FAQ</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Klartext für Piloten.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ.map((item) => (
            <Card key={item.q} className="p-6">
              <h3 className="font-medium">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{item.a}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ------------------------------ Abschluss-CTA ------------------------------ */}
      <section className="container-page pb-20">
        <div className="overflow-hidden rounded-[24px] bg-[var(--color-ink)] p-10 text-[var(--color-primary-ink)] md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm uppercase tracking-wider text-[var(--color-primary)]">
                Bereit für den ersten bezahlten Flug?
              </p>
              <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
                Dein Hobby wartet auf die Beförderung.
              </h2>
              <p className="mt-3 max-w-xl text-[var(--color-primary-soft)]/90">
                3 Minuten Onboarding, sofortige Einstufung, direkter Zugang zur Academy — und der
                klare Weg zu echten Aufträgen.
              </p>
            </div>
            <Button asChild size="xl" variant="accent" className="self-start md:self-center">
              <Link href="/piloten/start">Jetzt Pilot werden →</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
