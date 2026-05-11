const FAQS = [
  {
    q: "Wo seid ihr aktiv?",
    a: "Ostwestfalen-Lippe (OWL) und das übrige Nordrhein-Westfalen — von Bielefeld, Gütersloh und Paderborn bis Köln und Düsseldorf. Eine Postleitzahl-Prüfung erfolgt direkt im Buchungsfunnel.",
  },
  {
    q: "Wie schnell bekomme ich meine Bilder?",
    a: "Standardlieferung innerhalb von 48 Stunden nach dem Shooting. Videos & 360°-Touren benötigen meist 3–5 Werktage je nach Umfang.",
  },
  {
    q: "Was, wenn das Wetter nicht mitspielt?",
    a: "Wir behalten die Wettervorhersage im Blick und verschieben Drohnenflüge ggf. kostenfrei. Innenaufnahmen finden immer statt — du wirst proaktiv benachrichtigt.",
  },
  {
    q: "Welche Nutzungsrechte habe ich?",
    a: "Du erhältst zeitlich und räumlich unbeschränkte Nutzungsrechte für die Vermarktung der jeweiligen Immobilie inkl. Online-Portale, Social Media und Print-Exposés.",
  },
  {
    q: "Wer fliegt die Drohne?",
    a: "Ein zertifizierter Drohnenpilot mit EU-Kenntnisnachweis (A1/A3 und A2). Wir halten alle Auflagen der Luftverkehrsordnung ein.",
  },
  {
    q: "Kann ich nachträglich Services hinzubuchen?",
    a: "Ja — solange das Shooting noch nicht abgeschlossen ist. Über den Kundenbereich kannst du jederzeit nachbuchen, eine Rechnung wird automatisch erstellt.",
  },
];

export function FAQ() {
  return (
    <section className="container-page py-20" id="faq">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Häufige Fragen</p>
        <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Klarheit, bevor du buchst.</h2>
      </div>
      <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
        {FAQS.map((item) => (
          <details key={item.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl tracking-tight">
              {item.q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--color-line)] text-lg transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pt-3 text-sm text-[var(--color-ink-soft)] text-pretty md:max-w-[80%]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
