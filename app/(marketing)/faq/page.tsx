import type { Metadata } from "next";
import { FAQ } from "@/components/marketing/faq";
import { CtaStrip } from "@/components/marketing/cta-strip";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Antworten auf häufige Fragen zu ImmoHero, Lieferzeiten, Nutzungsrechten und Buchung.",
};

export default function FAQPage() {
  return (
    <>
      <section className="container-page pt-16 pb-4 md:pt-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">FAQ</p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">Was du wissen solltest.</h1>
        </div>
      </section>
      <FAQ />
      <CtaStrip />
    </>
  );
}
