# Pilot Journey Engine — Umsetzungsplan

> Agentischer Funnel, der Hobby-Drohnenpiloten europaweit rechtssicher zum ersten
> bezahlten Auftrag führt — mit Video-Skill-Assessment und selbstaktualisierender
> Rechtsdatenbank. Zwei Personas (aeroone.eu = Academy-Guide, immohero.org =
> Creator-Recruiter), ein Backend. Ziel: Award-fähiges System + echter
> Supply-Loop für den ImmoHero-Marktplatz.
>
> Stand: Erstfassung. Erstellt aus dem Konzept-Briefing + Abgleich mit dem
> real existierenden ImmoHero-Stack.

---

## 0. Die wichtigste Erkenntnis zuerst: ~60 % existieren schon

Das Konzept nennt Supabase, HubSpot und Cal.com als Stack. **Das ist nicht euer
Stack — und ihr braucht keinen davon.** Die ImmoHero-Plattform (dieses Repo)
enthält bereits produktionsreife Äquivalente:

| Konzept sagt | Ihr habt bereits (produktiv, live) | Konsequenz |
|---|---|---|
| Supabase + pgvector | **Neon Postgres (eu-central-1)** — pgvector 0.8.0 verfügbar (verifiziert) | `CREATE EXTENSION vector`, fertig. Gleiche DB wie der Marktplatz → der "Supply-Loop" ist wörtlich dieselbe Datenbank |
| Cal.com für Assessor-Calls | **Eigene Beratungs-Engine**: `lib/consultation.ts` + `lib/google-calendar.ts` (Free/Busy, Event-CRUD, Google Meet, Accept/Decline-Flow im Studio, Bestätigungs-Mails) | Slot-Auswahl im Chat = dieselben Funktionen, die der Buchungsfunnel heute nutzt |
| HubSpot fürs CRM | **Eigenes CRM im Studio**: `customers`, `deals`, `notifications`, Audit-Log, Health-Score | Pilotenprofil = neuer Datensatztyp im selben CRM. HubSpot-Export optional später (Feld `hubspotContactId` vorsehen, sonst ignorieren) |
| "Beispielauftrag generieren" | **Shot-Bibliothek**: `lib/shots.ts` → `shotsForOrder(propertyType, stylePackages)` erzeugt heute echte Shotlisten für echte Aufträge | Der Beispielauftrag-Generator ist ein dünner Wrapper um existierenden Code — das Briefing ist *identisch* mit echten ImmoHero-Briefings. Starkes Award-Detail |
| Video-Upload | **3 fertige Vercel-Blob-Upload-Flows** (`app/api/blob/upload`, `app/api/abo/upload`, `app/api/konto/attachments/upload`) | Copy-paste-Pattern |
| Follow-up-Mails | **Resend + React-Email + Vercel-Cron** (`app/api/cron/rebooking-mail` läuft täglich) | Sequenzen = weiterer Cron nach identischem Muster |
| Streaming-Chat-UI | — (einziger echter Neubau) | Vercel AI SDK + `@ai-sdk/anthropic` |
| DSGVO/EU-Hosting | Vercel `fra1` + Neon `eu-central-1` (beides verifiziert) | "EU-first" ist bereits wahr |

**Kernentscheidung (Empfehlung):** Die Engine wird ein **Modul im ImmoHero-Repo**
— nicht ein neues Projekt mit drei neuen SaaS-Abos. Markentrennung passiert über
das Widget + optional eine Subdomain (`pilot.aeroone.eu` → gleiche
Vercel-App, Multi-Domain). Vorteile: ein Deploy-Zyklus, gemeinsame DB (der
Loop!), Studio als Ops-Oberfläche, Sentry/Auth/Mail/Cron gratis mitbenutzt.

Alternative (nur falls Aero-One-Team ≠ ImmoHero-Team werden soll): eigenes
Next.js-Repo, das per Postgres-Schema `pilot` dieselbe Neon-DB nutzt. Mehr
Setup, kein funktionaler Gewinn. Nicht empfohlen für den Start.

