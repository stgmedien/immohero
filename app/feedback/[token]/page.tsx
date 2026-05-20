import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { feedback, orders } from "@/lib/db/schema";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/site/logo";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const [row] = await db
    .select({
      id: feedback.id,
      orderId: feedback.orderId,
      completedAt: feedback.completedAt,
      shortCode: orders.shortCode,
      address: orders.propertyAddress,
      city: orders.propertyCity,
    })
    .from(feedback)
    .leftJoin(orders, eq(orders.id, feedback.orderId))
    .where(eq(feedback.token, token))
    .limit(1);

  if (!row) notFound();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="container-page max-w-xl">
        <Logo />
        <Card className="mt-6 p-7">
          {row.completedAt ? (
            <>
              <h1 className="font-serif text-3xl">Danke für dein Feedback!</h1>
              <p className="mt-2 text-[var(--color-ink-soft)]">
                Wir haben es notiert. Falls du etwas nachreichen willst, melde dich
                einfach unter hello@immohero.org.
              </p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl">Wie war's mit ImmoHero?</h1>
              <p className="mt-2 text-[var(--color-ink-soft)]">
                Auftrag <strong>{row.shortCode}</strong>
                {row.address ? ` · ${row.address}, ${row.city}` : ""}
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink-mute)]">
                Wie wahrscheinlich würdest du uns weiterempfehlen?
              </p>
              <div className="mt-6">
                <FeedbackForm token={token} />
              </div>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
