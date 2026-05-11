import { Hero } from "@/components/marketing/hero";
import { ProcessSteps } from "@/components/marketing/process-steps";
import { ServiceCard } from "@/components/marketing/service-card";
import { BundleCard } from "@/components/marketing/bundle-card";
import { FAQ } from "@/components/marketing/faq";
import { CtaStrip } from "@/components/marketing/cta-strip";
import { SERVICES, BUNDLES } from "@/lib/services";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ProcessSteps />

      <section className="container-page py-12">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Einzelservices</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Wähle genau das, was du brauchst.</h2>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </section>

      <section className="container-page py-20" id="pakete">
        <div className="mb-12 max-w-xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Pakete</p>
          <h2 className="mt-2 font-serif text-4xl leading-tight md:text-5xl">Mehr buchen, weniger zahlen.</h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Bis zu 20 % Rabatt gegenüber Einzelbuchung. Alle Pakete inkl. Lieferung in 48 Stunden.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {BUNDLES.map((bundle) => (
            <BundleCard key={bundle.slug} bundle={bundle} />
          ))}
        </div>
      </section>

      <FAQ />
      <CtaStrip />
    </>
  );
}
