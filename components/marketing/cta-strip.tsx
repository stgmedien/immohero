import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "./icons";

export function CtaStrip() {
  return (
    <section className="container-page py-12">
      <div className="overflow-hidden rounded-[24px] bg-[var(--color-ink)] p-10 text-[var(--color-primary-ink)] md:p-14">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm uppercase tracking-wider text-[var(--color-primary)]">In 5 Minuten gebucht</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">
              Bereit für deine besten Immobilienbilder?
            </h2>
            <p className="mt-3 max-w-xl text-[var(--color-primary-soft)]/90">
              Wähle dein Paket, bestätige den Termin, bezahle sicher online. Wir kümmern uns um den Rest.
            </p>
          </div>
          <Button asChild size="xl" variant="accent" className="self-start md:self-center">
            <Link href="/buchen">
              Jetzt buchen
              <ArrowRightIcon size={20} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
