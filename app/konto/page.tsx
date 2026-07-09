import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrdersForCustomer } from "@/lib/db/queries";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/marketing/icons";
import { eurosPrecise, germanDateTime } from "@/lib/utils";
import { getLocale } from "@/lib/i18n.server";
import { t, type Locale } from "@/lib/i18n";

function statusBadge(locale: Locale, status: string): { label: string; tone: "neutral" | "primary" | "ink" | "success" | "warn" } {
  switch (status) {
    case "inquiry": return { label: t(locale, "order_status_inquiry"), tone: "primary" };
    case "offer_sent": return { label: t(locale, "order_status_offer_sent"), tone: "warn" };
    case "paid": return { label: t(locale, "order_status_paid"), tone: "primary" };
    case "scheduled": return { label: t(locale, "order_status_scheduled"), tone: "primary" };
    case "shooting": return { label: t(locale, "order_status_shooting"), tone: "ink" };
    case "editing": return { label: t(locale, "order_status_editing"), tone: "ink" };
    case "delivered": return { label: t(locale, "order_status_delivered"), tone: "success" };
    case "cancelled": return { label: t(locale, "order_status_cancelled"), tone: "neutral" };
    default: return { label: t(locale, "order_status_pending"), tone: "warn" };
  }
}

export default async function KontoPage() {
  const session = await auth();
  const orders = session?.user?.id ? await getOrdersForCustomer(session.user.id) : [];
  const locale = await getLocale();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <section className="container-page py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">
            {firstName ? t(locale, "konto_hello_named", { name: firstName }) : t(locale, "konto_hello_anon")}
          </h1>
          <p className="mt-1 text-[var(--color-ink-soft)]">{t(locale, "konto_subtitle")}</p>
        </div>
        <Button asChild>
          <Link href="/buchen">{t(locale, "konto_new_booking")}</Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="mt-10 p-8 text-center">
          <p className="font-serif text-2xl">{t(locale, "konto_empty_title")}</p>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{t(locale, "konto_empty_sub")}</p>
          <Button asChild size="lg" className="mt-6">
            <Link href="/buchen">{t(locale, "konto_empty_cta")}</Link>
          </Button>
        </Card>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((order) => {
            const s = statusBadge(locale, order.status);
            const isInquiryPhase = order.status === "inquiry" || order.status === "offer_sent";
            const priceCents = order.quotedPriceCents ?? order.totalCents;
            return (
              <li key={order.id} className="space-y-2">
                <Link href={`/konto/auftraege/${order.shortCode}`}>
                  <Card className="flex items-center gap-6 p-5 transition-colors hover:bg-[var(--color-bg-alt)]/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-xl">{order.shortCode}</span>
                        <Badge tone={s.tone}>{s.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                        {order.propertyAddress}, {order.propertyPlz} {order.propertyCity}
                      </p>
                      {order.scheduledAt && (
                        <p className="mt-0.5 text-xs text-[var(--color-ink-mute)]">
                          {t(locale, "konto_order_appointment_label")}: {germanDateTime(order.scheduledAt)}
                        </p>
                      )}
                    </div>
                    <div className="hidden text-right md:block">
                      <p className="font-serif text-xl">{eurosPrecise(priceCents)}</p>
                      <p className="text-xs text-[var(--color-ink-mute)]">
                        {isInquiryPhase && order.status === "inquiry"
                          ? t(locale, "sum_estimate_note")
                          : t(locale, "konto_order_tax_note")}
                      </p>
                    </div>
                    <ArrowRightIcon size={20} className="text-[var(--color-ink-mute)]" />
                  </Card>
                </Link>
                {order.status === "offer_sent" && order.paymentUrl ? (
                  <Button asChild size="sm">
                    <a href={order.paymentUrl}>{t(locale, "konto_pay_now")} →</a>
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
