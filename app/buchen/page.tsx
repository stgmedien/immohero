import { BookingProvider } from "@/components/booking/booking-store";
import { Stepper } from "@/components/booking/stepper";
import { SummaryCard } from "@/components/booking/summary-card";
import { ServiceStep } from "@/components/booking/service-step";
import { SERVICES, BUNDLES } from "@/lib/services";
import { getLocale } from "@/lib/i18n.server";
import { t } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ paket?: string; service?: string }>;
}

export default async function BuchenStartPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const initialBundle = BUNDLES.find((b) => b.slug === params.paket) ? params.paket : undefined;
  const initialService = SERVICES.find((s) => s.slug === params.service) ? params.service : undefined;

  const initial: { bundleSlug?: string | null; serviceSlugs?: string[] } = {};
  if (initialBundle) initial.bundleSlug = initialBundle;
  if (initialService) initial.serviceSlugs = [initialService];

  return (
    <BookingProvider initial={initial}>
      <section className="container-page py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-serif text-3xl md:text-4xl">{t(locale, "buchen_title")}</h1>
          <Stepper current={1} />
        </div>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <ServiceStep />
          <SummaryCard />
        </div>
      </section>
    </BookingProvider>
  );
}
