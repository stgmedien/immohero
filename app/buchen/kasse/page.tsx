import { BookingProvider } from "@/components/booking/booking-store";
import { Stepper } from "@/components/booking/stepper";
import { SummaryCard } from "@/components/booking/summary-card";
import { CheckoutStep } from "@/components/booking/checkout-step";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function KassePage() {
  const locale = await getLocale();
  return (
    <BookingProvider>
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-serif text-3xl md:text-4xl">{t(locale, "buchen_checkout_title")}</h1>
          <Stepper current={4} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <CheckoutStep />
          <SummaryCard />
        </div>
      </section>
    </BookingProvider>
  );
}