---

## 1. Architektur-Überblick

```
aeroone.eu ──┐                                   ┌─ Claude API (Sonnet 5)
             │  <script pilot-widget.js>         │    · Chat + Tool Use
immohero.org ┴──► iframe /(widget)/pilot ──► /api/pilot-engine/chat (SSE)
                                              │
                        ┌─────────────────────┼──────────────────────┐
                        │     Server-seitige State Machine           │
                        │  ASSESS ──► ROUTE ──► CONVERT              │
                        │  (Stage steuert, welche Tools sichtbar)    │
                        └───────┬──────────┬──────────┬──────────────┘
                                │          │          │
              ┌─────────────────┤          │          ├─────────────────┐
              ▼                 ▼          ▼          ▼                 ▼
      search_regulations  book_assessor  generate_  analyze_      register_pilot
      (pgvector RAG,      _call          sample_    footage       (CRM-Pool +
       Zitierpflicht)     (lib/consul-   brief      (Claude       Follow-up-
              │            tation.ts +   (lib/      Vision auf    Sequenz via
              ▼            GCal)         shots.ts)  Frames)       Resend-Cron)
      Neon eu-central-1: regulation_chunks (vector) · pilot_profiles ·
      pilot_sessions/messages · pilot_events · pilot_assessments · consultations
              │
              ▼
      Studio: /studio/piloten (Pool, Assessments, Funnel-Dashboard = Award-Metriken)
```

Modell-Wahl: **`claude-sonnet-5`** für Chat + Vision (Preis/Latenz/Qualität),
Prompt Caching für System-Prompt + Tool-Definitionen (Kosten −60–80 %).
`claude-haiku-4-5` für billige Nebenjobs (Session-Zusammenfassungen,
Sprach-/Intent-Klassifikation). Opus nur, falls Rechts-Antworten in Evals
schwächeln.

---

## 2. Datenmodell (Drizzle-Migration `0007`)

```ts
// Pilotenprofil — das strukturierte JSON aus dem Assess-Gespräch
pilot_profiles: {
  id uuid PK,
  email text nullable,            // bis zum E-Mail-Gate anonym
  name text nullable,
  locale varchar(2) default 'de',
  country varchar(2) default 'DE',
  plz varchar(5) nullable,
  equipment jsonb,                // [{model:"DJI Mini 4 Pro", class:"C0", ...}]
  certificates jsonb,             // {a1a3:{has:true,date:...}, a2:{...}, sts:...}
  flightHours int nullable,
  portfolio jsonb,                // Selbsteinschätzung, Links, bisherige Aufnahmen
  level varchar(16),              // basic | intermediate | advanced (null bis Assess fertig)
  levelScore int,                 // 0–100, deterministisch aus Profil + Assessment
  passportLevel int default 0,    // 0–4, siehe Pilot Passport
  memory text,                    // komprimierte Gesprächs-Zusammenfassung (Haiku)
  persona varchar(16),            // academy | recruiter (Erstkontakt)
  customerRecordId → customers,   // CRM-Verknüpfung nach Convert
  hubspotContactId text nullable, // optionaler Export, Phase 3+
  consentAt timestamp,            // DSGVO-Einwilligung am E-Mail-Gate
  createdAt / updatedAt
}

pilot_sessions: { id, profileId?, anonToken (Cookie), stage: assess|route|convert,
                  messageCount, lastSummary, createdAt, lastActiveAt }

pilot_messages: { id, sessionId, role, content, toolCalls jsonb, tokensIn, tokensOut, createdAt }
// tokensIn/Out → Kosten-Tracking pro Session, Budget-Deckel

pilot_events: { id, profileId?, sessionId, type, payload jsonb, createdAt }
// Typen: assessment_started, profile_completed, level_assigned, lead_captured,
// call_booked, brief_generated, brief_submitted, footage_uploaded,
// footage_scored, pilot_activated  ← DAS ist das Award-Metriken-Rohmaterial

pilot_assessments: { id, profileId, frames jsonb /* Blob-URLs */,
  clientJitterMetric real,        // clientseitig berechnete Verwacklungs-Kennzahl
  scores jsonb,                   // {composition:8, horizon:6, exposure:7, motion:5, reSuitability:7}
  feedback jsonb,                 // {strengths:[], improvements:[], perFrame:[]}
  overall int, suggestedLevel varchar(16), model varchar(32), createdAt }

sample_briefs: { id, profileId, brief jsonb /* generiert aus lib/shots.ts */,
                 submissionUrl text nullable, reviewedAt, reviewScore, createdAt }

// RAG-Korpus
regulation_documents: { id, country varchar(2) /* 'EU' für EASA/VO */,
  authority text, title text, sourceUrl text, version text,
  effectiveDate date, contentHash text, lastCrawledAt, status: active|superseded }

regulation_chunks: { id, documentId, sectionRef text, content text,
  embedding vector(1024), tokens int }
// + HNSW-Index: CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)
```

