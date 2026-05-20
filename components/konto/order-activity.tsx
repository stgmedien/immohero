import { germanDateTime } from "@/lib/utils";

const ACTION_LABEL: Record<string, string> = {
  studio_status_change: "Status geändert",
  cancel_order: "Auftrag storniert",
  regenerate_share_token: "Lieferungs-Link erneuert",
  regenerate_shotlist: "Shotliste neu erstellt",
  archive: "Archiviert",
  unarchive: "Aus Archiv geholt",
  approve: "Einreichung übernommen",
  reject: "Einreichung abgelehnt",
  update: "Aktualisiert",
  create: "Erstellt",
  feedback_submitted: "Feedback abgegeben",
  attachment_added: "Datei hochgeladen",
  reschedule: "Termin verschoben",
};

interface Row {
  id: number;
  action: string;
  userName: string | null;
  payload: unknown;
  createdAt: Date;
}

export function OrderActivity({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-[var(--color-ink-mute)]">
        Noch keine Aktivitäten — sobald wir etwas tun, siehst du es hier.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {rows.map((r) => {
        const label = ACTION_LABEL[r.action] ?? r.action;
        const status =
          r.payload && typeof r.payload === "object" && "status" in r.payload
            ? String((r.payload as Record<string, unknown>).status)
            : null;
        return (
          <li key={r.id} className="flex gap-3 text-sm">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-brand-1)]" />
            <div className="flex-1">
              <p>
                <span className="font-medium">{label}</span>
                {status ? ` → ${status}` : ""}
                {r.userName ? (
                  <span className="text-[var(--color-ink-mute)]"> · von {r.userName}</span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-ink-mute)]">
                {germanDateTime(r.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
