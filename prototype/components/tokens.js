// Design tokens for ImmoHero
// Natur/Grün aesthetic — warm off-whites, moss primary, terracotta accent

const PALETTES = {
  moss: {
    name: 'Moos',
    bg: '#F4F2EC',
    bgAlt: '#ECE8DD',
    surface: '#FFFFFF',
    ink: '#1E2319',
    inkSoft: '#5A5F52',
    inkMute: '#8A8E80',
    line: '#D9D4C4',
    primary: '#3F5A3A',
    primaryInk: '#F4F2EC',
    primarySoft: '#E4E8DE',
    accent: '#C2623E',
    accentSoft: '#F2DED3',
    success: '#3F5A3A',
    warn: '#C2623E',
  },
  mossDark: {
    name: 'Moos Dark',
    bg: '#191C17',
    bgAlt: '#22261F',
    surface: '#2A2E26',
    ink: '#EDEBE2',
    inkSoft: '#B5B4A8',
    inkMute: '#7F8175',
    line: '#3A3F34',
    primary: '#B3C9A4',
    primaryInk: '#191C17',
    primarySoft: '#2F3A29',
    accent: '#E08A66',
    accentSoft: '#3D2B22',
    success: '#B3C9A4',
    warn: '#E08A66',
  },
  sand: {
    name: 'Sand',
    bg: '#FAF6EE',
    bgAlt: '#F1EADB',
    surface: '#FFFFFF',
    ink: '#2A2418',
    inkSoft: '#6B6250',
    inkMute: '#9E9582',
    line: '#E4DCC7',
    primary: '#5C4A2A',
    primaryInk: '#FAF6EE',
    primarySoft: '#EFE6D0',
    accent: '#A85934',
    accentSoft: '#F3DFD1',
    success: '#5C7A3D',
    warn: '#A85934',
  },
};

const DENSITIES = {
  compact: { pad: 14, gap: 10, radius: 14, h: 38, hLg: 46, fs: 14 },
  cozy: { pad: 20, gap: 16, radius: 18, h: 44, hLg: 54, fs: 15 },
  airy: { pad: 28, gap: 22, radius: 22, h: 50, hLg: 62, fs: 16 },
};

const COPY_TONES = {
  friendly: {
    heroTitle: 'Finde die richtigen Leute für deine Immobilie.',
    heroSub: 'Fotograf·innen, Drohnenflieger und Grundriss-Profis – automatisch gematcht, in einer Buchung.',
    ctaStart: 'Loslegen',
    matchLead: 'Das sind deine besten Treffer',
    matchSub: 'Sortiert nach Passgenauigkeit, Entfernung und Verfügbarkeit.',
    onboardTitle: 'Erzähl uns ein bisschen von deiner Immobilie',
    onboardSub: 'So finden wir die passenden Profis. Dauert ungefähr zwei Minuten.',
    bookCta: 'Termin sichern',
  },
  pro: {
    heroTitle: 'Professionelle Immobilienmedien, intelligent vermittelt.',
    heroSub: 'Fotografie, Drohne, Grundriss. Kuratiertes Anbieternetzwerk, eine Buchung.',
    ctaStart: 'Projekt starten',
    matchLead: 'Empfohlene Anbieter',
    matchSub: 'Gewichtet nach Standort, Spezialisierung und Verfügbarkeit.',
    onboardTitle: 'Objekt erfassen',
    onboardSub: 'Bitte hinterlegen Sie die Rahmendaten Ihrer Immobilie.',
    bookCta: 'Termin buchen',
  },
};

window.IH_PALETTES = PALETTES;
window.IH_DENSITIES = DENSITIES;
window.IH_COPY = COPY_TONES;
