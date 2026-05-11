import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Direkter Kontakt zum ImmoHero-Team.",
};

export default function KontaktPage() {
  return (
    <section className="container-page py-16 md:py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Kontakt</p>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">Wir sind direkt erreichbar.</h1>
          <p className="text-lg text-[var(--color-ink-soft)]">
            Du hast eine Frage zu einem bestehenden Auftrag, möchtest ein größeres Projekt besprechen oder brauchst eine individuelle Lösung? Schreib uns direkt — wir antworten meist innerhalb weniger Stunden.
          </p>
        </div>
        <aside className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <h2 className="font-serif text-2xl">Direktkontakt</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="E-Mail" value="jonathan@stg-medien.com" href="mailto:jonathan@stg-medien.com" />
            <Row label="Telefon" value="+49 159 06828161" href="tel:+4915906828161" />
            <Row label="Adresse" value="Freiherr-vom-Stein-Straße 7, 33332 Gütersloh" />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</dt>
      <dd className="mt-0.5">
        {href ? (
          <a href={href} className="hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
