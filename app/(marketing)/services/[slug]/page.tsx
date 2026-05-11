import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CtaStrip } from "@/components/marketing/cta-strip";
import { ServiceCard } from "@/components/marketing/service-card";
import { ServiceIcon, ArrowRightIcon, CheckIcon } from "@/components/marketing/icons";
import { SERVICES, getService } from "@/lib/services";
import { euros } from "@/lib/utils";

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: "Service" };
  return {
    title: service.name,
    description: service.shortDescription,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const related = SERVICES.filter((s) => s.slug !== service.slug && s.category !== service.category).slice(0, 3);

  return (
    <>
      <section className="container-page py-16 md:py-20">
        <div className="grid items-start gap-12 md:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Link href="/services" className="inline-flex text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
              ← Alle Services
            </Link>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-bg-alt)]">
                <ServiceIcon name={service.iconKey} size={24} />
              </span>
              {service.popular && <Badge tone="primary">Beliebt</Badge>}
            </div>
            <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">{service.name}</h1>
            <p className="max-w-2xl text-lg text-[var(--color-ink-soft)] text-pretty">{service.longDescription}</p>
            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <FeatureRow text="Lieferung innerhalb von 48 Std." />
              <FeatureRow text="Unbeschränkte Nutzungsrechte" />
              <FeatureRow text="Hochauflösende Originaldateien" />
              <FeatureRow text="Persönlicher Ansprechpartner" />
            </div>
          </div>

          <aside className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Preis ab</p>
            <p className="mt-1 font-serif text-5xl tracking-tight">{euros(service.priceCents)}</p>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">inkl. 19 % MwSt · {service.durationLabel}</p>
            <Button asChild size="lg" className="mt-6 w-full">
              <Link href={`/buchen?service=${service.slug}`}>
                Jetzt buchen
                <ArrowRightIcon size={18} />
              </Link>
            </Button>
            <p className="mt-4 text-xs text-[var(--color-ink-mute)]">Aktivierungsgebiete: OWL, NRW. PLZ-Check direkt im Funnel.</p>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-page py-12">
          <h2 className="font-serif text-3xl">Passt gut dazu</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </section>
      )}

      <CtaStrip />
    </>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <CheckIcon size={18} className="mt-0.5 text-[var(--color-primary)]" />
      <span>{text}</span>
    </div>
  );
}
