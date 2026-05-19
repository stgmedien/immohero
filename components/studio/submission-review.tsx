"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { approveSubmission, rejectSubmission } from "@/app/studio/actions/submissions";

const TYPE_LABEL: Record<string, string> = {
  wohnung: "Wohnung",
  haus: "Haus",
  villa: "Villa",
  mfh: "Mehrfamilienhaus",
  gewerbe: "Gewerbe",
  industrie: "Industrie",
  grundstueck: "Grundstück",
  bauprojekt: "Bauprojekt",
};

const STATUS: Record<
  string,
  { label: string; tone: "warn" | "success" | "danger" | "neutral" }
> = {
  pending: { label: "Offen", tone: "warn" },
  converted: { label: "In Produktion", tone: "success" },
  rejected: { label: "Abgelehnt", tone: "danger" },
  approved: { label: "Bestätigt", tone: "neutral" },
};

interface Row {
  id: string;
  customerName: string | null;
  customerCompany: string | null;
  submittedByEmail: string;
  propertyType: string;
  propertyAddress: string;
  propertyPlz: string;
  propertyCity: string;
  propertySizeQm: number | null;
  propertyNotes: string | null;
  desiredTimeframe: string | null;
  uploads:
    | { url: string; pathname: string; filename: string; sizeBytes: number; mimeType: string }[]
    | null;
  status: string;
  reviewNotes: string | null;
  createdAt: string;
  convertedShortCode: string | null;
}

export function SubmissionReview({
  title,
  rows,
  readOnly,
}: {
  title: string;
  rows: Row[];
  readOnly?: boolean;
}) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-mono uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">
        {rows.map((r) => (
          <SubmissionCard key={r.id} row={r} readOnly={readOnly} />
        ))}
      </div>
    </section>
  );
}

function SubmissionCard({ row, readOnly }: { row: Row; readOnly?: boolean }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const st = STATUS[row.status] ?? STATUS.pending;

  function approve() {
    startTransition(async () => {
      try {
        const res = await approveSubmission(row.id);
        toast.success(`In Produktion übernommen — ${res.shortCode}`);
      } catch (e) {
        toast.error((e as Error).message || "Fehlgeschlagen");
      }
    });
  }

  function reject() {
    startTransition(async () => {
      try {
        await rejectSubmission({ submissionId: row.id, reason });
        toast.success("Einreichung abgelehnt — Kunde benachrichtigt");
        setRejecting(false);
      } catch (e) {
        toast.error((e as Error).message || "Fehlgeschlagen");
      }
    });
  }

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">
              {row.customerCompany ?? row.customerName ?? row.submittedByEmail}
            </h3>
            <Badge tone={st.tone}>{st.label}</Badge>
            {row.convertedShortCode && (
              <Link
                href={`/studio/projekte/${row.convertedShortCode}`}
                className="font-mono text-xs underline"
              >
                {row.convertedShortCode}
              </Link>
            )}
          </div>
          <p className="mt-1 text-sm">
            {TYPE_LABEL[row.propertyType] ?? row.propertyType} ·{" "}
            {row.propertyAddress}, {row.propertyPlz} {row.propertyCity}
            {row.propertySizeQm ? ` · ${row.propertySizeQm} m²` : ""}
          </p>
          <p className="mt-0.5 text-xs text-[var(--color-ink-3)]">
            {row.submittedByEmail} · eingereicht{" "}
            {new Date(row.createdAt).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {row.desiredTimeframe ? ` · Wunsch: ${row.desiredTimeframe}` : ""}
          </p>
        </div>
      </div>

      {row.propertyNotes && (
        <p className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-bg-subtle)] p-3 text-sm">
          {row.propertyNotes}
        </p>
      )}

      {row.uploads && row.uploads.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {row.uploads.map((u) => (
            <a
              key={u.pathname}
              href={u.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--color-hair)] px-3 py-1 text-xs hover:bg-[var(--color-bg-subtle)]"
            >
              {u.filename}
            </a>
          ))}
        </div>
      )}

      {row.status === "rejected" && row.reviewNotes && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">
          Abgelehnt: {row.reviewNotes}
        </p>
      )}

      {!readOnly && row.status === "pending" && (
        <div className="mt-4 border-t border-[var(--color-hair)] pt-4">
          {rejecting ? (
            <div className="space-y-2">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Grund für die Rückfrage / Ablehnung (geht an den Kunden) …"
              />
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={reject}
                  disabled={pending || reason.trim().length < 3}
                >
                  Ablehnen &amp; benachrichtigen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRejecting(false)}
                  disabled={pending}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button size="sm" onClick={approve} disabled={pending}>
                {pending ? "…" : "Bestätigen → Projekt anlegen"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejecting(true)}
                disabled={pending}
              >
                Ablehnen
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
