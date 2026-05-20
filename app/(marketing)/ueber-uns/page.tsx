import type { Metadata } from "next";
import { CtaStrip } from "@/components/marketing/cta-strip";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Über uns · About",
  description: "Wer hinter ImmoHero steckt — ein kleines Team aus OWL für Immobilienmedien in NRW.",
};

export default async function UeberUnsPage() {
  const locale = await getLocale();
  return (
    <>
      <section className="container-page py-16 md:py-20">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
            {t(locale, "about_eyebrow")}
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">
            {t(locale, "about_headline")}
          </h1>
          <p className="text-lg text-[var(--color-ink-soft)] text-pretty">{t(locale, "about_p1")}</p>
          <p className="text-[var(--color-ink-soft)] text-pretty">{t(locale, "about_p2")}</p>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-8 md:grid-cols-3">
          <Pillar title={t(locale, "about_pillar_local_title")} body={t(locale, "about_pillar_local_body")} />
          <Pillar title={t(locale, "about_pillar_delivery_title")} body={t(locale, "about_pillar_delivery_body")} />
          <Pillar title={t(locale, "about_pillar_personal_title")} body={t(locale, "about_pillar_personal_body")} />
        </div>
      </section>

      <CtaStrip />
    </>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
      <h3 className="font-serif text-2xl leading-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{body}</p>
    </div>
  );
}
