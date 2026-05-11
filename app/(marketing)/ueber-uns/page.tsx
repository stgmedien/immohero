import type { Metadata } from "next";
import { CtaStrip } from "@/components/marketing/cta-strip";

export const metadata: Metadata = {
  title: "Über uns",
  description: "Wer hinter ImmoHero steckt — ein kleines Team aus OWL für Immobilienmedien in NRW.",
};

export default function UeberUnsPage() {
  return (
    <>
      <section className="container-page py-16 md:py-20">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Über uns</p>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">Lokales Team, kuratierte Qualität.</h1>
          <p className="text-lg text-[var(--color-ink-soft)] text-pretty">
            ImmoHero wurde gegründet, um Maklern und privaten Verkäufern in OWL und NRW einen einzigen, verlässlichen Ansprechpartner für hochwertige Immobilienmedien zu geben.
          </p>
          <p className="text-[var(--color-ink-soft)] text-pretty">
            Unser Team besteht aus zertifizierten Fotograf:innen, Drohnenpiloten mit EU-Kenntnisnachweis und Editor:innen — alle in der Region zuhause. Wir kommen vorbei, machen die Aufnahmen, bearbeiten alles in unserer eigenen Postproduktion und liefern fertige Dateien innerhalb von 48 Stunden.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <Pillar title="Vor Ort gefilmt" body="Wir kennen unsere Region — Bielefeld, Gütersloh, Paderborn bis Köln und Düsseldorf. Kurze Wege, schnelle Termine." />
          <Pillar title="Saubere Lieferung" body="Standardisierte Workflows für Foto, Drohne, Video und 360°. Du bekommst, was du erwartest — pünktlich und sauber benannt." />
          <Pillar title="Persönlich" body="Ein direkter Ansprechpartner für jedes Projekt. Keine Hotline, keine Tickets." />
        </div>
      </section>

      <CtaStrip />
    </>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <h3 className="font-serif text-2xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{body}</p>
    </div>
  );
}