**Assessor-Calls:** keine neue Tabelle — die bestehende `consultations` bekommt
eine Spalte `kind varchar(16) default 'sales'` (`'pilot_assessor'` für die
Engine). Damit erben Piloten-Calls den kompletten existierenden Flow: Studio-
Ansicht, Accept/Decline, Google-Calendar-Sync, Meet-Link, Bestätigungs-Mails.

---

## 3. Agent-Design: State Machine + Tools

### Warum das kein Chatbot ist (und wie man das erzwingt)

Der entscheidende Baufehler wäre, dem Modell alle Tools zu geben und zu hoffen.
Stattdessen: **die Stage liegt server-seitig auf `pilot_sessions.stage`, und der
Server entscheidet pro Request, welche Tools das Modell überhaupt sieht:**

| Stage | Sichtbare Tools | Übergang (server-validiert) |
|---|---|---|
| **ASSESS** | `update_pilot_profile`, `search_regulations`, `compute_earnings_estimate`, `recommend_equipment` | Profil-Vollständigkeit ≥ Schwelle (Pflichtfelder: Equipment, Zertifikate, Flugstunden, Standort) → Server berechnet `level` deterministisch, Stage → ROUTE |
| **ROUTE** | alles aus ASSESS + `get_call_slots`, `book_assessor_call`, `generate_sample_brief`, `request_footage_upload` | Eine Route-Aktion erfolgreich (Call gebucht / Brief erzeugt / Footage bewertet) → CONVERT |
| **CONVERT** | + `register_pilot` (CRM-Pool + Follow-up-Sequenz aktivieren) | — |

Das Level-Scoring ist **kein LLM-Urteil**, sondern eine deterministische
Funktion (`lib/pilot/scoring.ts`) über das strukturierte Profil (+ später
Video-Score). Das LLM führt das Gespräch; die Einstufung ist reproduzierbar —
wichtig für Fairness-Fragen einer Jury.

### Tool-Definitionen (Server-Implementierung)

