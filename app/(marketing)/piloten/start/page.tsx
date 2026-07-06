import type { Metadata } from "next";
import { OnboardingWizard } from "@/components/pilot/onboarding-wizard";

export const metadata: Metadata = {
  title: "Piloten-Onboarding — in 3 Minuten zur Einstufung",
  description:
    "Beantworte vier kurze Fragen und erhalte sofort deine Piloten-Einstufung, deinen Academy-Kurs und deinen Weg zu bezahlten Immobilien-Aufträgen.",
  robots: { index: false },
};

export default function OnboardingStartPage() {
  return (
    <section className="container-page flex min-h-[70vh] items-start justify-center py-14 md:py-20">
      <OnboardingWizard />
    </section>
  );
}
