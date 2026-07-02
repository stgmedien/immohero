/**
 * Pilot Journey Engine — Regulatorik-Crawler (Schritt 1/3)
 *
 * Lädt die in sources.json definierten amtlichen Quellen (EUR-Lex, EASA, LBA,
 * gesetze-im-internet, dipul), speichert Rohdaten unter data/regulations/raw/
 * und extrahierten Klartext unter data/regulations/text/, plus manifest.json.
 *
 *   node scripts/regulations/crawl.mjs            # alles
 *   node scripts/regulations/crawl.mjs lba-drohnen # nur eine Quelle
 *
 * Höflichkeit: sequenziell, ~700ms Delay, ehrlicher User-Agent, 1 Retry.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";

const ROOT = path.resolve("data/regulations");
const RAW = path.join(ROOT, "raw");
const TEXT = path.join(ROOT, "text");
for (const d of [ROOT, RAW, TEXT]) mkdirSync(d, { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 AeroOnePilotEngine/0.1 (+https://aeroone.eu; korpus-aufbau, kontakt: hello@immohero.org)";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchRaw(url, { timeoutMs = 45000, asBuffer = false, referer, headers = {} } = {}) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), timeoutMs);
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          Accept: "*/*",
          "Accept-Language": "de,en;q=0.8",
          ...(referer ? { Referer: referer } : {}),
          ...headers,
        },
        redirect: "follow",
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const contentType = res.headers.get("content-type") ?? "";
      const buf = Buffer.from(await res.arrayBuffer());
      if (asBuffer || contentType.includes("pdf")) return { buf, contentType, finalUrl: res.url };
      // Charset beachten (gesetze-im-internet liefert ISO-8859-1)
      const m = contentType.match(/charset=([\w-]+)/i);
      const charset = (m?.[1] ?? "utf-8").toLowerCase();
      const text = new TextDecoder(charset === "iso-8859-1" || charset === "latin1" ? "iso-8859-1" : "utf-8").decode(buf);
      return { text, buf, contentType, finalUrl: res.url };
    } catch (err) {
      if (attempt === 2) throw err;
      await sleep(1500);
    }
  }
}

/** HTML → Klartext. Probiert inhaltsnahe Selektoren, nimmt den längsten Treffer. */
function htmlToText(html) {
  const $ = cheerio.load(html);
  $("script, style, nav, header, footer, noscript, iframe, svg, form, aside, .cookie, #cookie, .breadcrumb").remove();
  const candidates = ["#docContent", ".eli-container", "main", "article", "#content", "#wrapper", "body"];
  let best = "";
  for (const sel of candidates) {
    const el = $(sel).first();
    if (!el.length) continue;
    const txt = el.text();
    if (txt.length > best.length) best = txt;
  }
  return best
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

function pageTitle(html, fallback) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return (m?.[1] ?? fallback).replace(/\s+/g, " ").trim();
}

function saveDoc(manifest, entry, text, rawBuf, rawExt) {
  if (!text || text.length < 500) {
    manifest.push({ ...entry, status: "too_short", chars: text?.length ?? 0 });
    console.log(`  ⚠ ${entry.id}: Text zu kurz (${text?.length ?? 0} Zeichen) — übersprungen`);
    return;
  }
  writeFileSync(path.join(TEXT, `${entry.id}.txt`), text);
  if (rawBuf) writeFileSync(path.join(RAW, `${entry.id}.${rawExt}`), rawBuf);
  manifest.push({
    ...entry,
    status: "ok",
    chars: text.length,
    sha256: sha256(text),
    fetchedAt: new Date().toISOString(),
  });
  console.log(`  ✓ ${entry.id}: ${text.length.toLocaleString("de-DE")} Zeichen`);
}

async function crawlHtml(src, manifest) {
  for (const url of src.urls) {
    try {
      const { text: html, buf, finalUrl } = await fetchRaw(url, { headers: src.headers ?? {} });
      const text = htmlToText(html);
      if (text.length < 3000) throw new Error(`nur ${text.length} Zeichen extrahiert`);
      saveDoc(manifest, { id: src.id, country: src.country, authority: src.authority, language: src.language, docType: src.docType, title: src.title, url: finalUrl }, text, buf, "html");
      return;
    } catch (err) {
      console.log(`  … ${src.id}: ${url} fehlgeschlagen (${err.message}), nächster Kandidat`);
    }
  }
  manifest.push({ id: src.id, title: src.title, url: src.urls[0], status: "failed" });
  console.log(`  ✗ ${src.id}: alle URL-Kandidaten fehlgeschlagen`);
}

/** Direkte PDF-URL(s), z. B. Hersteller-Handbücher vom DJI-CDN. */
async function crawlPdfDirect(src, manifest) {
  for (const url of src.urls) {
    try {
      const { buf } = await fetchRaw(url, { timeoutMs: 180000, asBuffer: true, referer: src.referer });
      if (buf.subarray(0, 5).toString() !== "%PDF-") throw new Error("keine PDF-Signatur");
      console.log(`  … ${src.id}: PDF ${(buf.length / 1e6).toFixed(1)} MB, extrahiere Text …`);
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      const parsed = await parser.getText();
      await parser.destroy();
      saveDoc(manifest, { id: src.id, country: src.country, authority: src.authority, language: src.language, docType: src.docType, title: src.title, url, pages: parsed.total }, parsed.text, buf, "pdf");
      return;
    } catch (err) {
      console.log(`  … ${src.id}: ${url} fehlgeschlagen (${err.message}), nächster Kandidat`);
    }
  }
  manifest.push({ id: src.id, title: src.title, url: src.urls[0], status: "failed" });
  console.log(`  ✗ ${src.id}: alle PDF-Kandidaten fehlgeschlagen`);
}

