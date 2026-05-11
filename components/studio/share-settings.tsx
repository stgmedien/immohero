"use client";
import { useState, useTransition, useEffect } from "react";
import QRCode from "qrcode";
import { Copy, RefreshCw, ExternalLink, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { regenerateShareToken } from "@/app/studio/actions/projects";

export function ShareSettings({
  orderId,
  shareToken,
  studioStatus,
  viewCount,
}: {
  orderId: string;
  shareToken: string;
  studioStatus: string;
  viewCount: number;
}) {
  const [pending, startTransition] = useTransition();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://immohero.org";
  const shareUrl = `${origin}/share/${shareToken}`;

  useEffect(() => {
    QRCode.toDataURL(shareUrl, { width: 200, margin: 1, color: { dark: "#1e2319", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [shareUrl]);

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Link kopiert");
  };

  const isPublic = studioStatus !== "draft" && studioStatus !== "archived";

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-4)]">Öffentlicher Share-Link</p>
            <h2 className="mt-1 text-xl font-semibold">Kunde sieht alles auf einer Seite</h2>
          </div>
          {isPublic ? (
            <Badge tone="ok" dot>Aktiv</Badge>
          ) : (
            <Badge tone="warn">Status ändert "Entwurf" → "Produktion"</Badge>
          )}
        </div>

        {!isPublic && (
          <div className="mt-4 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-warn-soft)] bg-[var(--color-warn-soft)]/40 p-3 text-sm text-[var(--color-warn)]">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Der Link funktioniert erst, wenn das Projekt aus dem Entwurfsstatus heraus ist. Wechsel den Status im Tab „Einstellungen".</p>
          </div>
        )}

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <Input value={shareUrl} readOnly className="font-mono text-xs flex-1" />
          <Button variant="secondary" onClick={copy}>
            <Copy className="h-4 w-4" />
            Kopieren
          </Button>
          <Button asChild>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Vorschau
            </a>
          </Button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_220px]">
          <div className="space-y-3 text-sm text-[var(--color-ink-3)]">
            <p>Auf der Share-Seite kann der Kunde:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Alle geplanten Shots inkl. Beschreibung sehen</li>
              <li>Pro Shot freigeben oder kommentieren</li>
              <li>Finale Dateien herunterladen (sobald als „Kunde sieht" markiert)</li>
              <li>Mit „Alle freigeben" das gesamte Projekt abnehmen</li>
            </ul>
            <div className="pt-2 flex items-center gap-3 text-xs">
              <Badge tone="outline">
                <Eye className="h-3 w-3" />
                {viewCount} Aufrufe
              </Badge>
            </div>
          </div>
          {qrDataUrl && (
            <div className="text-center">
              <img src={qrDataUrl} alt="QR-Code" className="mx-auto rounded-lg border border-[var(--color-hair)]" />
              <p className="mt-2 text-[10px] font-mono uppercase tracking-wider text-[var(--color-ink-4)]">
                Für Print-Exposés
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold">Token zurücksetzen</h3>
        <p className="mt-1 text-sm text-[var(--color-ink-3)]">
          Falls der Link in falsche Hände geraten ist, kannst du einen neuen Token generieren. Der alte Link funktioniert dann nicht mehr.
        </p>
        <Button
          className="mt-3"
          variant="danger"
          onClick={() => {
            if (!confirm("Wirklich einen neuen Share-Token erstellen? Der alte Link wird ungültig.")) return;
            startTransition(async () => {
              await regenerateShareToken(orderId);
              toast.success("Neuer Token erzeugt");
            });
          }}
          disabled={pending}
        >
          <RefreshCw className="h-4 w-4" />
          Neuen Token erzeugen
        </Button>
      </Card>
    </div>
  );
}
