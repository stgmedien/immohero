/**
 * Verdienst-Rechner — deterministisch, mit echten ImmoHero-Referenzwerten.
 */
export const REF_PER_PROJECT_EUR = 339; // Ø Auszahlung pro Drohnen-Projekt
export const REF_RETAINER_EUR = 449; // monatlicher Retainer (Makler-Abo)

export interface EarningsEstimate {
  projectsPerMonth: number;
  perProjectEur: number;
  retainerEur: number;
  monthlyEur: number;
  yearlyEur: number;
  assumptions: string[];
}

export function estimateEarnings(input: { projectsPerMonth: number; includeRetainer?: boolean }): EarningsEstimate {
  const projects = Math.max(0, Math.min(40, Math.round(input.projectsPerMonth)));
  const retainer = input.includeRetainer ? REF_RETAINER_EUR : 0;
  const monthly = projects * REF_PER_PROJECT_EUR + retainer;
  return {
    projectsPerMonth: projects,
    perProjectEur: REF_PER_PROJECT_EUR,
    retainerEur: retainer,
    monthlyEur: monthly,
    yearlyEur: monthly * 12,
    assumptions: [
      `Referenz: Ø ${REF_PER_PROJECT_EUR} € pro ImmoHero-Drohnenprojekt (reale Plattform-Zahl)`,
      input.includeRetainer ? `+ ${REF_RETAINER_EUR} €/Monat Makler-Retainer` : "ohne Retainer gerechnet",
      "Nebenberuflich realistisch: 2–6 Projekte/Monat je nach Region",
      "Brutto-Umsatz — Steuern/Versicherung/Anfahrt nicht abgezogen",
    ],
  };
}
