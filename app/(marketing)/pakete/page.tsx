import type { Metadata } from "next";
import { BundleCard } from "@/components/marketing/bundle-card";
import { BUNDLES, SERVICES } from "@/lib/services";
import { CtaStrip } from "@/components/marketing/cta-strip";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Pakete · Packages",
  description:
    "Drei Pakete für Immobilienmedien: Basis, Smart und Premium. Bis zu 20 % Rabatt gegenüber Einzelbuchung.",
};

export default async function PaketePage() {
  const locale = await getLocale();
  return (
    <>
      <section className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
            {t(locale, "pakete_eyebrow")}
          </p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">
            {t(locale, "pakete_headline")}
          </h1>
          <p className="mt-4 text-lg text-[var(--color-ink-soft)]">{t(locale, "pakete_sub")}</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {BUNDLES.map((bundle) => (
            <div key={bundle.slug} id={bundle.slug}>
              <BundleCard bundle={bundle} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-12">
        <h2 className="font-serif text-3xl">{t(locale, "pakete_table_title")}</h2>
        <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">{t(locale, "pakete_table_service_col")}</th>
                {BUNDLES.map((b) => (
                  <th key={b.slug} className="px-4 py-3 text-center font-medium">
                    {b.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SERVICES.map((service) => (
                <tr key={service.slug} className="border-t border-[var(--color-line)]">
                  <td className="px-4 py-3">{service.name}</td>
                  {BUNDLES.map((b) => {
                    const included = b.serviceSlugs.includes(service.slug);
                    return (
                      <td key={b.slug} className="px-4 py-3 text-center">
                        {included ? (
                          <span className="text-[var(--color-primary)]" aria-label={t(locale, "pakete_table_inc")}>
                            ✓
                          </span>
                        ) : (
                          <span className="text-[var(--color-ink-mute)]" aria-label={t(locale, "pakete_table_not")}>
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-[var(--color-ink-mute)]">{t(locale, "pakete_table_footnote")}</p>
      </section>

      <CtaStrip />
    </>
  );
}
