import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { feedback, orders } from "@/lib/db/schema";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/site/logo";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

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
  const locale = await getLocale();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="container-page max-w-xl">
        <Logo />
        <Card className="mt-6 p-7">
          {row.completedAt ? (
            <>
              <h1 className="font-serif text-3xl">{t(locale, "fb_done_title")}</h1>
              <p className="mt-2 text-[var(--color-ink-soft)]">{t(locale, "fb_done_sub")}</p>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl">{t(locale, "fb_question_title")}</h1>
              <p className="mt-2 text-[var(--color-ink-soft)]">
                {row.shortCode}
                {row.address ? ` · ${row.address}, ${row.city}` : ""}
              </p>
              <p className="mt-1 text-sm text-[var(--color-ink-mute)]">{t(locale, "fb_question_sub")}</p>
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
