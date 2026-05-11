import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canManageCatalog } from "@/lib/access";
import { StudioTopbar } from "@/components/studio/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERVICES, BUNDLES, PROPERTY_TYPES } from "@/lib/services";
import { SHOTS } from "@/lib/shots";
import { eurosPrecise } from "@/lib/utils";

export default async function CatalogPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!canManageCatalog(session.user.role)) redirect("/studio/dashboard");

  return (
    <>
      <StudioTopbar
        breadcrumbs={[{ label: "Workspace", href: "/studio" }, { label: "Catalog" }]}
        user={session.user}
        unreadCount={0}
      />
      <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-10 max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Catalog</h1>
        <p className="text-[var(--color-ink-3)]">Services, Bundles, Property-Typen und Shot-Bibliothek</p>

        <section className="mt-8">
          <h2 className="text-base font-semibold mb-3">Services ({SERVICES.length})</h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                <tr>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Stilpaket</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3 text-right">Preis</th>
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((s) => (
                  <tr key={s.slug} className="border-t border-[var(--color-hair)]">
                    <td className="px-4 py-3 font-mono text-xs">{s.slug}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-[var(--color-ink-3)]">{s.shortDescription}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{s.stylePackage}</td>
                    <td className="px-4 py-3 text-xs">{s.propertyTypes.length}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{eurosPrecise(s.priceCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold mb-3">Bundles ({BUNDLES.length})</h2>
          <Card className="p-0 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--color-bg-sunken)] text-[10px] font-mono uppercase tracking-[0.12em] text-[var(--color-ink-3)]">
                <tr>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Services</th>
                  <th className="px-4 py-3 text-right">Rabatt</th>
                </tr>
              </thead>
              <tbody>
                {BUNDLES.map((b) => (
                  <tr key={b.slug} className="border-t border-[var(--color-hair)]">
                    <td className="px-4 py-3 font-mono text-xs">{b.slug}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{b.name}</p>
                      <p className="text-xs text-[var(--color-ink-3)]">{b.tagline}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{b.serviceSlugs.join(", ")}</td>
                    <td className="px-4 py-3 text-right">{b.discountPercent} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold mb-3">Property-Typen ({PROPERTY_TYPES.length})</h2>
          <Card className="p-5">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {PROPERTY_TYPES.map((pt) => (
                <div key={pt.value} className="rounded-[var(--radius-md)] border border-[var(--color-hair)] p-3">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--color-ink-4)]">{pt.value}</p>
                  <p className="mt-0.5 font-medium">{pt.label}</p>
                  <p className="text-xs text-[var(--color-ink-3)]">{pt.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="text-base font-semibold mb-3">Shot-Bibliothek ({SHOTS.length})</h2>
          <p className="text-sm text-[var(--color-ink-3)]">
            Shot-Definitionen werden aus dem Code (<code>lib/shots.ts</code>) geseedet. Editor folgt im nächsten Release.
          </p>
        </section>
      </main>
    </>
  );
}
