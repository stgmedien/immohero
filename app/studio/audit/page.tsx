import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canViewAudit } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { auditLog } from "@/lib/db/schema";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { germanDateTime } from "@/lib/utils";

const ACTION_LABELS: Record<string, string> = {
  create: "Erstellt",
  update: "Aktualisiert",
  archive: "Archiviert",
  unarchive: "Wiederhergestellt",
  studio_status_change: "Status geändert",
  regenerate_share_token: "Share-Token erneuert",
  regenerate_shotlist: "Shotliste regeneriert",
  assign: "Zugewiesen",
  unassign: "Entfernt",
  upload_asset: "Asset hochgeladen",
  delete_asset: "Asset gelöscht",
  set_role: "Rolle geändert",
  set_status: "Status geändert",
  update_shot: "Shot aktualisiert",
  delete_shot: "Shot gelöscht",
  client_approve_shot: "Kunde freigegeben (Shot)",
  client_unapprove_shot: "Kunde Freigabe zurückgezogen",
  client_approve_all: "Kunde alle freigegeben",
};

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canViewAudit(session.user.role)) redirect("/studio/dashboard");

  const entries = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(200);

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Audit-Log" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-5xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Audit-Log</h1>
        <p className="text-[var(--color-ink-3)]">Letzte {entries.length} Aktionen</p>

        <Card className="mt-6 p-0 overflow-hidden">
          {entries.length === 0 ? (
            <p className="p-8 text-center text-sm text-[var(--color-ink-3)]">Noch keine Einträge.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-hair)]">
              {entries.map((e) => (
                <li key={e.id} className="p-4 flex items-start gap-4">
                  <div className="shrink-0">
                    <Badge tone="outline">{e.entityType}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ACTION_LABELS[e.action] ?? e.action}</p>
                    <p className="text-xs text-[var(--color-ink-3)]">
                      {e.userName ?? "System"} · {germanDateTime(e.createdAt)}
                    </p>
                    {e.entityId && (
                      <p className="font-mono text-[10px] text-[var(--color-ink-4)] truncate mt-0.5">
                        {e.entityId}
                      </p>
                    )}
                    {e.payload ? (
                      <pre className="mt-1 text-[10px] text-[var(--color-ink-3)] overflow-x-auto">
                        {JSON.stringify(e.payload, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </>
  );
}
