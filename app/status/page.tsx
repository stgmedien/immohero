import { Card } from "@/components/ui/card";
import { Logo } from "@/components/site/logo";
import { runAllChecks, overallStatus, type CheckStatus } from "@/lib/health-checks";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { getLocale } from "@/lib/i18n.server";
import { t, type Locale } from "@/lib/i18n";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function statusIcon(s: CheckStatus) {
  switch (s) {
    case "ok":
      return <CheckCircle2 className="h-5 w-5 text-[var(--color-ok)]" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-[var(--color-warn)]" />;
    case "down":
      return <XCircle className="h-5 w-5 text-[var(--color-danger)]" />;
    default:
      return <MinusCircle className="h-5 w-5 text-[var(--color-ink-mute)]" />;
  }
}

function statusLabel(locale: Locale, s: CheckStatus) {
  switch (s) {
    case "ok": return t(locale, "status_ok");
    case "degraded": return t(locale, "status_degraded");
    case "down": return t(locale, "status_down");
    default: return "—";
  }
}

export default async function StatusPage() {
  const checks = await runAllChecks();
  const overall = overallStatus(checks);
  const locale = await getLocale();
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="container-page max-w-2xl">
        <Logo />
        <h1 className="mt-6 font-serif text-4xl">{t(locale, "status_title")}</h1>
        <div className="mt-4 flex items-center gap-3">
          {statusIcon(overall)}
          <p className="text-lg">{statusLabel(locale, overall)}</p>
        </div>
        <ul className="mt-8 space-y-2">
          {checks.map((c) => (
            <li key={c.name}>
              <Card className="flex items-center gap-3 p-4">
                {statusIcon(c.status)}
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-[var(--color-ink-mute)]">{c.message}</p>
                </div>
                {c.ms !== undefined && (
                  <span className="font-mono text-[11px] text-[var(--color-ink-mute)]">
                    {c.ms} ms
                  </span>
                )}
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs text-[var(--color-ink-mute)]">
          {t(locale, "status_last_check")}: {new Date().toLocaleString(locale === "en" ? "en-GB" : "de-DE")}
        </p>
      </div>
    </main>
  );
}
