import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { eq } from "drizzle-orm";
import { deliveries as deliveriesTable, deliveryFiles, orders as ordersTable } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function DeliveryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/konto");

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.shortCode, code)).limit(1);
  if (!order) notFound();
  if (order.customerId !== session.user.id && session.user.role !== "admin") notFound();

  const [delivery] = await db
    .select()
    .from(deliveriesTable)
    .where(eq(deliveriesTable.orderId, order.id))
    .limit(1);

  if (!delivery || delivery.status !== "sent") {
    return (
      <section className="container-page py-10">
        <Link href={`/konto/auftraege/${code}`} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
          ← Zurück
        </Link>
        <Card className="mt-6 p-8 text-center">
          <h1 className="font-serif text-2xl">Noch nichts ausgeliefert.</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Sobald die Bearbeitung abgeschlossen ist, findest du hier die fertigen Dateien.
          </p>
        </Card>
      </section>
    );
  }

  const files = await db
    .select()
    .from(deliveryFiles)
    .where(eq(deliveryFiles.deliveryId, delivery.id));

  return (
    <section className="container-page py-10">
      <Link href={`/konto/auftraege/${code}`} className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]">
        ← Zurück
      </Link>
      <h1 className="mt-3 font-serif text-4xl">Deine Lieferung — {order.shortCode}</h1>
      <p className="mt-1 text-[var(--color-ink-soft)]">{files.length} Dateien · bereit zum Download.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {delivery.zipBlobUrl && (
          <Button asChild size="lg">
            <a href={delivery.zipBlobUrl} download>Alle Dateien als ZIP</a>
          </Button>
        )}
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <Card key={file.id} className="p-4">
            <p className="break-all text-sm font-medium">{file.filename}</p>
            <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
              {(file.sizeBytes / 1024 / 1024).toFixed(1)} MB · {file.mimeType}
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-3 w-full">
              <a href={file.blobUrl} download={file.filename}>Herunterladen</a>
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
}
