import { BookingProvider } from "@/components/booking/booking-store";
import { Stepper } from "@/components/booking/stepper";
import { SummaryCard } from "@/components/booking/summary-card";
import { ScheduleStep } from "@/components/booking/schedule-step";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

export default async function TerminPage() {
  const locale = await getLocale();
  return (
    <BookingProvider>
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-serif text-3xl md:text-4xl">{t(locale, "buchen_schedule_title")}</h1>
          <Stepper current={3} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ScheduleStep />
          <SummaryCard />
        </div>
      </section>
    </BookingProvider>
  );
}
