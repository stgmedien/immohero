import { Badge } from "@/components/ui/badge";
import { LeadForm } from "@/components/messe/lead-form";

export default function MessePage() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <div className="text-center">
        <Badge tone="brand-soft" className="mx-auto">
          Nur am Messestand
        </Badge>
        <h1 className="mt-4 font-serif text-4xl leading-[1.1] sm:text-5xl">
          15 € geschenkt für deine
          <br className="hidden sm:block" /> erste Immobilien-Buchung.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-[var(--color-ink-soft)] text-pretty">
          Trag dich kurz ein — du bekommst sofort deinen persönlichen Gutschein-Code,
          auch per E-Mail. Einlösbar auf Fotografie, Drohne, Video, 360°, Grundrisse & mehr.
        </p>
      </div>

      <div className="mt-8">
        <LeadForm />
      </div>

      <ul className="mx-auto mt-8 flex max-w-md flex-col gap-2 text-sm text-[var(--color-ink-soft)]">
        <li className="flex items-center gap-2">
          <span className="text-[var(--color-primary)]">✓</span>
          15 € Rabatt auf deine erste Buchung
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[var(--color-primary)]">✓</span>
          Einlösbar ab 199 € Bestellwert · 90 Tage gültig
        </li>
        <li className="flex items-center gap-2">
          <span className="text-[var(--color-primary)]">✓</span>
          Profi-Immobilienmedien in OWL & NRW, Lieferung in 48 Std.
        </li>
      </ul>
    </section>
  );
}
