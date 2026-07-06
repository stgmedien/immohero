import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { academyCertificates } from "@/lib/db/schema";
import { PrintButton } from "@/components/academy/print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ serial: string }>;
}): Promise<Metadata> {
  const { serial } = await params;
  return {
    title: `Zertifikat ${serial.toUpperCase()}`,
    description: "Öffentliche Zertifikats-Verifikation der Aero One Academy.",
  };
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  const normalized = serial.toUpperCase().slice(0, 20);
  const [cert] = await db
    .select()
    .from(academyCertificates)
    .where(eq(academyCertificates.serial, normalized))
    .limit(1);
  if (!cert) notFound();

  const issued = cert.issuedAt.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-10 print:bg-white print:py-0">
      <div className="container-narrow">
        {/* Verifikations-Leiste (nicht im Druck) */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-sm">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[var(--color-ok)] text-xs text-white">✓</span>
            <span>
              Echtheit bestätigt — Zertifikat <span className="font-mono">{cert.serial}</span> wurde
              von der Aero One Academy ausgestellt.
            </span>
          </div>
          <div className="flex gap-2">
            <PrintButton />
            <Link
              href="/academy"
              className="rounded-full border border-[var(--color-line)] px-4 py-1.5 text-sm hover:bg-[var(--color-bg-elev)]"
            >
              Zur Academy
            </Link>
          </div>
        </div>

        {/* Zertifikat */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl)] border-2 border-[var(--color-brand-1)] bg-white p-10 shadow-[var(--shadow-card)] md:p-14 print:rounded-none print:border-4 print:shadow-none">
          <div className="absolute inset-x-0 top-0 h-2 bg-brand-grad" />

          <p className="label-mono text-[var(--color-ink-mute)]">Aero One Academy × ImmoHero</p>
          <h1 className="mt-6 font-serif text-4xl leading-tight text-[var(--color-ink)] md:text-5xl">
            Zertifikat
          </h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">über den erfolgreichen Abschluss des Kurses</p>

          <p className="mt-8 font-serif text-2xl text-[var(--color-brand-1)] md:text-3xl">
            {cert.courseTitle}
          </p>

          <p className="mt-8 text-sm text-[var(--color-ink-soft)]">verliehen an</p>
          <p className="mt-1 font-serif text-3xl md:text-4xl">{cert.recipientName}</p>

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--color-line)] pt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Ausgestellt am</p>
              <p className="mt-1 text-sm">{issued}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Zertifikats-Nr.</p>
              <p className="mt-1 font-mono text-sm">{cert.serial}</p>
            </div>
            <div className="text-right">
              <p className="font-serif text-lg text-[var(--color-ink)]">Aero One</p>
              <p className="text-xs text-[var(--color-ink-mute)]">Schülerunternehmen · Gütersloh</p>
            </div>
          </div>

          <p className="mt-6 text-[11px] text-[var(--color-ink-5)]">
            Verifizierbar unter immohero.org/zertifikat/{cert.serial}
          </p>
        </div>
      </div>
    </div>
  );
}
