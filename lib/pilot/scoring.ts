/**
 * Deterministisches Level-Scoring — bewusst KEIN LLM-Urteil.
 * Reproduzierbar, erklärbar, fair (Jury-Frage "wie wird eingestuft?").
 */
import type { PilotProfile } from "@/lib/db/schema";

export interface Completeness {
  complete: boolean;
  missing: string[];
}

export function profileCompleteness(p: Partial<PilotProfile> | null): Completeness {
  const missing: string[] = [];
  if (!p?.equipment || p.equipment.length === 0) missing.push("equipment");
  if (!p?.certificates || typeof p.certificates.a1a3 !== "boolean") missing.push("certificates");
  if (p?.flightHours == null) missing.push("flight_hours");
  if (!p?.country) missing.push("country");
  return { complete: missing.length === 0, missing };
}

export function computeLevelScore(p: Partial<PilotProfile>): number {
  let score = 0;
  const certs = p.certificates ?? {};
  if (certs.a1a3) score += 15;
  if (certs.a2) score += 20;
  if (certs.sts) score += 10;

  const hours = p.flightHours ?? 0;
  if (hours >= 50) score += 25;
  else if (hours >= 20) score += 18;
  else if (hours >= 5) score += 10;
  else if (hours > 0) score += 4;

  const equipment = p.equipment ?? [];
  if (equipment.some((e) => /C1|C2/i.test(e.euClass ?? "") || /mavic 3|air 3|inspire/i.test(e.model))) score += 10;
  else if (equipment.length > 0) score += 5;

  if (p.portfolio?.hasRealEstateFootage) score += 15;
  if ((p.portfolio?.links?.length ?? 0) > 0) score += 5;

  return Math.min(100, score);
}

export function levelFromScore(score: number): "basic" | "intermediate" | "advanced" {
  if (score >= 60) return "advanced";
  if (score >= 30) return "intermediate";
  return "basic";
}

/** Pilot-Passport-Level 0–4 (reale Freischaltungen, siehe Plan §8). */
export function computePassportLevel(p: Partial<PilotProfile>, opts?: { assessmentOverall?: number | null; briefSubmitted?: boolean }): number {
  let lvl = 0;
  if (profileCompleteness(p).complete) lvl = 1;
  if (lvl >= 1 && p.certificates?.a1a3) lvl = 2;
  if (lvl >= 2 && (opts?.assessmentOverall ?? 0) >= 70) lvl = 3;
  if (lvl >= 3 && opts?.briefSubmitted) lvl = 4;
  return lvl;
}
