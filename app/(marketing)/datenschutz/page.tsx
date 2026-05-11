import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Informationen zur Verarbeitung personenbezogener Daten nach DSGVO.",
};

export default function DatenschutzPage() {
  return (
    <section className="container-narrow py-16 md:py-20">
      <h1 className="font-serif text-5xl">Datenschutzerklärung</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Stand: Mai 2026.</p>

      <div className="prose mt-10 max-w-none text-[var(--color-ink-soft)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[var(--color-ink)] [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-sm [&_li]:text-sm">
        <h2>1. Verantwortlicher</h2>
        <p>
          Verantwortlicher im Sinne der DSGVO ist Jonathan Kreutzheide, Freiherr-vom-Stein-Straße 7, 33332 Gütersloh. Kontakt:{" "}
          <a href="mailto:jonathan@stg-medien.com" className="underline">jonathan@stg-medien.com</a>.
        </p>

        <h2>2. Erhobene Daten</h2>
        <p>Im Rahmen der Buchung und Vertragsabwicklung verarbeiten wir:</p>
        <ul className="list-disc pl-5">
          <li>Stammdaten (Name, Adresse, E-Mail, Telefon)</li>
          <li>Auftragsdaten (Objektadresse, gebuchte Leistungen, Termine)</li>
          <li>Zahlungsdaten (an Stripe übermittelt — wir speichern keine Kreditkartendaten)</li>
          <li>Login-Daten (E-Mail für Magic-Link-Authentifizierung)</li>
          <li>Asset-Metadaten (hochgeladene Dateien, Aufnahmezeitpunkt)</li>
        </ul>

        <h2>3. Zwecke und Rechtsgrundlagen</h2>
        <p>
          Die Verarbeitung erfolgt zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) sowie zur Wahrung berechtigter Interessen (Art. 6 Abs. 1 lit. f DSGVO), insbesondere zur Sicherstellung des Betriebs und zur Verhinderung von Missbrauch.
        </p>

        <h2>4. Auftragsverarbeiter</h2>
        <p>Wir setzen folgende Dienstleister ein:</p>
        <ul className="list-disc pl-5">
          <li><strong>Vercel Inc.</strong> (Hosting) — USA mit Standardvertragsklauseln.</li>
          <li><strong>Neon Inc.</strong> (Datenbank) — EU-Region.</li>
          <li><strong>Stripe Payments Europe Ltd.</strong> (Zahlungsabwicklung) — Irland.</li>
          <li><strong>Resend Inc.</strong> (Transaktionsmails) — USA mit Standardvertragsklauseln.</li>
        </ul>

        <h2>5. Speicherdauer</h2>
        <p>
          Wir speichern personenbezogene Daten so lange, wie sie für die jeweiligen Zwecke benötigt werden. Rechnungen werden gemäß § 147 AO 10 Jahre archiviert.
        </p>

        <h2>6. Deine Rechte</h2>
        <p>
          Du hast jederzeit das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21). Beschwerden kannst du bei der Landesbeauftragten für Datenschutz NRW einreichen.
        </p>

        <h2>7. Cookies</h2>
        <p>
          Wir setzen ausschließlich technisch erforderliche Cookies (Session, CSRF). Es findet kein Tracking statt; keine Drittparty-Skripte zu Werbezwecken.
        </p>

        <h2>8. Kontakt</h2>
        <p>
          Datenschutzanfragen an{" "}
          <a href="mailto:jonathan@stg-medien.com" className="underline">jonathan@stg-medien.com</a>.
        </p>
      </div>
    </section>
  );
}