| Tool | Implementierung | Besonderheit |
|---|---|---|
| `update_pilot_profile` | Zod-validierter Merge in `pilot_profiles` | Modell darf nur bekannte Felder setzen; Server errechnet Vollständigkeit |
| `search_regulations` | pgvector Cosine-Similarity, Filter `country IN (profil.country, 'EU')`, Top-6 Chunks | Rückgabe enthält `sourceTitle`, `sourceUrl`, `effectiveDate` — System-Prompt erzwingt Zitat + „Stand: …" + Disclaimer |
| `get_call_slots` / `book_assessor_call` | `getAvailableConsultationSlots()` + Insert in `consultations` (kind=pilot_assessor) | **Confirm-Gate**: Buchung wird erst ausgeführt, nachdem der User im Chat einen Bestätigungs-Button geklickt hat (Human-in-the-loop für Aktionen mit Außenwirkung) |
| `generate_sample_brief` | `shotsForOrder()` + Template → realistisches ImmoHero-Briefing (Objekt, Shotliste, Abgabeformat, Deadline) | Nutzt die echte Produktions-Shotlibrary |
| `request_footage_upload` | Gibt Upload-Ticket zurück; UI rendert Upload-Zone | Siehe §5 Video-Assessment |
| `compute_earnings_estimate` | Deterministische Rechnung (Region, Kapazität/Monat × 339 €/Projekt bzw. 449 €/Retainer, Auslastungsszenarien) | Keine LLM-Mathematik — Zahlen kommen aus einer Konfigurationstabelle |
| `recommend_equipment` | Kuratierter Katalog (JSON in Repo, ~20 Einträge mit Preis, C-Klasse, ImmoHero-Mindestanforderung) + Budget-Filter | LLM formuliert nur; Auswahl ist Datenlogik |
| `register_pilot` | Upsert `customers` (kind: pilot) + `pilot_events` + Follow-up-Flag | Startet die Resend-Sequenz |

### Chat-Route

`app/api/pilot-engine/chat/route.ts` — Vercel AI SDK (`ai` +
`@ai-sdk/anthropic`), `streamText` mit Tool-Loop, SSE zum Client.
System-Prompt = Persona-Config + Stage-Instruktion + Profil-Snapshot +
`memory`. **Prompt Caching** auf System-Prompt + Tools (die ändern sich pro
Session nicht) — reduziert Kosten und Latenz massiv.

### Guardrails (nicht optional — der Endpoint ist öffentlich und kostet Geld)

- **Rate-Limit**: max. 40 Nachrichten/Session/Tag, max. 2.000 Zeichen/Nachricht,
  IP-Tageslimit (Postgres-Zähler reicht; kein Redis nötig)
- **Kosten-Deckel**: `tokensIn/Out` pro Message geloggt; täglicher Cron
  summiert, Sentry-Alert bei Schwellwert (z. B. 10 €/Tag), Kill-Switch-Env
- **History-Kompression**: ab ~15 Nachrichten fasst Haiku zusammen → `memory`,
  Verlauf wird gekürzt
- **Prompt-Injection**: RAG-Chunks und User-Uploads sind Daten, nie
  Instruktionen (Delimiter + Instruktionshierarchie im System-Prompt); alle
  seiteneffekt-behafteten Tools haben das Confirm-Gate
- **E-Mail-Gate** nach 5 Nachrichten: „Fortschritt speichern" → E-Mail +
  Consent-Checkbox (= Lead Capture + DSGVO-Einwilligung in einem Schritt)

---

## 4. Regulatorik-RAG

### Korpus Phase 1 (DE + EU, ~1.500–2.500 Chunks)

| Quelle | Format | Abruf |
|---|---|---|
| EU-DVO 2019/947 (konsolidiert) | EUR-Lex HTML | statischer Fetch |
| EU-DelVO 2019/945 (Produktklassen) | EUR-Lex HTML | statischer Fetch |
| EASA Easy Access Rules for UAS | PDF (~400 S.) | PDF→Text (`pdf-parse`), Kapitel-Chunking |
| LuftVO §21h ff. | gesetze-im-internet.de | HTML |
| LBA (Kompetenznachweise, Registrierung, Betriebsgenehmigung) | HTML-Seiten | Crawl definierter URLs |
| dipul.de (Geozonen-Infos, BMDV) | HTML | Crawl |

Phase 3: AT (Austro Control), FR (DGAC), NL, ES … — pro Land ~1 Tag Ingestion-Arbeit.

### Pipeline

1. **Ingestion** (`scripts/regulations/ingest.mjs`): Fetch → Text → Chunking
   (500–800 Tokens, Überschriften-basiert, 80 Tokens Overlap) → Embedding →
   `regulation_chunks`. Embeddings: **Voyage AI `voyage-3.5`** (von Anthropic
   empfohlen, großzügiger Free-Tier, 1024-dim) — Anthropic selbst hat keine
   Embedding-API. Alternative: OpenAI `text-embedding-3-small`.
