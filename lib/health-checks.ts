import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { isGoogleCalendarConfigured } from "@/lib/google-calendar";

export type CheckStatus = "ok" | "degraded" | "down" | "skipped";
export interface HealthCheck {
  name: string;
  status: CheckStatus;
  message: string;
  ms?: number;
}

async function timed<T>(fn: () => Promise<T>): Promise<{ ok: boolean; ms: number; value?: T; error?: string }> {
  const t = Date.now();
  try {
    const value = await fn();
    return { ok: true, ms: Date.now() - t, value };
  } catch (err) {
    return { ok: false, ms: Date.now() - t, error: String(err) };
  }
}

export async function runAllChecks(): Promise<HealthCheck[]> {
  // DB
  const dbCheck = await timed(async () => {
    await db.execute(sql`select 1`);
  });

  // Resend
  let resendCheck: HealthCheck;
  if (!process.env.RESEND_API_KEY) {
    resendCheck = { name: "Resend (Mail)", status: "skipped", message: "Nicht konfiguriert" };
  } else {
    const res = await timed(async () => {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
      });
      if (!r.ok) throw new Error(`${r.status}`);
    });
    resendCheck = res.ok
      ? { name: "Resend (Mail)", status: "ok", message: "Verbunden", ms: res.ms }
      : { name: "Resend (Mail)", status: "down", message: res.error ?? "Fehler", ms: res.ms };
  }

  // Vercel Blob
  const blobCheck: HealthCheck = process.env.BLOB_READ_WRITE_TOKEN
    ? { name: "Vercel Blob (Uploads)", status: "ok", message: "Token konfiguriert" }
    : { name: "Vercel Blob (Uploads)", status: "skipped", message: "Nicht konfiguriert" };

  // Google Calendar
  const gcalCheck: HealthCheck = isGoogleCalendarConfigured()
    ? { name: "Google Calendar", status: "ok", message: "Verbunden" }
    : { name: "Google Calendar", status: "skipped", message: "Nicht konfiguriert" };

  // Stripe
  const stripeCheck: HealthCheck = process.env.STRIPE_SECRET_KEY
    ? { name: "Stripe (Zahlungen)", status: "ok", message: "Konfiguriert" }
    : { name: "Stripe (Zahlungen)", status: "skipped", message: "Nicht konfiguriert" };

  // Sentry
  const sentryCheck: HealthCheck = process.env.SENTRY_DSN
    ? { name: "Sentry (Monitoring)", status: "ok", message: "Aktiv" }
    : { name: "Sentry (Monitoring)", status: "skipped", message: "Nicht konfiguriert" };

  const checks: HealthCheck[] = [
    dbCheck.ok
      ? { name: "Datenbank (Neon)", status: "ok", message: "Erreichbar", ms: dbCheck.ms }
      : { name: "Datenbank (Neon)", status: "down", message: dbCheck.error ?? "Fehler", ms: dbCheck.ms },
    resendCheck,
    blobCheck,
    gcalCheck,
    stripeCheck,
    sentryCheck,
  ];
  return checks;
}

export function overallStatus(checks: HealthCheck[]): CheckStatus {
  if (checks.some((c) => c.status === "down")) return "down";
  if (checks.some((c) => c.status === "degraded")) return "degraded";
  return "ok";
}
