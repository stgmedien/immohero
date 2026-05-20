import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Kontakt · Contact",
  description: "Direkter Kontakt zum ImmoHero-Team.",
};

export default async function KontaktPage() {
  const locale = await getLocale();
  return (
    <section className="container-page py-16 md:py-20">
      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
            {t(locale, "contact_eyebrow")}
          </p>
          <h1 className="font-serif text-5xl leading-[1.05] md:text-6xl">
            {t(locale, "contact_headline")}
          </h1>
          <p className="text-lg text-[var(--color-ink-soft)]">{t(locale, "contact_sub")}</p>
        </div>
        <aside className="rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
          <h2 className="font-serif text-2xl">{t(locale, "contact_direct")}</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label={t(locale, "contact_email")} value="hello@immohero.org" href="mailto:hello@immohero.org" />
            <Row label={t(locale, "contact_phone")} value="+49 159 06828161" href="tel:+4915906828161" />
            <Row label={t(locale, "contact_address")} value="Freiherr-vom-Stein-Straße 7, 33332 Gütersloh" />
          </dl>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">{label}</dt>
      <dd className="mt-0.5">
        {href ? (
          <a href={href} className="hover:underline">
            {value}
          </a>
        ) : (
          value
        )}
      </dd>
    </div>
  );
}
