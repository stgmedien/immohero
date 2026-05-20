import { cookies, headers } from "next/headers";

export type Locale = "de" | "en";

const DICT: Record<Locale, Record<string, string>> = {
  de: {
    hero_eyebrow: "Immobilienmedien für OWL & NRW",
    hero_headline: "Schnell gebucht. Professionell gedreht. Kuratiert geliefert.",
    hero_sub: "Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse — alles aus einer Hand.",
    cta_book: "Jetzt buchen",
    cta_consult: "Beratungsgespräch",
    nav_packages: "Pakete",
    nav_services: "Leistungen",
    nav_about: "Über uns",
    nav_contact: "Kontakt",
    nav_account: "Konto",
    nav_login: "Login",
  },
  en: {
    hero_eyebrow: "Real-estate media for North-Rhine-Westphalia",
    hero_headline: "Quick to book. Professionally shot. Curated delivery.",
    hero_sub: "Photography, drone, video, 360° tours, Matterport, floor plans — one team, one workflow.",
    cta_book: "Book now",
    cta_consult: "Consultation",
    nav_packages: "Packages",
    nav_services: "Services",
    nav_about: "About",
    nav_contact: "Contact",
    nav_account: "Account",
    nav_login: "Login",
  },
};

export async function getLocale(): Promise<Locale> {
  const c = await cookies();
  const ck = c.get("locale")?.value;
  if (ck === "en" || ck === "de") return ck;
  const h = await headers();
  const al = h.get("accept-language") ?? "";
  if (al.toLowerCase().startsWith("en")) return "en";
  return "de";
}

export function t(locale: Locale, key: string): string {
  return DICT[locale]?.[key] ?? DICT.de[key] ?? key;
}
