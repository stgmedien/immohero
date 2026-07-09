import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, ExternalLink, FileText } from "lucide-react";
import { getProjectFull } from "@/lib/db/project-queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eurosPrecise } from "@/lib/utils";
import { OfferPanel } from "@/components/studio/offer-panel";

export default async function KundeTabPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const data = await getProjectFull(code);
  if (!data) notFound();

  const { project, items, customer } = data;
  const isInquiryPhase = ["inquiry", "offer_sent", "pending"].includes(project.status);

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Kunde</p>
        <h2 className="mt-1 text-2xl font-semibold">{project.customerName ?? "Unbekannt"}</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row icon={Mail} label="E-Mail" value={project.customerEmail} href={`mailto:${project.customerEmail}`} />
          <Row icon={Phone} label="Telefon" value={project.customerPhone ?? "—"} href={project.customerPhone ? `tel:${project.customerPhone}` : undefined} />
        </dl>
        {customer ? (
          <div className="mt-5 flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-sunken)]/40 p-3">
            <div>
              <p className="text-xs text-[var(--color-ink-3)]">In CRM gepflegt</p>
              <p className="font-medium">{customer.displayName}</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/studio/kunden/${customer.id}`}>
                Kundenprofil <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-xs text-[var(--color-ink-3)]">Noch nicht im CRM verknüpft.</p>
        )}
      </Card>

      <OfferPanel
        orderId={project.id}
        status={project.status}
        estimateCents={project.totalCents}
        quotedPriceCents={project.quotedPriceCents}
        offerSentAt={project.offerSentAt ? project.offerSentAt.toISOString() : null}
        paymentUrl={project.paymentUrl}
      />

      <Card className="p-5">
        <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Angefragte Leistungen</p>
        <h3 className="mt-1 text-base font-semibold">{items.length} Position{items.length === 1 ? "" : "en"}</h3>
        {items.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--color-ink-3)]">—</p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--color-hair)]">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>{item.serviceName}</span>
                <span className="tabular-nums text-[var(--color-ink-3)]">{eurosPrecise(item.unitPriceCents)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex items-end justify-between border-t border-[var(--color-hair)] pt-4">
          <span className="text-sm text-[var(--color-ink-3)]">
            {isInquiryPhase ? "Richtpreis (unverbindlich)" : "Gesamt"}
          </span>
          <span className="text-xl font-semibold tabular-nums">
            {eurosPrecise(project.quotedPriceCents ?? project.totalCents)}
          </span>
        </div>
      </Card>

      {project.propertyNotes && (
        <Card className="p-5">
          <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Hinweise vom Kunden</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--color-ink-2)]">{project.propertyNotes}</p>
        </Card>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <dd className="mt-0.5 text-sm">
        {href ? <a href={href} className="hover:underline">{value}</a> : value}
      </dd>
    </div>
  );
}
