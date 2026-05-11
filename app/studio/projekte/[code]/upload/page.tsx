import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderByShortCode, getOrderShots } from "@/lib/db/queries";
import { UploadForm } from "@/components/studio/upload-form";

export default async function UploadPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByShortCode(code);
  if (!order) notFound();
  const shots = await getOrderShots(order.id);

  return (
    <section className="container-page py-10">
      <Link href={`/studio/projekte/${code}`} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Zurück
      </Link>
      <h1 className="mt-3 font-serif text-4xl">Assets hochladen — {order.shortCode}</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">Raw oder finale Dateien einem Shot zuordnen.</p>

      <UploadForm
        orderId={order.id}
        shots={shots.map((s) => ({ id: s.id, name: s.name }))}
      />
    </section>
  );
}
