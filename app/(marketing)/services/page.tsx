import type { Metadata } from "next";
import { ServiceCard } from "@/components/marketing/service-card";
import { SERVICES } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description: "Alle einzeln buchbaren Immobilienmedien-Services im Überblick.",
};

export default function ServicesPage() {
  return (
    <section className="container-page py-16 md:py-20">
      <div className="max-w-2xl">
        <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Einzelservices</p>
        <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">Was wir liefern.</h1>
        <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
          Jeder Service einzeln buchbar — oder kombiniert in einem Paket mit Rabatt.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <ServiceCard key={s.slug} service={s} />
        ))}
      </div>
    </section>
  );
}