2. **Zitierpflicht**: Antwortformat im System-Prompt verankert — jede rechtliche
   Aussage mit `[Quelle, Stand: TT.MM.JJJJ]` + stehender Hinweis „keine
   Rechtsberatung". Der `search_regulations`-Output enthält die Metadaten, das
   Modell kann gar nicht anders zitieren als aus dem Kontext.
3. **Länder-Routing**: `country` aus dem Profil filtert die Suche. Nicht
   unterstütztes Land → nur EASA-Ebene + Verweis auf die zuständige nationale
   Behörde (kleine statische Tabelle Land→Behörde+URL).
4. **Aktualitäts-Pipeline**: monatlicher Vercel-Cron (`0 4 1 * *` — Hobby-Plan-
   kompatibel, max. 1×/Tag ist die Grenze) crawlt Quell-URLs, vergleicht
   `contentHash`, re-chunked nur Geänderte, markiert alte Version als
   `superseded` und legt einen Review-Eintrag im Studio an (Mensch prüft Diff,
   bevor die neue Version aktiv wird). „Selbstaktualisierend mit
   Human-Review" — ehrlicher und juryfester als vollautomatisch.

### Qualitätssicherung

**Eval-Set vor Launch**: 30–50 goldene Frage-Antwort-Paare (z. B. „Darf ich mit
einer Mini 4 Pro ohne A2 über Wohngrundstücke fliegen?") als Skript gegen die
RAG-Pipeline. Kriterien: richtige Quelle zitiert, kein Halluzinieren nationaler
Regeln des falschen Landes, Disclaimer vorhanden. Läuft bei jeder
Korpus-Änderung.

---

## 5. Video-Assessment (das Award-Feature)

### Der Trick: Frame-Extraktion im Browser, nicht auf dem Server

ffmpeg auf Vercel-Serverless ist der klassische Schmerzpunkt. Die Lösung:
**gar kein Server-Video-Processing.**

1. Client: `<input type=file>` (mp4/mov/webm, ≤ 60 s, ≤ 200 MB) → unsichtbares
   `<video>`-Element → programmatisches Seeken auf 10 gleichverteilte
   Zeitpunkte → `canvas.drawImage()` → 10 JPEG-Frames à ~250 KB. Kein ffmpeg,
   keine Wasm-Downloads, funktioniert in jedem modernen Browser.
2. Zusätzlich client-seitig: einfache **Jitter-Metrik** (mittlere Pixel-Differenz
   aufeinanderfolgender, verkleinerter Frames) als objektives Hilfssignal für
   „Bewegungsruhe".
3. Upload der 10 Frames (nicht des Videos!) → ~2,5 MB statt 200 MB. Optional
   das Originalvideo als Blob für den menschlichen Assessor-Review.
4. Server: **ein** Claude-Vision-Call (Sonnet 5) mit allen Frames + Metadaten +
   erzwungenem JSON-Schema (Tool-Forced Output):

```json
{
  "composition": {"score": 8, "note": "Führende Linien gut genutzt, ..."},
  "horizon":     {"score": 5, "note": "Kippt in Frames 3–6 ca. 3° nach links"},
  "exposure":    {"score": 7, "note": "Himmel leicht ausgebrannt in Frame 8"},
  "motion":      {"score": 6, "note": "Ruckler beim Schwenk erkennbar (Jitter-Metrik: 0.42)"},
  "reSuitability": {"score": 7, "note": "Objektfreistellung gut, Einfahrt fehlt"},
  "overall": 66,
  "suggestedLevel": "intermediate",
  "topStrengths": ["…", "…"],
  "improvements": ["…", "…", "…"]
}
```

5. Ergebnis wird als Feedback-Karte im Chat gerendert, in `pilot_assessments`
   gespeichert, fließt in `levelScore` ein — und ist die automatisierte
   Vorstufe des Assessor-Calls.

**Ehrliche Grenze** (auch gegenüber der Jury kommunizieren): 10 Frames erlauben
eine fundierte Bewertung von Komposition, Horizont, Belichtung und grober
Bewegungsruhe — keine Frame-genaue Gimbal-Analyse. Dafür gibt es den
menschlichen Assessor-Call als Eskalationsstufe. Genau diese Staffelung
(KI-Screening → Mensch bei Grenzfällen) ist die richtige Governance-Story.

**Datenschutz**: Clips können Personen/Grundstücke zeigen → Einwilligungstext
vor Upload, Roh-Frames nach Assessment löschbar (Retention 90 Tage,
Cron-Cleanup), Scores bleiben.

---

## 6. Widget & Personas

- `public/pilot-widget.js` (~2 KB Loader): erzeugt Bubble-Button + iframe auf
  `/(widget)/pilot`, `postMessage` für Resize/Open/Close.
- Einbindung: `<script src="https://immohero.org/pilot-widget.js"
  data-persona="academy" data-lang="de" defer></script>` — auf aeroone.eu mit
  `data-persona="academy"`, auf immohero.org mit `"recruiter"`.
- CSP `frame-ancestors: aeroone.eu immohero.org` auf der Widget-Route;
  Widget-Seite läuft ohne TopNav/Footer (eigene Layout-Gruppe).
- **Persona-Configs** (`lib/pilot/personas.ts`): Ton, Begrüßung, Ziel-Gewichtung
  (Academy pusht Lernpfad, Recruiter pusht Beispielauftrag), CTA-Texte. Gleiches
  Backend, gleiche Tools, gleiche DB.
- Optional für Markentrennung: `pilot.aeroone.eu` als zusätzliche Domain am
  selben Vercel-Projekt.
- i18n: die bestehende `lib/i18n.ts`-Infrastruktur (DE/EN) wird mitbenutzt;
  der Bot selbst antwortet in der Sprache des Users (Claude nativ).

---

## 7. Memory, Convert & Follow-up

- Anonymer Session-Cookie (uuid) ab Nachricht 1; E-Mail-Gate nach 5 Nachrichten
  verknüpft Session → Profil (Consent + Zeitstempel gespeichert).
- Wiederkehrer: Cookie → Profil → `memory`-Zusammenfassung in den System-Prompt
  („Du hast vor 4 Tagen den Beispielauftrag bekommen — wie lief er?").
- **Convert**: `register_pilot` legt/verknüpft `customers`-Datensatz (CRM),
  feuert `pilot_events`, aktiviert Follow-up-Flags.
- **Follow-up-Sequenz** (täglicher Cron, Muster von `rebooking-mail` kopiert):
  D+1 „Dein Lernpfad wartet" · D+3 Call-Erinnerung, falls gebucht aber nicht
  wahrgenommen · D+7 „Wie lief der Beispielauftrag?" · D+14 Reaktivierung.
  Templates als React-Email, Versand über bestehende `sendEmail()`-Pipeline
  (Reply-To hello@immohero.org bzw. Academy-Adresse).

---

## 8. Pilot Passport & Studio-Integration

**Passport-Level (deterministisch, `lib/pilot/passport.ts`):**

| Level | Bedingung | Freischaltung (real, kein Badge-Kitsch) |
|---|---|---|
| 1 | Profil vollständig | Personalisierter Lernpfad |
| 2 | A1/A3 nachgewiesen + Assessment ≥ 50 | Verdienst-Rechner „deine Region", Equipment-Upgrade-Pfad |
| 3 | Video-Assessment ≥ 70 **oder** Assessor-Call bestanden | **Sichtbar im ImmoHero-Piloten-Pool** (Studio) |
| 4 | Beispielauftrag abgegeben + Review ≥ Schwelle | **Vermittelbar für echte Aufträge** (Verknüpfung mit `orderAssignments`) |

**Studio (`/studio/piloten`):**
- Pool-Liste: Profile mit Level, Region, Equipment, Assessment-Scores, letzte
  Aktivität (Pattern: bestehende `/studio/kunden`-Seite)
- Assessment-Detail: Frames + Scores + Feedback nebeneinander (menschlicher
  Review-Layer, Kalibrierung des Modells)
- Assessor-Calls erscheinen automatisch in `/studio/beratung` (kind-Filter)
- **Funnel-Dashboard** (`/studio/piloten/dashboard`): Zahlen aus `pilot_events`
  — Gespräche gestartet, Profile komplett, Leads, Calls gebucht, Briefs
  abgegeben, Piloten aktiviert, Conversion je Stufe, Zeitreihe. **Das ist der
  Metriken-Screen für die Award-Bewerbung.** Von Tag 1 an mitbauen, nicht
  nachrüsten.

---

## 9. Sicherheit, DSGVO, Governance (Jury-relevant)

- **EU-Datenhaltung**: Vercel fra1 + Neon eu-central-1 (beides heute schon so).
  Anthropic-API: Verarbeitung via DPA, kein Training auf API-Daten (Commercial
  Terms) — ehrlich so benennen, nicht „100 % EU" behaupten.
- **Rechts-Disclaimer** überall, Zitierpflicht technisch erzwungen (§4).
- **Human-in-the-loop**: Buchungen/Registrierungen nur nach Confirm-Klick;
  Regulatorik-Updates nur nach menschlichem Diff-Review; Video-Score ist
  Vorstufe, nicht Endurteil.
- **Rate-Limits + Kosten-Deckel** (§3) — öffentlicher LLM-Endpoint ohne die
  beiden ist ein Betriebsrisiko.
- **Löschkonzept**: Frames 90 Tage, Chat-Verlauf 12 Monate, Profil auf
  Anfrage (E-Mail-Link „Daten löschen" im Gate-Flow).

---

## 10. Phasenplan

**Phase 0 — Fundament (1–2 Tage)**
Migration 0007 (alle Tabellen + pgvector-Extension + HNSW-Index) ·
Widget-Shell + Loader-Script · Persona-Configs · `pilot_events`-Tracking ·
Rate-Limit-Grundgerüst · Chat-Route mit Streaming (noch ohne Tools).
→ *Ergebnis: Bot sagt Hallo, auf beiden Domains einbettbar.*

**Phase 1 — MVP (~2–3 Wochen Kalenderzeit)**
Assess-Gespräch mit `update_pilot_profile` + deterministischem Scoring ·
Regulatorik-Ingestion DE+EU + `search_regulations` mit Zitierpflicht ·
Eval-Set (30 Fragen) · Verdienst-Rechner · Routing per Link (noch ohne
In-Chat-Booking) · E-Mail-Gate/Lead-Capture · `/studio/piloten` Basis-Liste +
Dashboard v1.
→ *Ergebnis: vorzeigbares, messendes System. Ab hier Metriken sammeln!*

**Phase 2 — Aktionen im Chat (~1–2 Wochen)**
In-Chat-Slot-Buchung (consultations-Reuse, Confirm-Gate) · Beispielauftrag-
Generator (shots.ts-Reuse) + Ergebnis-Upload · Follow-up-Sequenzen (Cron) ·
Equipment-Berater · Session-Memory für Wiederkehrer.

**Phase 3 — Award-Features (~2–3 Wochen)**
Video-Assessment (Client-Frames + Vision-Scoring + Feedback-Karte) ·
Pilot Passport + Pool-Sichtbarkeit im Studio · Länder AT/FR ·
Aktualitäts-Crawler + Diff-Review-UI · Dashboard-Polish + Demo-Modus
(DEMO_MODE-Pattern aus ImmoHero wiederverwenden → Offline-Pitch vor Jury,
heute schon erprobt).

Aufwand gesamt: grob 100–150 Entwicklungsstunden; mit Claude-Code-Sessions
realistisch in den genannten Kalenderfenstern neben der Schule machbar, weil
die Hälfte der Bausteine kopiert statt erfunden wird.

---

## 11. Laufende Kosten (Größenordnung)

| Posten | Annahme | ~Kosten |
|---|---|---|
| Chat (Sonnet 5 + Caching) | Ø 25k In / 5k Out pro Gespräch | ~0,10–0,20 € |
| Video-Assessment | 10 Frames + Feedback | ~0,05 € |
| Embeddings (Voyage) | Korpus ~1,5 M Tokens einmalig | Free-Tier |
| Neon | bestehender Plan | 0 € zusätzlich |
| Vercel | Hobby reicht (Crons ≤ 1×/Tag beachten!); Pro (20 $) falls häufigere Crons nötig | 0–20 € |
| **1.000 Gespräche + 200 Assessments/Monat** | | **~150–250 €/Monat** |

Budget-Deckel technisch erzwungen (§3), also kein Kostenrisiko nach oben offen.

---

## 12. Offene Entscheidungen (vor Phase 0 klären)

1. **Repo/Hosting**: ImmoHero-Modul (Empfehlung, s. §0) — ja/nein?
2. **HubSpot**: wirklich nötig? Empfehlung: eigenes CRM + Resend; HubSpot-Export
   erst, wenn ihr tatsächlich in HubSpot arbeitet (heute nicht der Fall).
3. **Cal.com**: streichen zugunsten der eigenen Beratungs-Engine — ok?
4. **aeroone.eu**: Wo gehostet, wer hat Zugriff? (Fürs Widget-Snippet nötig;
   bis dahin läuft alles auf immohero.org.)
5. **Embeddings-Provider**: Voyage AI (Empfehlung) → API-Key anlegen.
6. **Award**: Welcher genau, welche Deadline? Bestimmt, ob Video-Assessment aus
   Phase 3 vorgezogen wird (es ist das Differenzierungs-Feature).
7. **Assessor-Kapazität**: Wer führt die Calls? (Cal-Verfügbarkeit =
   `team_availability` existiert schon im Schema.)

---

## 13. Woche-1-Checkliste (sobald „Go")

- [ ] Entscheidungen 1–3 bestätigen (15 Min Gespräch)
- [ ] Voyage-API-Key anlegen, `VOYAGE_API_KEY` in Vercel
- [ ] Migration 0007 schreiben + auf Neon anwenden (Muster: `scripts/apply-migration-*.mjs`)
- [ ] `pnpm add ai @ai-sdk/anthropic voyage-ai pdf-parse`
- [ ] Chat-Route + Widget-Shell (Phase 0)
- [ ] Ingestion-Spike: EASA-PDF → 50 Chunks → pgvector → eine korrekt zitierte Antwort
      (*der einzige echte Risiko-Spike; wenn das steht, ist der Rest Fleißarbeit*)
- [ ] Eval-Datei `evals/regulations.jsonl` mit ersten 10 goldenen Fragen

---

## 14. Die Award-Erzählung (unverändert stark — jetzt mit Beweis)

> „Ein agentisches System, das Hobby-Piloten europaweit rechtssicher zum ersten
> bezahlten Auftrag führt — mit automatisiertem Video-Skill-Assessment und
> selbstaktualisierender Rechtsdatenbank — gebaut von einem Schülerunternehmen,
> das damit das Angebot seines eigenen Marktplatzes skaliert."

Der Loop ist nach diesem Plan nicht Marketing, sondern Datenbank-Realität:
Pilotenprofil und Marktplatz-Auftrag liegen in derselben Postgres-Instanz, der
Beispielauftrag kommt aus derselben Shot-Bibliothek wie echte Aufträge, und der
Weg von Level 4 zu `orderAssignments` ist ein Foreign Key, kein Pitch-Slide.
