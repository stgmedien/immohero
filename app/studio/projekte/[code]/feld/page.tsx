import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByShortCode, getOrderShots } from "@/lib/db/queries";
import { FieldShotList } from "@/components/studio/field-shot-list";

export default async function FieldModePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByShortCode(code);
  if (!order) notFound();
  const shots = await getOrderShots(order.id);

  return (
    <section className="container-page py-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/studio/projekte/${code}`}
          className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
        >
          ← Zurück
        </Link>
        <span className="text-xs uppercase tracking-wider text-[var(--color-ink-mute)]">Field-Mode</span>
      </div>
      <h1 className="mt-2 font-serif text-3xl">{order.shortCode} · {order.propertyCity}</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
        {order.propertyAddress} · {shots.length} Shots geplant
      </p>

      <FieldShotList
        orderCode={order.shortCode}
        shots={shots.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          priority: s.priority,
          status: s.status,
          notes: s.notes,
        }))}
      />
    </section>
  );
}
