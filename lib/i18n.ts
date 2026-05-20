import { cookies, headers } from "next/headers";

export type Locale = "de" | "en";

const DICT: Record<Locale, Record<string, string>> = {
  de: {
    // TopNav
    nav_packages: "Pakete",
    nav_services: "Einzelservices",
    nav_faq: "FAQ",
    nav_account: "Konto",
    nav_studio: "Studio",
    nav_login: "Login",
    nav_book: "Jetzt buchen",
    // Hero
    hero_badge: "Aktiv in OWL & NRW · MwSt enthalten",
    hero_headline: "Professionelle Immobilien­medien, ohne Umwege.",
    hero_sub:
      "Fotografie, Drohne, Video, 360°-Tour, Matterport, Grundrisse und Exposé-Texte — schnell gebucht, kuratiert geliefert. Ein Team. Ein Preis. Eine Buchung.",
    hero_cta_book: "Jetzt buchen",
    hero_cta_packages: "Pakete ansehen",
    hero_caption: "Aktuelles Beispielobjekt · Gütersloh",
    hero_alt_aerial: "Drohnenfoto Mehrfamilienhaus aus der Luft",
    hero_chip_drone: "Drohne · 4K",
    hero_chip_shot: "Hero · Schräg",
    hero_pill_delivery: "Lieferung in 48 Std.",
    hero_stat_delivery_label: "Lieferzeit",
    hero_stat_delivery_value: "48 Std.",
    hero_stat_area_label: "Servicegebiet",
    hero_stat_area_value: "OWL · NRW",
    hero_stat_pricing_label: "Pakete",
    hero_stat_pricing_value: "ab 79 €",
    gallery_detail: "Detail",
    gallery_angle: "Schräg",
    gallery_context: "Kontext",
    // Footer
    footer_tagline:
      "Professionelle Immobilienmedien, in OWL & NRW geliefert. Foto, Drohne, Video, 360°, Grundriss, Text.",
    footer_col_services: "Services",
    footer_col_company: "Unternehmen",
    footer_col_legal: "Rechtliches",
    footer_link_packages: "Pakete",
    footer_link_faq: "FAQ",
    footer_link_about: "Über uns",
    footer_link_changelog: "Changelog",
    footer_link_status: "Status",
    footer_link_contact: "Kontakt",
    footer_link_imprint: "Impressum",
    footer_link_privacy: "Datenschutz",
    footer_link_terms: "AGB",
    footer_copy: "Alle Preise inkl. MwSt. wenn nicht anders ausgewiesen.",
  },
  en: {
    // TopNav
    nav_packages: "Packages",
    nav_services: "Services",
    nav_faq: "FAQ",
    nav_account: "Account",
    nav_studio: "Studio",
    nav_login: "Log in",
    nav_book: "Book now",
    // Hero
    hero_badge: "Serving OWL & NRW · VAT included",
    hero_headline: "Professional real-estate media, the direct way.",
    hero_sub:
      "Photography, drone, video, 360° tours, Matterport, floor plans and listing copy — quick to book, curated delivery. One team. One price. One booking.",
    hero_cta_book: "Book now",
    hero_cta_packages: "See packages",
    hero_caption: "Recent example · Gütersloh",
    hero_alt_aerial: "Aerial drone photo of a multi-family building",
    hero_chip_drone: "Drone · 4K",
    hero_chip_shot: "Hero · Angled",
    hero_pill_delivery: "Delivery in 48 h",
    hero_stat_delivery_label: "Turnaround",
    hero_stat_delivery_value: "48 h",
    hero_stat_area_label: "Service area",
    hero_stat_area_value: "OWL · NRW",
    hero_stat_pricing_label: "Packages",
    hero_stat_pricing_value: "from €79",
    gallery_detail: "Detail",
    gallery_angle: "Angled",
    gallery_context: "Context",
    // Footer
    footer_tagline:
      "Professional real-estate media, delivered in OWL & NRW. Photo, drone, video, 360°, floor plan, copy.",
    footer_col_services: "Services",
    footer_col_company: "Company",
    footer_col_legal: "Legal",
    footer_link_packages: "Packages",
    footer_link_faq: "FAQ",
    footer_link_about: "About",
    footer_link_changelog: "Changelog",
    footer_link_status: "Status",
    footer_link_contact: "Contact",
    footer_link_imprint: "Imprint",
    footer_link_privacy: "Privacy",
    footer_link_terms: "Terms",
    footer_copy: "All prices include VAT unless stated otherwise.",
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
