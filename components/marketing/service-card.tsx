import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceIcon } from "./icons";
import { euros } from "@/lib/utils";
import type { ServiceDefinition } from "@/lib/services";

export function ServiceCard({ service }: { service: ServiceDefinition }) {
  return (
    <Link href={`/services/${service.slug}`} className="group">
      <Card className="flex h-full flex-col p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--color-ink)] hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--color-bg-alt)] text-[var(--color-ink)]">
            <ServiceIcon name={service.iconKey} size={22} />
          </span>
          {service.popular && <Badge tone="primary">Beliebt</Badge>}
        </div>
        <h3 className="mt-5 font-serif text-2xl leading-tight">{service.name}</h3>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{service.shortDescription}</p>
        <div className="mt-auto flex items-center justify-between pt-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">ab</p>
            <p className="font-serif text-2xl">{euros(service.priceCents)}</p>
          </div>
          <span className="text-xs text-[var(--color-ink-mute)]">{service.durationLabel}</span>
        </div>
      </Card>
    </Link>
  );
}
