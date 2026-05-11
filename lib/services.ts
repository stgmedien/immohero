// Service- und Bundle-Katalog (übernommen aus prototype/components/data.js)
// Energieausweis wurde entfernt (regulierter Service, kein Partner zum Launch).

export type ServiceCategory =
  | "photo"
  | "video"
  | "drone"
  | "tour"
  | "scan"
  | "plan"
  | "copy";

export type PropertyType =
  | "wohnung"
  | "haus"
  | "villa"
  | "mfh"
  | "gewerbe"
  | "industrie"
  | "grundstueck"
  | "bauprojekt";

export type StylePackage =
  | "standard"
  | "cinematic"
  | "premium"
  | "innen_360"
  | "vermessung"
  | "vorher_nachher";

export interface ServiceDefinition {
  slug: string;
  name: string;
  /** Cents, 19 % MwSt enthalten */
  priceCents: number;
  durationMinutes: number | null;
  durationLabel: string;
  shortDescription: string;
  longDescription: string;
  iconKey: string;
  category: ServiceCategory;
  /** Welche Property-Types macht der Service Sinn? */
  propertyTypes: PropertyType[];
  /** Welches Stilpaket der Shot-Bibliothek liefert die Shotliste? */
  stylePackage: StylePackage;
  popular?: boolean;
}

export const SERVICES: ServiceDefinition[] = [
  {
    slug: "fotografie",
    name: "Fotografie",
    priceCents: 24900,
    durationMinutes: 90,
    durationLabel: "1–2 Std. vor Ort",
    shortDescription: "25–40 bearbeitete Objektfotos, HDR, Retusche",
    longDescription:
      "Professionelle Innen- und Außenaufnahmen mit Tilt-Shift-Kontrolle, HDR-Bracketing und Farbretusche. Lieferung innerhalb von 48 Stunden als hochauflösende JPG.",
    iconKey: "camera",
    category: "photo",
    propertyTypes: ["wohnung", "haus", "villa", "mfh", "gewerbe"],
    stylePackage: "standard",
    popular: true,
  },
  {
    slug: "drohne",
    name: "Drohne / Luftbild",
    priceCents: 18900,
    durationMinutes: 45,
    durationLabel: "45 Min. Flug",
    shortDescription: "4K-Luftaufnahmen & Umgebungsshots",
    longDescription:
      "Hochauflösende Luftaufnahmen mit zertifiziertem Drohnenpiloten (EU-Kenntnisnachweis A2). Hero-Frontal, 45°-Hero, Top-Down und Umgebungskontext. Optional Cinematic-Reel.",
    iconKey: "drone",
    category: "drone",
    propertyTypes: ["haus", "villa", "mfh", "gewerbe", "industrie", "grundstueck", "bauprojekt"],
    stylePackage: "standard",
    popular: true,
  },
  {
    slug: "tour-360",
    name: "360°-Tour",
    priceCents: 34900,
    durationMinutes: 120,
    durationLabel: "2 Std. vor Ort",
    shortDescription: "Interaktive Rundgänge, Web-eingebettet",
    longDescription:
      "Vollständige 360°-Innenraum-Panoramen pro Raum, verlinkt zu einer begehbaren virtuellen Tour. Direkt in Exposés und Immobilienportale einbettbar.",
    iconKey: "sphere",
    category: "tour",
    propertyTypes: ["wohnung", "haus", "villa", "gewerbe"],
    stylePackage: "innen_360",
  },
  {
    slug: "video-reel",
    name: "Video / Reel",
    priceCents: 44900,
    durationMinutes: 150,
    durationLabel: "2–3 Std. Dreh + Schnitt",
    shortDescription: "Cinematischer Kurzfilm, 60–90 Sek.",
    longDescription:
      "Cinematisches Vermarktungsvideo mit Stabilizer, optionaler Drohnen-Einbindung und musikunterlegter Postproduktion. Reel-Schnitt fürs Hochformat inklusive.",
    iconKey: "play",
    category: "video",
    propertyTypes: ["wohnung", "haus", "villa", "gewerbe"],
    stylePackage: "cinematic",
  },
  {
    slug: "grundriss-2d",
    name: "Grundriss 2D",
    priceCents: 7900,
    durationMinutes: null,
    durationLabel: "Digital",
    shortDescription: "Saubere, bemaßte 2D-Grundrisse",
    longDescription:
      "Vermessung vor Ort, anschließende Erstellung eines maßstabsgetreuen 2D-Grundrisses mit Beschriftung. Liefer-Formate: PDF, PNG, SVG.",
    iconKey: "plan",
    category: "plan",
    propertyTypes: ["wohnung", "haus", "villa", "mfh", "gewerbe"],
    stylePackage: "standard",
    popular: true,
  },
  {
    slug: "grundriss-3d",
    name: "Grundriss 3D",
    priceCents: 14900,
    durationMinutes: null,
    durationLabel: "Digital",
    shortDescription: "Fotorealistische 3D-Ansicht",
    longDescription:
      "Räumlich gerenderte 3D-Grundrisse mit Möblierung und Lichtsimulation. Perfekt für Premium-Exposés und Off-Plan-Vermarktung.",
    iconKey: "cube",
    category: "plan",
    propertyTypes: ["wohnung", "haus", "villa"],
    stylePackage: "standard",
  },
  {
    slug: "matterport",
    name: "Matterport",
    priceCents: 38900,
    durationMinutes: 90,
    durationLabel: "1,5 Std. vor Ort",
    shortDescription: "Begehbare Dollhouse-Tour",
    longDescription:
      "3D-Scan mit Matterport Pro2, inkl. Dollhouse-View, Floor-Plan-View und walkthrough. Einbettung in Maklersoftware möglich.",
    iconKey: "scan",
    category: "scan",
    propertyTypes: ["wohnung", "haus", "villa", "gewerbe"],
    stylePackage: "innen_360",
  },
  {
    slug: "expose-text",
    name: "Exposé-Text",
    priceCents: 8900,
    durationMinutes: null,
    durationLabel: "Digital",
    shortDescription: "Verkaufsstarker Objekttext",
    longDescription:
      "Briefing-basierter Exposé-Text mit Headline, Lead, Objektbeschreibung, Lage und Ausstattung. Lieferung als DOCX und Plain-Text.",
    iconKey: "text",
    category: "copy",
    propertyTypes: ["wohnung", "haus", "villa", "mfh", "gewerbe"],
    stylePackage: "standard",
  },
];

