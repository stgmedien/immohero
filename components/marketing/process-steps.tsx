const STEPS = [
  {
    n: "01",
    title: "Online buchen",
    body: "Wähle Paket oder Einzelservices, gib deine Adresse und das passende Zeitfenster an.",
  },
  {
    n: "02",
    title: "Bezahlen & bestätigen",
    body: "Sichere Online-Bezahlung per Karte, SEPA oder Klarna. Bestätigung direkt im Postfach.",
  },
  {
    n: "03",
    title: "Shooting vor Ort",
    body: "Unser zertifiziertes Team kommt zu deinem Termin — punktgenau, freundlich, in 1–3 Stunden.",
  },
  {
    n: "04",
    title: "Lieferung in 48 Stunden",
    body: "Bilder, Video, Plan und Tour landen in deinem Kundenbereich — bereit für Portal und Exposé.",
  },
];

export function ProcessSteps() {
  return (
    <section className="container-page py-20">
      <div className="mb-12 max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">So funktioniert ImmoHero</p>
        <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">In vier Schritten zum fertigen Exposé.</h2>
      </div>
      <ol className="grid gap-6 md:grid-cols-4">
        {STEPS.map((step) => (
          <li key={step.n} className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <p className="font-serif text-3xl text-[var(--color-accent)]">{step.n}</p>
            <h3 className="mt-3 font-serif text-xl leading-tight">{step.title}</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
