import { Badge } from "./badge";
import type { ComponentProps } from "react";

type BadgeTone = NonNullable<ComponentProps<typeof Badge>["tone"]>;

interface StatusConfig {
  label: string;
  tone: BadgeTone;
  dot?: boolean;
}

const STUDIO_STATUS_MAP: Record<string, StatusConfig> = {
  draft: { label: "Entwurf", tone: "neutral" },
  production: { label: "Produktion", tone: "brand-soft", dot: true },
  client_approval: { label: "Freigabe", tone: "info" },
  revision: { label: "Revision", tone: "warn" },
  approved: { label: "Freigegeben", tone: "ok" },
  completed: { label: "Geliefert", tone: "ok" },
  archived: { label: "Archiviert", tone: "neutral" },
};

const ORDER_STATUS_MAP: Record<string, StatusConfig> = {
  inquiry: { label: "Anfrage", tone: "info", dot: true },
  offer_sent: { label: "Angebot gesendet", tone: "warn", dot: true },
  pending: { label: "Wartet auf Zahlung", tone: "warn" },
  paid: { label: "Bezahlt", tone: "ok" },
  scheduled: { label: "Terminiert", tone: "info" },
  shooting: { label: "Shooting", tone: "brand", dot: true },
  editing: { label: "Editing", tone: "brand-soft", dot: true },
  delivered: { label: "Geliefert", tone: "ok" },
  cancelled: { label: "Storniert", tone: "neutral" },
};

const SHOT_STATUS_MAP: Record<string, StatusConfig> = {
  planned: { label: "Geplant", tone: "neutral" },
  done: { label: "Fertig", tone: "ok" },
  skipped: { label: "Übersprungen", tone: "neutral" },
  reshoot: { label: "Reshoot", tone: "warn" },
};

const DEAL_STAGE_MAP: Record<string, StatusConfig> = {
  lead: { label: "Lead", tone: "neutral" },
  qualified: { label: "Qualifiziert", tone: "info" },
  proposal: { label: "Angebot", tone: "warn" },
  won: { label: "Gewonnen", tone: "ok" },
  lost: { label: "Verloren", tone: "danger" },
};

export function StudioStatusBadge({ status }: { status: string }) {
  const cfg = STUDIO_STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={cfg.tone} dot={cfg.dot}>{cfg.label}</Badge>;
}

export function OrderStatusBadge({ status }: { status: string }) {
  const cfg = ORDER_STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={cfg.tone} dot={cfg.dot}>{cfg.label}</Badge>;
}

export function ShotStatusBadge({ status }: { status: string }) {
  const cfg = SHOT_STATUS_MAP[status] ?? { label: status, tone: "neutral" as const };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function DealStageBadge({ stage }: { stage: string }) {
  const cfg = DEAL_STAGE_MAP[stage] ?? { label: stage, tone: "neutral" as const };
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
