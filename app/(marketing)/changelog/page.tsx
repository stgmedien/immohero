import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CHANGELOG, type ChangelogTag } from "@/lib/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Alle Updates und Verbesserungen an der ImmoHero-Plattform.",
  alternates: { canonical: "/changelog" },
};

const TAG_LABEL: Record<ChangelogTag, { label: string; tone: "ok" | "info" | "warn" | "neutral" }> = {
  feature: { label: "Neu", tone: "ok" },
  improvement: { label: "Verbessert", tone: "info" },
  fix: { label: "Behoben", tone: "warn" },
  internal: { label: "Unter der Haube", tone: "neutral" },
};

function germanDate(s: string): string {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <section className="container-page py-12">
        <header className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--color-ink-3)]">
            Changelog
          </p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">Was sich bei ImmoHero ändert</h1>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Alle Updates, Verbesserungen und Bugfixes — chronologisch, transparent und in Klartext.
          </p>
        </header>

        <ol className="mx-auto mt-12 max-w-3xl space-y-6">
          {CHANGELOG.map((entry, i) => (
            <li key={`${entry.date}-${i}`}>
              <Card className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--color-ink-3)]">
                    {germanDate(entry.date)}
                  </span>
                  {entry.tags.map((t) => {
                    const tag = TAG_LABEL[t];
                    return (
                      <Badge key={t} tone={tag.tone}>
                        {tag.label}
                      </Badge>
                    );
                  })}
                </div>
                <h2 className="mt-3 font-serif text-2xl leading-tight">{entry.title}</h2>
                {entry.body && (
                  <p className="mt-3 text-[var(--color-ink-soft)]">{entry.body}</p>
                )}
                {entry.highlights && entry.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {entry.highlights.map((h, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span
                          aria-hidden
                          className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-1)]"
                        />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-[var(--color-ink-mute)]">
          Wünsche, Bug-Meldungen oder Anregungen? Schreib uns an{" "}
          <a
            href="mailto:hello@immohero.org"
            className="underline decoration-[var(--color-brand-1)] underline-offset-2"
          >
            hello@immohero.org
          </a>
          .
        </p>
    </section>
  );
}
