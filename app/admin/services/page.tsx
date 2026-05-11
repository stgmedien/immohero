import { SERVICES, BUNDLES } from "@/lib/services";
import { Card } from "@/components/ui/card";
import { eurosPrecise } from "@/lib/utils";

export default function AdminServicesPage() {
  return (
    <section className="container-page py-10">
      <h1 className="font-serif text-4xl">Services & Pakete</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">
        Aktuell aus Code-Katalog (lib/services.ts) gespeist. Editierbar im Admin-UI im nächsten Release.
      </p>

      <h2 className="mt-8 font-serif text-2xl">Services</h2>
      <Card className="mt-4 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Stilpaket</th>
              <th className="px-4 py-3 text-right font-medium">Preis</th>
            </tr>
          </thead>
          <tbody>
            {SERVICES.map((s) => (
              <tr key={s.slug} className="border-t border-[var(--color-line)]">
                <td className="px-4 py-3 font-mono text-xs">{s.slug}</td>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3 text-xs">{s.stylePackage}</td>
                <td className="px-4 py-3 text-right">{eurosPrecise(s.priceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <h2 className="mt-10 font-serif text-2xl">Pakete</h2>
      <Card className="mt-4 overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg-alt)]">
            <tr>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Services</th>
              <th className="px-4 py-3 text-right font-medium">Rabatt</th>
            </tr>
          </thead>
          <tbody>
            {BUNDLES.map((b) => (
              <tr key={b.slug} className="border-t border-[var(--color-line)]">
                <td className="px-4 py-3 font-mono text-xs">{b.slug}</td>
                <td className="px-4 py-3 text-xs">{b.serviceSlugs.join(", ")}</td>
                <td className="px-4 py-3 text-right">{b.discountPercent} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
