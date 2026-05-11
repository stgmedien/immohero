import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen von ImmoHero.",
};

export default function AGBPage() {
  return (
    <section className="container-narrow py-16 md:py-20">
      <h1 className="font-serif text-5xl">AGB</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Stand: Mai 2026.</p>
      <p className="mt-4 rounded-lg border border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)]/30 p-4 text-sm text-[var(--color-accent)]">
        Diese AGB sind ein Erstentwurf und sollten vor Live-Gang anwaltlich geprüft werden.
      </p>

      <div className="prose mt-10 max-w-none text-[var(--color-ink-soft)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[var(--color-ink)] [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-sm [&_li]:text-sm">
        <h2>1. Geltungsbereich</h2>
        <p>
          Diese AGB gelten für alle über immohero.org gebuchten Leistungen zwischen Jonathan Kreutzheide (nachfolgend „ImmoHero") und dem Kunden.
        </p>

        <h2>2. Vertragsschluss</h2>
        <p>
          Mit der Online-Buchung und erfolgreicher Bezahlung über Stripe kommt ein verbindlicher Werkvertrag zustande. Die Auftragsbestätigung wird per E-Mail versendet.
        </p>

        <h2>3. Leistungsumfang</h2>
        <p>
          Der Umfang der Leistungen ergibt sich aus dem gebuchten Paket bzw. den ausgewählten Einzelservices. ImmoHero erbringt diese fachgerecht und unter Einsatz qualifizierter Mitarbeiter und Subunternehmer.
        </p>

        <h2>4. Mitwirkungspflichten</h2>
        <p>
          Der Kunde stellt den Zugang zur Immobilie sicher und liefert relevante Informationen (z. B. Hausnummer, Schlüsselübergabe) rechtzeitig vor dem Termin.
        </p>

        <h2>5. Stornierung und Terminverschiebung</h2>
        <ul className="list-disc pl-5">
          <li>Stornierung mehr als 48 Std. vor Termin: kostenfrei.</li>
          <li>Stornierung 24–48 Std. vor Termin: 30 % der Auftragssumme.</li>
          <li>Stornierung &lt; 24 Std. vor Termin oder No-Show: 50 % der Auftragssumme.</li>
          <li>Wetterbedingte Verschiebungen (Drohne) sind kostenfrei.</li>
        </ul>

        <h2>6. Lieferung</h2>
        <p>
          Die Standardlieferzeit beträgt 48 Stunden nach Shooting für Fotos und 3–5 Werktage für Videos/360°-Touren. Lieferung digital über den Kundenbereich.
        </p>

        <h2>7. Nutzungsrechte</h2>
        <p>
          Der Kunde erhält für die jeweilige Immobilie ein einfaches, zeitlich und räumlich unbeschränktes Nutzungsrecht für die Bewerbung dieser Immobilie (inkl. Portale, Social Media, Print-Exposé). Eine darüber hinausgehende Nutzung (z. B. eigene Werbekampagne unabhängig von der Immobilie) bedarf gesonderter Vereinbarung.
        </p>

        <h2>8. Zahlung</h2>
        <p>
          Die Bezahlung erfolgt vorab über Stripe (Karte, SEPA, Klarna, PayPal). Rechnung wird elektronisch übermittelt.
        </p>

        <h2>9. Haftung</h2>
        <p>
          ImmoHero haftet unbeschränkt bei Vorsatz und grober Fahrlässigkeit. Bei einfacher Fahrlässigkeit haftet ImmoHero nur bei Verletzung wesentlicher Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren Schaden.
        </p>

        <h2>10. Widerrufsrecht</h2>
        <p>
          Verbraucher haben grundsätzlich ein 14-tägiges Widerrufsrecht. Bei Dienstleistungen erlischt dieses, sobald die Leistung mit ausdrücklicher Zustimmung des Verbrauchers vollständig erbracht ist. Mit dem Buchen eines Termins binnen 14 Tagen ab Buchung erklärt der Verbraucher sein Einverständnis, dass das Widerrufsrecht mit vollständiger Erbringung der Leistung erlischt.
        </p>

        <h2>11. Schlussbestimmungen</h2>
        <p>
          Es gilt deutsches Recht. Gerichtsstand für Kaufleute ist Gütersloh. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.
        </p>
      </div>
    </section>
  );
}
