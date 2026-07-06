/**
 * Seed: erster Academy-Kurs mit 3 Lektionen (idempotent per Slug).
 *   node --env-file=.env.local scripts/seed-academy.mjs
 */
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const COURSE = {
  slug: "a1-a3-in-4-wochen",
  title: "Drohnen-Führerschein: A1/A3 in 4 Wochen",
  description:
    "Der EU-Kompetenznachweis A1/A3 ist dein Einstieg in die offene Kategorie — Pflicht für fast alle Drohnen ab 250 g und der erste Schritt Richtung bezahlte Aufträge. Dieser Kurs führt dich in 4 Wochen zum Online-Test beim LBA.",
  level: "basic",
};

const LESSONS = [
  {
    slug: "woche-1-grundlagen-und-registrierung",
    title: "Woche 1: Grundlagen & Betreiber-Registrierung",
    durationMin: 25,
    body: `# Was du diese Woche schaffst

- Du verstehst die **offene Kategorie** (A1/A2/A3) und wo deine Drohne hingehört
- Du registrierst dich als **UAS-Betreiber** beim Luftfahrt-Bundesamt
- Deine **e-ID** klebt auf der Drohne

## Die offene Kategorie in 3 Sätzen

Die EU teilt Drohnenflüge in drei Kategorien: **offen** (geringes Risiko, keine Genehmigung), **speziell** (Genehmigung nötig) und **zulassungspflichtig**. Fast alles, was du als Einsteiger fliegst, ist offene Kategorie. Innerhalb der offenen Kategorie entscheiden Gewicht und Abstand zu Menschen über die Unterkategorie A1, A2 oder A3.

## Betreiber-Registrierung (Pflicht!)

Sobald deine Drohne eine Kamera hat oder 250 g überschreitet, musst du dich als Betreiber registrieren:

- Registrierung beim [Luftfahrt-Bundesamt](https://www.lba.de) (LBA)
- Du bekommst eine **e-ID** (z. B. DEU87astrdge12k8)
- Diese e-ID muss **sichtbar an jeder deiner Drohnen** angebracht sein

## Versicherung

Eine **Drohnen-Haftpflicht ist in Deutschland Pflicht** — für jede Drohne, auch unter 250 g. Viele private Haftpflichtversicherungen schließen Drohnen aus; prüfe das oder schließe eine spezielle Drohnen-Haftpflicht ab (ab ca. 3–6 €/Monat).

**Frag den Pilot-Guide** (unten rechts), wenn du unsicher bist, welche Regeln für dein Modell gelten — er zitiert dir die Quelle.`,
  },
  {
    slug: "woche-2-luftraum-und-geo-zonen",
    title: "Woche 2: Luftraum, Geo-Zonen & die 120-Meter-Regel",
    durationMin: 30,
    body: `# Wo du fliegen darfst — und wo nicht

## Die wichtigsten Grundregeln der offenen Kategorie

- **Maximal 120 m** über Grund
- Immer in **Sichtweite** (VLOS) fliegen
- **Nicht über Menschenansammlungen**
- Kein Abwurf von Gegenständen, keine Gefahrstoffe

## Geografische UAS-Gebiete (Geo-Zonen)

In Deutschland gelten zusätzlich die Regeln aus **§ 21h LuftVO**: Abstände zu Flughäfen, Krankenhäusern, Industrieanlagen, Bundesfernstraßen, Bahnanlagen, Naturschutzgebieten, Wohngrundstücken u. v. m.

Dein wichtigstes Werkzeug: die **Digitale Plattform Unbemannte Luftfahrt** ([dipul.de](https://www.dipul.de)) — die offizielle Karte des Bundes mit allen Geo-Zonen. Vor JEDEM Flug checken.

## Wohngrundstücke — der Klassiker für Immobilien-Piloten

Der Überflug von Wohngrundstücken ist nur unter engen Voraussetzungen erlaubt (u. a. Drohne unter 250 g ODER Zustimmung der Betroffenen). Genau deshalb ist die **Zustimmung des Eigentümers** bei Immobilien-Shootings Standard — bei ImmoHero-Aufträgen ist sie Teil des Auftragsprozesses.

- Übungsaufgabe: Öffne dipul.de und prüfe deinen Wohnort — welche Zonen liegen in 1 km Umkreis?`,
  },
  {
    slug: "woche-3-4-pruefung-und-erster-flug",
    title: "Woche 3–4: LBA-Onlineprüfung & dein erster sauberer Flug",
    durationMin: 35,
    body: `# Der Kompetenznachweis A1/A3

## So läuft die Prüfung

- **Online-Training + Online-Prüfung** direkt beim LBA
- 40 Multiple-Choice-Fragen, 75 % müssen sitzen, mehrere Versuche möglich
- Themen: Luftrecht, menschliches Leistungsvermögen, Betriebsverfahren, Technik, Datenschutz, Versicherung
- Der Nachweis gilt **5 Jahre**, EU-weit

## Lernstrategie (2 Wochen reichen)

- Woche 3: LBA-Trainingsmodule durcharbeiten (2–3 Abende)
- Woche 4: Probefragen üben, dann Prüfung — den Rest der Woche: **fliegen üben**

## Dein erster strukturierter Übungsflug

Übe auf freiem Feld (A3-Umgebung, keine Menschen in der Nähe):

1. **Schwebeflug** auf 2 m — 60 Sekunden ruhig halten
2. **Viereck** fliegen, Nase immer in Flugrichtung
3. **Orbit** um einen Punkt (Baum, Pfosten) — die Königsdisziplin für Immobilien
4. **Return-to-Home** bewusst auslösen und beobachten

## Und danach?

Mit A1/A3 + 10–20 Übungsstunden bist du bereit für die **Einstufung durch unseren Pilot-Guide** — er sagt dir, ob als Nächstes der A2-Schein, ein Assessor-Call oder schon ein Beispielauftrag dran ist. Ab Passport-Level 3 bist du für echte ImmoHero-Aufträge sichtbar (Ø 339 € pro Projekt).`,
  },
];