async function crawlEasaPdf(src, manifest) {
  try {
    const { text: html } = await fetchRaw(src.libraryUrl);
    // EASA-Download-Links: /en/downloads/<id>/en — ersten nehmen
    const matches = [...html.matchAll(/href="(\/(?:en\/)?downloads\/\d+\/en)"/g)].map((m) => m[1]);
    if (matches.length === 0) throw new Error("kein Download-Link auf der Library-Seite gefunden");
    const pdfUrl = new URL(matches[0], "https://www.easa.europa.eu").href;
    console.log(`  … ${src.id}: lade PDF ${pdfUrl}`);
    // EASA-Downloads verlangen einen Referer von der Library-Seite
    const { buf } = await fetchRaw(pdfUrl, { timeoutMs: 180000, asBuffer: true, referer: src.libraryUrl });
    console.log(`  … ${src.id}: PDF ${(buf.length / 1e6).toFixed(1)} MB, extrahiere Text (dauert etwas) …`);
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    const parsed = await parser.getText();
    await parser.destroy();
    saveDoc(manifest, { id: src.id, country: src.country, authority: src.authority, language: src.language, docType: src.docType, title: src.title, url: pdfUrl, pages: parsed.total }, parsed.text, buf, "pdf");
  } catch (err) {
    manifest.push({ id: src.id, title: src.title, url: src.libraryUrl, status: "failed", error: err.message });
    console.log(`  ✗ ${src.id}: ${err.message}`);
  }
}

async function crawlHub(src, manifest) {
  let hubHtml;
  try {
    const { text } = await fetchRaw(src.hubUrl);
    hubHtml = text;
  } catch (err) {
    manifest.push({ id: src.id, title: src.title, url: src.hubUrl, status: "failed", error: err.message });
    console.log(`  ✗ ${src.id}: Hub nicht erreichbar (${err.message})`);
    return;
  }
  // Hub-Seite selbst als Dokument
  saveDoc(manifest, { id: src.id, country: src.country, authority: src.authority, language: src.language, docType: src.docType, title: pageTitle(hubHtml, src.title), url: src.hubUrl, partOf: src.id }, htmlToText(hubHtml), Buffer.from(hubHtml), "html");

  const $ = cheerio.load(hubHtml);
  const origin = new URL(src.hubUrl).origin;
  // <base href> beachten (z. B. LBA/Government Site Builder nutzt base=/)
  const baseHref = $("base[href]").attr("href");
  const resolveBase = baseHref ? new URL(baseHref, src.hubUrl).href : src.hubUrl;
  const seen = new Set([src.hubUrl.replace(/\/$/, "")]);
  const links = [];
  $("a[href]").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;
    let abs;
    try { abs = new URL(href, resolveBase).href; } catch { return; }
    abs = abs.split("#")[0].replace(/\/$/, "");
    if (!abs.startsWith(origin)) return;
    if (!abs.includes(src.linkPattern)) return;
    if (/\.(pdf|jpg|png|zip|xml)$/i.test(abs)) return;
    if (seen.has(abs)) return;
    seen.add(abs);
    links.push(abs);
  });
  const take = links.slice(0, src.maxPages);
  console.log(`  … ${src.id}: ${links.length} interne Links gefunden, crawle ${take.length}`);
  let i = 0;
  for (const url of take) {
    i++;
    await sleep(700);
    try {
      const { text: html } = await fetchRaw(url);
      const text = htmlToText(html);
      saveDoc(manifest, { id: `${src.id}-${String(i).padStart(2, "0")}`, country: src.country, authority: src.authority, language: src.language, docType: src.docType, title: pageTitle(html, url), url, partOf: src.id }, text, null, "html");
    } catch (err) {
      manifest.push({ id: `${src.id}-${String(i).padStart(2, "0")}`, url, status: "failed", error: err.message, partOf: src.id });
      console.log(`  ✗ ${src.id}-${i}: ${err.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
const only = process.argv[2];
const { sources } = JSON.parse(readFileSync("scripts/regulations/sources.json", "utf8"));
const manifest = [];

for (const src of sources) {
  if (only && src.id !== only) continue;
  console.log(`\n▶ ${src.id} — ${src.title}`);
  if (src.type === "html") await crawlHtml(src, manifest);
  else if (src.type === "pdf") await crawlPdfDirect(src, manifest);
  else if (src.type === "easa-pdf") await crawlEasaPdf(src, manifest);
  else if (src.type === "hub") await crawlHub(src, manifest);
  await sleep(700);
}

// Manifest mergen (bei Teil-Läufen bestehende Einträge erhalten)
const manifestPath = path.join(ROOT, "manifest.json");
let existing = [];
if (existsSync(manifestPath) && only) {
  existing = JSON.parse(readFileSync(manifestPath, "utf8")).filter(
    (e) => !manifest.some((n) => n.id === e.id),
  );
}
const merged = [...existing, ...manifest];
writeFileSync(manifestPath, JSON.stringify(merged, null, 2));

const ok = merged.filter((e) => e.status === "ok");
const failed = merged.filter((e) => e.status !== "ok");
console.log(`\n=== Ergebnis ===`);
console.log(`OK: ${ok.length} Dokumente, ${ok.reduce((s, e) => s + e.chars, 0).toLocaleString("de-DE")} Zeichen gesamt`);
if (failed.length) console.log(`Fehlgeschlagen/übersprungen: ${failed.map((f) => f.id).join(", ")}`);
