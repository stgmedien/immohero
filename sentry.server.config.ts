import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

// Ohne DSN ist Sentry ein No-Op — kein Versand, kein Fehler.
Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  tracesSampleRate: 0.1,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
});