const [existing] = await sql.query(`SELECT id FROM academy_course WHERE slug = $1`, [COURSE.slug]);
let courseId = existing?.id;
if (!courseId) {
  const [row] = await sql.query(
    `INSERT INTO academy_course (id, slug, title, description, level, position, published)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, 0, true) RETURNING id`,
    [COURSE.slug, COURSE.title, COURSE.description, COURSE.level],
  );
  courseId = row.id;
  console.log("Kurs angelegt:", COURSE.title);
} else {
  console.log("Kurs existiert schon — Lektionen werden ergänzt, falls fehlend.");
}

let pos = 0;
for (const l of LESSONS) {
  const [ex] = await sql.query(`SELECT id FROM academy_lesson WHERE course_id = $1 AND slug = $2`, [courseId, l.slug]);
  if (ex) {
    pos++;
    continue;
  }
  await sql.query(
    `INSERT INTO academy_lesson (id, course_id, slug, title, body, duration_min, position, published)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, true)`,
    [courseId, l.slug, l.title, l.body, l.durationMin, pos++],
  );
  console.log("Lektion angelegt:", l.title);
}
console.log("Seed fertig → https://immohero.org/academy");

/* ---------------- Erweiterung (Ausbau 2026-07): Quiz + Bezahlkurs ---------------- */

// 1) Quiz auf die Woche-2-Lektion (Geo-Zonen) — Bestehen ab 70 % schließt die Lektion ab.
const WEEK2_QUIZ = [
  {
    question: "Wie hoch darfst du in der offenen Kategorie maximal über Grund fliegen?",
    options: ["50 Meter", "100 Meter", "120 Meter", "150 Meter"],
    correctIndex: 2,
    explanation: "Die offene Kategorie erlaubt maximal 120 m über Grund (Art. 4 DVO (EU) 2019/947).",
  },
  {
    question: "Was ist dipul.de?",
    options: [
      "Ein Drohnen-Shop",
      "Die offizielle Karte des Bundes mit allen Geo-Zonen",
      "Ein Forum fuer FPV-Piloten",
      "Die Pruefungsplattform des LBA",
    ],
    correctIndex: 1,
    explanation: "Die Digitale Plattform Unbemannte Luftfahrt zeigt alle geografischen UAS-Gebiete — vor jedem Flug checken.",
  },
  {
    question: "Wann darfst du ein fremdes Wohngrundstueck ueberfliegen?",
    options: [
      "Immer, solange du unter 120 m bleibst",
      "Nur nachts",
      "U. a. wenn die Drohne unter 250 g wiegt ODER die Betroffenen zustimmen",
      "Gar nicht",
    ],
    correctIndex: 2,
    explanation: "§ 21h LuftVO erlaubt den Ueberflug nur unter engen Voraussetzungen — deshalb ist die Eigentuemer-Zustimmung bei Immobilien-Shootings Standard.",
  },
  {
    question: "Musst du deine Drohne in Sichtweite (VLOS) fliegen?",
    options: ["Ja, immer in der offenen Kategorie", "Nein, mit App-Anzeige nicht", "Nur ueber 250 g", "Nur in Staedten"],
    correctIndex: 0,
    explanation: "VLOS ist Grundregel der offenen Kategorie — der direkte Sichtkontakt darf nicht abreissen.",
  },
];

const [week2] = await sql.query(
  `SELECT id, quiz FROM academy_lesson WHERE course_id = $1 AND slug = $2`,
  [courseId, "woche-2-luftraum-und-geo-zonen"],
);
if (week2 && !week2.quiz) {
  await sql.query(`UPDATE academy_lesson SET quiz = $1 WHERE id = $2`, [JSON.stringify(WEEK2_QUIZ), week2.id]);
  console.log("Quiz auf Woche-2-Lektion gesetzt (4 Fragen).");
}

