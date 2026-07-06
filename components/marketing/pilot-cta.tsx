import Link from "next/link";
import { Button } from "@/components/ui/button";
import { REF_PER_PROJECT_EUR } from "@/lib/pilot/earnings";

/**
 * Homepage-Sektion: Piloten-Recruiting ("Mach dein Hobby zum Beruf").
 * Bewusst prominenter Kontrast-Block — der zweite Funnel der Plattform.
 */
export function PilotCta() {
  return (
    <section className="container-page py-12">
      <div className="overflow-hidden rounded-[24px] border border-[var(--color-brand-1)]/30 bg-[var(--color-brand-softer)] p-10 md:p-14">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="label-mono text-[var(--color-brand-2)]">Du fliegst Drohne?</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
              Mach dein Hobby zum Beruf.
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-ink-soft)]">
              Werde Pilot beim am schnellsten wachsenden Immobilienvermarktungs-Startup der Region:
              kostenlose Academy, faire Einstufung in 3 Minuten und echte Aufträge mit
              Ø {REF_PER_PROJECT_EUR} € pro Projekt.
            </p>
          </div>
          <div className="flex flex-col gap-3 self-start md:self-center">
            <Button asChild size="xl">
              <Link href="/piloten">Pilot werden →</Link>
            </Button>
            <Link
              href="/academy"
              className="text-center text-sm text-[var(--color-ink-soft)] underline-offset-2 hover:underline"
            >
              Erst die Academy ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
