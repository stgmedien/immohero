import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "./icons";

export function Hero() {
  return (
    <section className="container-page pt-12 pb-20 md:pt-16 md:pb-28">
      <div className="space-y-10 md:space-y-14">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
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

          {/* Featured image: large aerial */}
          <div className="relative">
            <span className="absolute -top-3 left-4 z-10 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium text-[var(--color-ink-soft)] shadow-sm">
              Aktuelles Beispielobjekt · Gütersloh
            </span>
            <figure className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-[var(--color-line)] bg-[var(--color-bg-alt)] shadow-lg">
              <Image
                src="/hero/01.jpg"
                alt="Drohnenfoto Mehrfamilienhaus in Gütersloh aus der Luft"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-4">
                <Badge tone="ink" className="!bg-white/95 !text-[var(--color-ink)]">
                  Drohne · 4K
                </Badge>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/90">
                  Hero · Schräg
                </span>
              </div>
            </figure>

            {/* Floating chip below the featured image */}
            <div className="absolute -bottom-5 -left-3 hidden md:block">
              <div className="flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 shadow-md">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-semibold">
                  ✓
                </span>
                <span className="text-xs font-medium pr-1">Lieferung in 48 Std.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery strip: 3 portrait drone shots */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <GalleryTile
            src="/hero/02.jpg"
            alt="Drohnenaufnahme Dach mit Solaranlage und Balkonseite"
            label="Detail"
            aspect="aspect-[3/4]"
          />
          <GalleryTile
            src="/hero/03.jpg"
            alt="Drohnenaufnahme Seitenansicht Mehrfamilienhaus"
            label="Schräg"
            aspect="aspect-[3/4]"
          />
          <GalleryTile
            src="/hero/04.jpg"
            alt="Drohnenaufnahme Mehrfamilienhaus mit Garten"
            label="Kontext"
            aspect="aspect-[3/4]"
          />
        </div>
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

function GalleryTile({
  src,
  alt,
  label,
  aspect,
}: {
  src: string;
  alt: string;
  label: string;
  aspect: string;
}) {
  return (
    <figure
      className={`group relative ${aspect} overflow-hidden rounded-[20px] border border-[var(--color-line)] bg-[var(--color-bg-alt)] transition-transform hover:-translate-y-0.5`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 768px) 25vw, 50vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wider text-[var(--color-ink)] backdrop-blur">
        {label}
      </span>
    </figure>
  );
}
