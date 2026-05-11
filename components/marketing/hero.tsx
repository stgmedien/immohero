import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "./icons";

export function Hero() {
  return (
    <section className="container-page pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="grid items-end gap-12 md:grid-cols-2">
        <div className="space-y-6">
          <Badge tone="neutral">Aktiv in OWL & NRW · MwSt enthalten</Badge>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-[4.5rem]">
            Professionelle Immobilien&shy;medien, ohne Umwege.
          </h1>
          <p className="max-w-xl text-lg text-[var(--color-ink-soft)] text-pretty">
            Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse und Exposé-Texte — schnell gebucht, kuratiert geliefert. Ein Team. Ein Preis. Eine Buchung.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button asChild size="xl">
              <Link href="/buchen">
                Jetzt buchen
                <ArrowRightIcon size={18} />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="xl">
              <Link href="/pakete">Pakete ansehen</Link>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6 pt-8 text-sm">
            <Stat label="Lieferzeit" value="48 Std." />
            <Stat label="Servicegebiet" value="OWL · NRW" />
            <Stat label="Pakete" value="ab 79 €" />
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</p>
      <p className="font-serif text-2xl tracking-tight">{value}</p>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[24px] border border-[var(--color-line)] bg-[var(--color-bg-alt)]">
      <div className="absolute inset-0 flex flex-col">
        <div className="grid grid-cols-3 gap-1 p-1">
          <Tile shade="#3F5A3A" />
          <Tile shade="#5A7559" />
          <Tile shade="#7A8E73" />
        </div>
        <div className="relative flex-1 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(63,90,58,0.95) 0%, rgba(63,90,58,0.7) 60%, rgba(194,98,62,0.4) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 grid grid-cols-2 gap-3 p-6">
            <ChipCard title="Foto + Drohne" subtitle="Termin Mi., 09:30" />
            <ChipCard title="Lieferung" subtitle="48 Std. nach Shooting" />
          </div>
          <div className="absolute right-6 top-6 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-xs text-white backdrop-blur">
            Live · OWL
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ shade }: { shade: string }) {
  return <div className="aspect-square rounded-[10px]" style={{ background: shade }} />;
}

function ChipCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
      <p className="font-serif text-sm tracking-tight text-[var(--color-ink)]">{title}</p>
      <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{subtitle}</p>
    </div>
  );
}
