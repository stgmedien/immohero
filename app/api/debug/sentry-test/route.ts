import { NextRequest, NextResponse } from "next/server";

// TEMPORÄR: kontrollierter Sentry-Test. Nur mit korrektem Token, wirft sonst nichts.
// Wird nach der Verifikation wieder entfernt.
const TOKEN = "imh-sentry-check-7Q2";

export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (token !== TOKEN) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  throw new Error(
    "Sentry-Test (kontrolliert) — ImmoHero: wenn dieser Fehler in Sentry erscheint, läuft das Monitoring.",
  );
}
