import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { isGoogleWalletConfigured, getGoogleWalletSaveUrl } from "@/lib/google-wallet";

export const runtime = "nodejs";

function fallbackHtml(message: string) {
  return new NextResponse(
    `<!doctype html><html lang="de"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>ImmoHero Wallet</title>
     <style>body{font-family:system-ui,sans-serif;background:#f4f2ec;color:#1e2319;
     display:grid;place-items:center;min-height:100vh;margin:0;padding:24px;text-align:center}
     .c{max-width:420px}a{color:#3f5a3a}</style></head>
     <body><div class="c"><h1 style="font-size:20px">Google Wallet</h1>
     <p>${message}</p>
     <p><a href="/messe">Zurück</a></p></div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;

  const [lead] = await db
    .select()
    .from(leads)
    .where(eq(leads.voucherCode, code.toUpperCase()))
    .limit(1);

  if (!lead) {
    return fallbackHtml("Gutschein nicht gefunden. Bitte den Code prüfen.");
  }

  if (!isGoogleWalletConfigured()) {
    return fallbackHtml(
      "Die Wallet-Funktion wird gerade freigeschaltet. Dein Code <strong>" +
        lead.voucherCode +
        "</strong> ist trotzdem gültig — du findest ihn auch in deiner E-Mail.",
    );
  }

  try {
    const url = await getGoogleWalletSaveUrl({
      voucherCode: lead.voucherCode,
      name: lead.name,
      expiresAt: lead.expiresAt,
    });
    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error("[wallet/google] save url failed", err);
    return fallbackHtml(
      "Wallet-Pass konnte gerade nicht erstellt werden. Dein Code <strong>" +
        lead.voucherCode +
        "</strong> bleibt gültig.",
    );
  }
}
