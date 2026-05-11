import type { Metadata } from "next";
import { BundleCard } from "@/components/marketing/bundle-card";
import { BUNDLES, SERVICES, getService } from "@/lib/services";
import { CtaStrip } from "@/components/marketing/cta-strip";

export const metadata: Metadata = {
  title: "Pakete",
  description:
    "Drei Pakete für Immobilienmedien: Basis, Smart und Premium. Bis zu 20 % Rabatt gegenüber Einzelbuchung.",
};

export default function PaketePage() {
  return (
    <>
      <section className="container-page py-16 md:py-20">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-wider text-[var(--color-ink-mute)]">Pakete</p>
          <h1 className="mt-2 font-serif text-5xl leading-[1.05] md:text-6xl">Eine Buchung. Alles drin.</h1>
          <p className="mt-4 text-lg text-[var(--color-ink-soft)]">
            Wähle zwischen Basis für schnelle Vermarktung, Smart für die meisten Objekte oder Premium für hochwertige Liegenschaften.
          </p>
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
        <h2 className="font-serif text-3xl">Was ist in jedem Paket enthalten?</h2>
        <div className="mt-8 overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-line)] bg-[var(--color-surface)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--color-bg-alt)]">
              <tr>
                <th className="px-4 py-3 font-medium">Service</th>
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
                          <span className="text-[var(--color-primary)]" aria-label="Enthalten">
                            ✓
                          </span>
                        ) : (
                          <span className="text-[var(--color-ink-mute)]" aria-label="Nicht enthalten">
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
        <p className="mt-4 text-xs text-[var(--color-ink-mute)]">
          Einzelpreise siehe{" "}
          {SERVICES.slice(0, 3)
            .map((s) => `${s.name} ${getService(s.slug)?.priceCents ? "" : ""}`)
            .join(", ")}
          Detailseiten — alle Pakete inkl. 19 % MwSt.
        </p>
      </section>

      <CtaStrip />
    </>
  );
}
