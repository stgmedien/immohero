import { GoogleAuth } from "google-auth-library";
import jwt from "jsonwebtoken";

/**
 * Google Wallet integration for the €15 Messe voucher.
 *
 * Free to use. Requires (set as env vars in Vercel):
 *   GOOGLE_WALLET_ISSUER_ID        – numeric issuer id from Google Pay & Wallet Console
 *   GOOGLE_WALLET_SA_EMAIL         – service-account email
 *   GOOGLE_WALLET_SA_PRIVATE_KEY   – service-account private key (PEM, \n escaped)
 *
 * If any are missing, isGoogleWalletConfigured() is false and callers
 * fall back gracefully (no broken buttons / links).
 */

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID;
const SA_EMAIL = process.env.GOOGLE_WALLET_SA_EMAIL;
const SA_PRIVATE_KEY = process.env.GOOGLE_WALLET_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");

const CLASS_SUFFIX = "immohero_messe_voucher_v1";
const BASE_URL = "https://walletobjects.googleapis.com/walletobjects/v1";

export function isGoogleWalletConfigured(): boolean {
  return Boolean(ISSUER_ID && SA_EMAIL && SA_PRIVATE_KEY);
}

function classId(): string {
  return `${ISSUER_ID}.${CLASS_SUFFIX}`;
}

function objectId(voucherCode: string): string {
  // object id must be alphanumeric/._- ; voucher codes are IMMO-XXXX
  return `${ISSUER_ID}.${voucherCode.replace(/[^a-zA-Z0-9._-]/g, "")}`;
}

function authClient() {
  return new GoogleAuth({
    credentials: {
      client_email: SA_EMAIL,
      private_key: SA_PRIVATE_KEY,
    },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
}

const genericClassPayload = () => ({
  id: classId(),
  classTemplateInfo: {
    cardTemplateOverride: {
      cardRowTemplateInfos: [
        {
          twoItems: {
            startItem: {
              firstValue: {
                fields: [{ fieldPath: "object.textModulesData['amount']" }],
              },
            },
            endItem: {
              firstValue: {
                fields: [{ fieldPath: "object.textModulesData['valid_until']" }],
              },
            },
          },
        },
      ],
    },
  },
});

function genericObjectPayload(input: {
  voucherCode: string;
  name: string;
  expiresAt: Date;
}) {
  const validUntil = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(input.expiresAt);

  return {
    id: objectId(input.voucherCode),
    classId: classId(),
    state: "ACTIVE",
    heroImage: undefined,
    hexBackgroundColor: "#3f5a3a",
    logo: {
      sourceUri: {
        uri: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/icon.svg`,
      },
      contentDescription: { defaultValue: { language: "de", value: "ImmoHero" } },
    },
    cardTitle: {
      defaultValue: { language: "de", value: "ImmoHero Gutschein" },
    },
    subheader: {
      defaultValue: { language: "de", value: "15 € Messe-Aktion" },
    },
    header: {
      defaultValue: { language: "de", value: input.voucherCode },
    },
    textModulesData: [
      { id: "amount", header: "Rabatt", body: "15 € ab 199 € Bestellwert" },
      { id: "valid_until", header: "Gültig bis", body: validUntil },
      { id: "holder", header: "Für", body: input.name },
    ],
    barcode: {
      type: "QR_CODE",
      value: input.voucherCode,
      alternateText: input.voucherCode,
    },
    linksModuleData: {
      uris: [
        {
          uri: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"}/buchen`,
          description: "Jetzt einlösen",
          id: "redeem",
        },
      ],
    },
  };
}

let classEnsured = false;

async function ensureClass(): Promise<void> {
  if (classEnsured) return;
  const auth = authClient();
  const client = await auth.getClient();
  const id = classId();

  try {
    await client.request({ url: `${BASE_URL}/genericClass/${id}`, method: "GET" });
    classEnsured = true;
    return;
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status && status !== 404) throw err;
  }

  await client.request({
    url: `${BASE_URL}/genericClass`,
    method: "POST",
    data: genericClassPayload(),
  });
  classEnsured = true;
}

/**
 * Returns the "Add to Google Wallet" save URL for a voucher.
 * Ensures the class + object exist, then signs a save JWT.
 */
export async function getGoogleWalletSaveUrl(input: {
  voucherCode: string;
  name: string;
  expiresAt: Date;
}): Promise<string> {
  if (!isGoogleWalletConfigured()) {
    throw new Error("Google Wallet not configured");
  }

  await ensureClass();

  const auth = authClient();
  const client = await auth.getClient();
  const obj = genericObjectPayload(input);

  // Upsert the object (idempotent: PUT creates or replaces)
  try {
    await client.request({
      url: `${BASE_URL}/genericObject/${obj.id}`,
      method: "GET",
    });
  } catch {
    await client.request({
      url: `${BASE_URL}/genericObject`,
      method: "POST",
      data: obj,
    });
  }

  const claims = {
    iss: SA_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    origins: [process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org"],
    payload: {
      genericObjects: [{ id: obj.id, classId: classId() }],
    },
  };

  const token = jwt.sign(claims, SA_PRIVATE_KEY as string, { algorithm: "RS256" });
  return `https://pay.google.com/gp/v/save/${token}`;
}
