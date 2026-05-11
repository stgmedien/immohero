import { z } from "zod";
import { SERVICES, BUNDLES, getBundle, getService, bundlePriceCents, bundleSubtotalCents } from "@/lib/services";

export const propertyTypeSchema = z.enum([
  "wohnung",
  "haus",
  "villa",
  "mfh",
  "gewerbe",
  "industrie",
  "grundstueck",
  "bauprojekt",
]);

export const bookingDraftSchema = z.object({
  bundleSlug: z.string().nullable().optional(),
  serviceSlugs: z.array(z.string()).default([]),
  property: z.object({
    type: propertyTypeSchema,
    address: z.string().min(3, "Straße und Hausnummer sind nötig."),
    plz: z.string().regex(/^\d{5}$/, "PLZ muss aus 5 Ziffern bestehen."),
    city: z.string().min(2, "Stadt fehlt."),
    sizeQm: z.number().int().positive().optional(),
    notes: z.string().max(2000).optional(),
  }),
  schedule: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  customer: z.object({
    firstName: z.string().min(1, "Vorname fehlt."),
    lastName: z.string().min(1, "Nachname fehlt."),
    email: z.string().email("Bitte eine gültige E-Mail-Adresse angeben."),
    phone: z.string().min(5, "Telefon fehlt."),
    company: z.string().optional(),
  }),
});

export type BookingDraft = z.infer<typeof bookingDraftSchema>;

export interface BookingSummary {
  items: { name: string; slug: string; priceCents: number }[];
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  taxInfo: string;
}

export function summarizeBooking(input: {
  bundleSlug?: string | null;
  serviceSlugs: string[];
}): BookingSummary {
  if (input.bundleSlug) {
    const bundle = getBundle(input.bundleSlug);
    if (bundle) {
      const items = bundle.serviceSlugs
        .map((slug) => getService(slug))
        .filter((s): s is NonNullable<typeof s> => Boolean(s))
        .map((s) => ({ name: s.name, slug: s.slug, priceCents: s.priceCents }));
      const subtotal = bundleSubtotalCents(bundle);
      const total = bundlePriceCents(bundle);
      return {
        items,
        subtotalCents: subtotal,
        discountCents: subtotal - total,
        totalCents: total,
        taxInfo: "inkl. 19 % MwSt",
      };
    }
  }

  const items = input.serviceSlugs
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({ name: s.name, slug: s.slug, priceCents: s.priceCents }));

  const subtotal = items.reduce((sum, i) => sum + i.priceCents, 0);
  return {
    items,
    subtotalCents: subtotal,
    discountCents: 0,
    totalCents: subtotal,
    taxInfo: "inkl. 19 % MwSt",
  };
}

export function generateTimeSlots(): string[] {
  return ["08:00", "10:00", "12:00", "14:00", "16:00"];
}

export function generateUpcomingDates(daysAhead = 14): string[] {
  const out: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 2; i < daysAhead + 2; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const weekday = d.getDay();
    if (weekday === 0) continue; // Sunday off
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export const ALL_SERVICE_SLUGS = SERVICES.map((s) => s.slug);
export const ALL_BUNDLE_SLUGS = BUNDLES.map((b) => b.slug);
