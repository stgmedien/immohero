"use client";

import { useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addOrderAttachment } from "@/app/konto/auftraege/[code]/comment-actions";

interface Attachment {
  id: string;
  filename: string;
  blobUrl: string;
  note: string | null;
  createdAt: string;
}

export function AttachmentUpload({
  orderShortCode,
  initial,
}: {
  orderShortCode: string;
  initial: Attachment[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  async function submit() {
    if (files.length === 0) {
      toast.error("Bitte mindestens eine Datei wählen.");
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const result = await upload(
          `konto/${orderShortCode}/${Date.now()}-${file.name}`,
          file,
          {
            access: "public",
            handleUploadUrl: "/api/konto/attachments/upload",
            contentType: file.type || undefined,
          },
        );
        await new Promise<void>((resolve) =>
          startTransition(async () => {
            const res = await addOrderAttachment({
              orderShortCode,
              filename: file.name,
              blobUrl: result.url,
              blobPathname: result.pathname,
              sizeBytes: file.size,
              mimeType: file.type || "application/octet-stream",
              note: note.trim() || undefined,
            });
            if (!res.ok) toast.error(res.error ?? "Speichern fehlgeschlagen.");
            resolve();
          }),
        );
      }
      toast.success("Datei(en) ans Team übergeben.");
      setFiles([]);
      setNote("");
    } catch {
      toast.error("Upload fehlgeschlagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {initial.length > 0 && (
        <ul className="space-y-1.5 text-sm">
          {initial.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-hair)] bg-[var(--color-bg-subtle)]/30 p-2.5"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={a.blobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate underline decoration-[var(--color-brand-1)] underline-offset-2"
                >
                  {a.filename}
                </a>
                {a.note && (
                  <p className="text-xs text-[var(--color-ink-mute)]">{a.note}</p>
                )}
              </div>
              <span className="shrink-0 text-[11px] text-[var(--color-ink-mute)]">
                {new Date(a.createdAt).toLocaleDateString("de-DE")}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
          className="block w-full text-sm text-[var(--color-ink-soft)] file:mr-3 file:rounded-[var(--radius-md)] file:border file:border-[var(--color-hair)] file:bg-[var(--color-bg-subtle)] file:px-3 file:py-2 file:text-sm"
        />
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Anmerkung (z. B. Schlüssel-Ort, Zugangscode) — optional"
        />
        <Button
          onClick={submit}
          disabled={uploading || pending || files.length === 0}
          size="sm"
        >
          <Paperclip className="h-3.5 w-3.5" />
          {uploading ? "Lädt hoch…" : "Datei(en) ans Team senden"}
        </Button>
      </div>
    </div>
  );
}
