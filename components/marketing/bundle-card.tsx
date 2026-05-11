import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckIcon } from "./icons";
import { euros, cn } from "@/lib/utils";
import {
  bundlePriceCents,
  bundleSavingsCents,
  bundleSubtotalCents,
  getService,
  type BundleDefinition,
} from "@/lib/services";

export function BundleCard({ bundle }: { bundle: BundleDefinition }) {
  const services = bundle.serviceSlugs.map((slug) => getService(slug)!).filter(Boolean);
  const price = bundlePriceCents(bundle);
  const subtotal = bundleSubtotalCents(bundle);
  const savings = bundleSavingsCents(bundle);

  return (
    <Card
      className={cn(
        "relative flex flex-col p-7",
        bundle.recommended && "border-[var(--color-ink)] shadow-md",
      )}
    >
      {bundle.recommended && (
        <Badge tone="ink" className="absolute -top-3 left-7">
          Empfohlen
        </Badge>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-3xl">{bundle.name}</h3>
        <Badge tone="accent">{bundle.discountPercent}% sparen</Badge>
      </div>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{bundle.tagline}</p>

      <div className="mt-6 flex items-end gap-3">
        <span className="font-serif text-5xl tracking-tight">{euros(price)}</span>
        <span className="pb-2 text-sm text-[var(--color-ink-mute)] line-through">{euros(subtotal)}</span>
      </div>
      <p className="text-xs text-[var(--color-ink-soft)]">Du sparst {euros(savings)} gegenüber Einzelbuchung</p>

      <ul className="mt-7 space-y-3">
        {services.map((service) => (
          <li key={service.slug} className="flex items-start gap-3 text-sm">
            <CheckIcon size={18} className="mt-0.5 shrink-0 text-[var(--color-primary)]" />
            <span>
              <span className="font-medium">{service.name}</span>
              <span className="text-[var(--color-ink-soft)]"> — {service.shortDescription}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-2 pt-2">
        <Button asChild size="lg">
          <Link href={`/buchen?paket=${bundle.slug}`}>{bundle.name} buchen</Link>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/pakete#${bundle.slug}`}>Details ansehen</Link>
        </Button>
      </div>
    </Card>
  );
}
