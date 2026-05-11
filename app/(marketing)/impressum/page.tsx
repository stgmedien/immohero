import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung gemäß § 5 DDG.",
};

export default function ImpressumPage() {
  return (
    <section className="container-narrow py-16 md:py-20">
      <h1 className="font-serif text-5xl">Impressum</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Angaben gemäß § 5 DDG.</p>

      <div className="prose mt-10 max-w-none text-[var(--color-ink-soft)] [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:text-[var(--color-ink)] [&_h2]:mt-8 [&_h2]:mb-2 [&_p]:text-sm">
        <h2>Anbieter</h2>
        <p>
          Jonathan Kreutzheide
          <br />
          Freiherr-vom-Stein-Straße 7
          <br />
          33332 Gütersloh
          <br />
          Deutschland
        </p>

        <h2>Kontakt</h2>
        <p>
          Telefon: +49 159 06828161
          <br />
          E-Mail: <a href="mailto:jonathan@stg-medien.com" className="underline">jonathan@stg-medien.com</a>
        </p>

        <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Jonathan Kreutzheide (Anschrift wie oben)</p>

        <h2>Umsatzsteuer-Identifikationsnummer</h2>
        <p>USt-ID folgt nach Eintragung. Gegebenenfalls Kleinunternehmer gemäß § 19 UStG — auf Rechnungen ausgewiesen.</p>

        <h2>EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" className="underline" target="_blank" rel="noreferrer">
            ec.europa.eu/consumers/odr
          </a>
          . Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2>Haftung für Inhalte</h2>
        <p>
          Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen.
        </p>
      </div>
    </section>
  );
}
