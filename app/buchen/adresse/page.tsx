import { BookingProvider } from "@/components/booking/booking-store";
import { Stepper } from "@/components/booking/stepper";
import { SummaryCard } from "@/components/booking/summary-card";
import { PropertyStep } from "@/components/booking/property-step";

export default function AdressePage() {
  return (
    <BookingProvider>
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-serif text-3xl md:text-4xl">Deine Immobilie</h1>
          <Stepper current={2} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <PropertyStep />
          <SummaryCard />
        </div>
      </section>
    </BookingProvider>
  );
}