export interface BundleDefinition {
  slug: string;
  name: string;
  tagline: string;
  serviceSlugs: string[];
  /** Rabatt in Prozent als Ganzzahl, z. B. 15 = 15 %. */
  discountPercent: number;
  recommended?: boolean;
}

export const BUNDLES: BundleDefinition[] = [
  {
    slug: "basis",
    name: "Basis",
    tagline: "Für schnelle Einsteiger",
    serviceSlugs: ["fotografie", "grundriss-2d"],
    discountPercent: 10,
  },
  {
    slug: "smart",
    name: "Smart",
    tagline: "Unsere Empfehlung",
    serviceSlugs: ["fotografie", "grundriss-2d", "drohne", "expose-text"],
    discountPercent: 15,
    recommended: true,
  },
  {
    slug: "premium",
    name: "Premium",
    tagline: "Für hochwertige Objekte",
    serviceSlugs: [
      "fotografie",
      "grundriss-2d",
      "grundriss-3d",
      "drohne",
      "video-reel",
      "tour-360",
      "expose-text",
    ],
    discountPercent: 20,
  },
];

export function getService(slug: string): ServiceDefinition | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getBundle(slug: string): BundleDefinition | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

export function bundleSubtotalCents(bundle: BundleDefinition): number {
  return bundle.serviceSlugs.reduce((sum, slug) => {
    const svc = getService(slug);
    return sum + (svc?.priceCents ?? 0);
  }, 0);
}

export function bundlePriceCents(bundle: BundleDefinition): number {
  const subtotal = bundleSubtotalCents(bundle);
  return Math.round(subtotal * (1 - bundle.discountPercent / 100));
}

export function bundleSavingsCents(bundle: BundleDefinition): number {
  return bundleSubtotalCents(bundle) - bundlePriceCents(bundle);
}

export const PROPERTY_TYPES: { value: PropertyType; label: string; description: string }[] = [
  { value: "wohnung", label: "Wohnung", description: "Eigentumswohnung, Mietobjekt" },
  { value: "haus", label: "Einfamilienhaus", description: "EFH, Doppelhaushälfte, Reihenhaus" },
  { value: "villa", label: "Villa / Premium", description: "Hochwertiges Objekt, großes Grundstück" },
  { value: "mfh", label: "Mehrfamilienhaus", description: "Wohnblock, Renditeobjekt" },
  { value: "gewerbe", label: "Gewerbe / Büro", description: "Büro-, Geschäftsgebäude" },
  { value: "industrie", label: "Industrie / Logistik", description: "Halle, Werkgelände, Lager" },
  { value: "grundstueck", label: "Grundstück", description: "Unbebautes Land, Bauland" },
  { value: "bauprojekt", label: "Bauprojekt", description: "Baufortschritt, Neubau" },
];