// 2) Kostenloser Kurs bekommt einen Katalog-Teaser
await sql.query(
  `UPDATE academy_course SET summary = $1 WHERE id = $2 AND summary IS NULL`,
  ["In 4 Wochen zum EU-Kompetenznachweis — dein Pflicht-Einstieg in bezahlte Drohnen-Jobs.", courseId],
);

// 3) Bezahlkurs (Fundament: gesperrt bis zur Freischaltung, Taster-Lektion offen)
const PAID = {
  slug: "immobilien-bildsprache-masterclass",
  title: "Immobilien-Bildsprache Masterclass",
  summary: "Die komplette ImmoHero-Produktionsmethodik: Shotlisten, Lichtfenster, Flugmuster, Schnitt.",
  description:
    "Vom Piloten zum Immobilien-Filmemacher: In dieser Masterclass lernst du die komplette ImmoHero-Produktionsmethodik — dieselben Shotlisten, Flugmuster und Qualitaetsstandards, mit denen unsere Teams echte Auftraege fliegen. Level: Fortgeschritten. Freischaltung aktuell persoenlich (auf Anfrage).",
  level: "intermediate",
  priceCents: 14900,
};

const [paidExisting] = await sql.query(`SELECT id FROM academy_course WHERE slug = $1`, [PAID.slug]);
let paidId = paidExisting?.id;
if (!paidId) {
  const [row] = await sql.query(
    `INSERT INTO academy_course (id, slug, title, description, summary, level, price_cents, position, published)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, 10, true) RETURNING id`,
    [PAID.slug, PAID.title, PAID.description, PAID.summary, PAID.level, PAID.priceCents],
  );
  paidId = row.id;
  console.log("Bezahlkurs angelegt:", PAID.title);
}

const TASTER = {
  slug: "was-immobilienfotografie-besonders-macht",
  title: "Kostenlose Probe-Lektion: Was Immobilien-Aufnahmen besonders macht",
  durationMin: 15,
  body: `# Warum Immobilien anders sind

Immobilien-Aufnahmen sind kein Landschaftsfliegen: Der Kunde kauft **Verkaufswirkung**, nicht schoene Bilder.

## Die drei Ebenen jeder ImmoHero-Produktion

1. **Kontext** — Wo steht das Objekt? Anfahrt, Nachbarschaft, Lage-Highlights (Orbit in 40–60 m)
2. **Objekt** — Fassade, Grundstueck, Zustand (frontale und diagonale Perspektiven, 15–25 m)
3. **Detail** — das eine Merkmal, das verkauft: Pool, Garten, Dachterrasse (tiefe, langsame Shots)

## Das Lichtfenster

Die besten Immobilien-Shots entstehen in den **90 Minuten nach Sonnenaufgang** oder **vor Sonnenuntergang** — weiches Licht, lange Schatten, warme Fassaden. Mittagssonne = harte Schatten = Nacharbeit.

## Deine Aufgabe

Such dir ein Gebaeude (eigenes Grundstueck oder mit Erlaubnis) und plane die drei Ebenen ALS LISTE, bevor du startest. Genau so beginnt jeder echte Auftrag — mit der Shotliste, nie mit dem Start.

**Im vollen Kurs:** die komplette ImmoHero-Shotlisten-Bibliothek, Flugmuster-Training, Schnitt-Workflows und Abnahme-Kriterien der Redaktion.`,
};

const [tasterEx] = await sql.query(`SELECT id FROM academy_lesson WHERE course_id = $1 AND slug = $2`, [paidId, TASTER.slug]);
if (!tasterEx) {
  await sql.query(
    `INSERT INTO academy_lesson (id, course_id, slug, title, body, duration_min, position, published)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, 0, true)`,
    [paidId, TASTER.slug, TASTER.title, TASTER.body, TASTER.durationMin],
  );
  console.log("Taster-Lektion angelegt:", TASTER.title);
}

const LOCKED = [
  { slug: "shotlisten-bibliothek", title: "Die ImmoHero-Shotlisten-Bibliothek", durationMin: 40 },
  { slug: "flugmuster-training", title: "Flugmuster-Training: Orbit, Reveal, Push-in", durationMin: 45 },
  { slug: "schnitt-und-abgabe", title: "Schnitt, Farbe & Abgabe nach Redaktions-Standard", durationMin: 50 },
];
let lpos = 1;
for (const l of LOCKED) {
  const [ex] = await sql.query(`SELECT id FROM academy_lesson WHERE course_id = $1 AND slug = $2`, [paidId, l.slug]);
  if (ex) {
    lpos++;
    continue;
  }
  await sql.query(
    `INSERT INTO academy_lesson (id, course_id, slug, title, body, duration_min, position, published)
     VALUES (gen_random_uuid()::text, $1, $2, $3, $4, $5, $6, true)`,
    [paidId, l.slug, l.title, "*Inhalt wird mit der Freischaltung sichtbar.*", l.durationMin, lpos++],
  );
  console.log("Gesperrte Lektion angelegt:", l.title);
}
console.log("Seed-Erweiterung fertig (Quiz + Bezahlkurs).");
