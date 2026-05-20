/**
 * Öffentlicher Changelog von ImmoHero.
 *
 * Neue Einträge oben einfügen. Datum im Format YYYY-MM-DD.
 * Tags: "feature" (neu), "improvement" (besser), "fix" (Bugfix), "internal" (unter der Haube).
 *
 * Schreibstil: kurz, in Kundensprache, keine internen Jargon-Begriffe.
 */

export type ChangelogTag = "feature" | "improvement" | "fix" | "internal";

export interface ChangelogEntry {
  /** YYYY-MM-DD */
  date: string;
  title: string;
  tags: ChangelogTag[];
  /** Stichpunkt-Highlights (werden als Liste gerendert) */
  highlights?: string[];
  /** Optionaler Fließtext darüber */
  body?: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-05-19",
    title: "Großes Mai-Update: 15 neue Funktionen rund um Auftrag, Feedback & Empfehlung",
    tags: ["feature", "improvement"],
    body: "In einem Schwung haben wir die Plattform breit ausgebaut — mit Fokus auf Transparenz für unsere Kunden und mehr Selbstständigkeit im Konto-Bereich.",
    highlights: [
      "Auftrags-Timeline & Aktivitäts-Historie im Konto — sehen, was gerade an deinem Projekt passiert",
      "Termin selbst verschieben (mind. 24 Std. Vorlauf) — kein E-Mail-Pingpong mehr",
      "NPS-Feedback nach Lieferung — uns in 30 Sekunden Rückmeldung geben",
      "Direkter Chat pro Auftrag — Nachrichten zwischen Kunde und Team",
      "Lieblings-Shots & Anmerkungen pro Foto im Lieferungs-Portal",
      "Unterlagen nachreichen direkt im Konto (Schlüssel-Infos, Grundriss-Scans …)",
      "Empfehlungs-Programm: jeder Kunde bekommt nach Lieferung einen 50-€-Code zum Weitergeben",
      "Termin-Erinnerungen 24 h und 2 h vorher — automatisch per Mail (und optional WhatsApp)",
      "WhatsApp-/SMS-Kanal — bevorzugter Kommunikationsweg pro Kunde wählbar",
      "Öffentliche Status-Seite unter /status — Live-Übersicht aller Komponenten",
      "DE/EN-Sprachumschalter in der Navigation",
      "Mehrere kleinere Verbesserungen unter der Haube (Analytics, Health-Scoring im CRM, Cron-Jobs)",
    ],
  },
  {
    date: "2026-05-19",
    title: "Tab-Logo & sauberer Login",
    tags: ["improvement", "fix"],
    highlights: [
      "Eigenes ImmoHero-Icon im Browser-Tab statt generischem Punkt",
      "Login-Bug behoben (Admin-Sessions wurden auf eine nicht existierende Seite umgeleitet)",
    ],
  },
  {
    date: "2026-05-19",
    title: "Stornierung & Erstattung, Profilbearbeitung, Fehler-Monitoring",
    tags: ["feature", "improvement"],
    highlights: [
      "Aufträge im Studio stornieren — mit Voll- oder Teilerstattung über Stripe und Kunden-Benachrichtigung",
      "Profilbearbeitung im Kundenkonto: Name und Telefonnummer selbst aktualisieren",
      "Sentry Error-Monitoring eingebunden — Probleme werden schneller erkannt und behoben",
    ],
  },
  {
    date: "2026-05-19",
    title: "Konsistente Antwort-Adresse hello@immohero.org",
    tags: ["improvement"],
    highlights: [
      "Alle ausgehenden E-Mails haben jetzt einheitlich Reply-To: hello@immohero.org — Antworten landen zuverlässig in einem Postfach",
    ],
  },
  {
    date: "2026-05-19",
    title: "Abo-Bereich für Bestandskunden",
    tags: ["feature"],
    body: "Bestehende Abo-Kunden bekommen einen eigenen Self-Service-Bereich.",
    highlights: [
      "Ein-Klick-Einreichung neuer Objekte (Adresse, Typ, Fotos, Notizen)",
      "Persönliche Leistungs-Auswahl: einmal festlegen, was bei jedem Objekt umgesetzt wird",
      "Übersicht aller eigenen Einreichungen samt Status",
      "Magic-Link-Login per E-Mail — kein Passwort nötig",
    ],
  },
  {
    date: "2026-05-19",
    title: "Beratungsgespräch im Buchungsfunnel + Google-Calendar-Sync",
    tags: ["feature"],
    highlights: [
      "Optional ein Beratungsgespräch vor dem Shooting buchen",
      "Termine landen automatisch im Team-Kalender (Google Calendar)",
      "Video-Call-Link wird mit der Bestätigungs-Mail mitgeschickt",
    ],
  },
  {
    date: "2026-05-19",
    title: "Plattform-Launch auf immohero.org",
    tags: ["feature"],
    highlights: [
      "Marketing-Site mit Paketen, Einzelleistungen und FAQ",
      "Buchungsfunnel mit Stripe-Checkout und Bestätigungs-Mail",
      "Studio-Backend mit Projekt-Workflow, CRM und Lieferungs-Portal",
      "Kundenkonto mit Auftragshistorie und Magic-Link-Login",
    ],
  },
];
