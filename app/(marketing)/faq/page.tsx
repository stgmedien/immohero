import type { Metadata } from "next";
import { FAQ } from "@/components/marketing/faq";
import { CtaStrip } from "@/components/marketing/cta-strip";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Antworten auf häufige Fragen zu ImmoHero, Lieferzeiten, Nutzungsrechten und Buchung.",
};

export default async function FAQPage() {
  const locale = await getLocale();
  return (
    <>
      <section className="container-page pt-16 pb-4 md:pt-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">
            {t(locale, "faq_page_eyebrow")}
          </p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">
            {t(locale, "faq_page_headline")}
          </h1>
        </div>
      </section>
      <FAQ />
      <CtaStrip />
    </>
  );
}
