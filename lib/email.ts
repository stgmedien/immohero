import { Resend } from "resend";
import { db } from "@/lib/db/client";
import { emailLog } from "@/lib/db/schema";

const apiKey = process.env.RESEND_API_KEY;
const defaultFrom = process.env.RESEND_FROM ?? "ImmoHero <hallo@immohero.org>";
const replyTo = process.env.RESEND_REPLY_TO ?? "hallo@immohero.org";

const client = apiKey ? new Resend(apiKey) : null;

/** Sender per template type — keeps the inbox readable for customers. */
export const SENDERS = {
  default: defaultFrom,
  magicLink: "ImmoHero <login@immohero.org>",
  bookingConfirmation: "ImmoHero <bestellung@immohero.org>",
  delivery: "ImmoHero <lieferung@immohero.org>",
  studio: "ImmoHero Studio <studio@immohero.org>",
  voucher: "ImmoHero <gutschein@immohero.org>",
} as const;

export type SenderKey = keyof typeof SENDERS;

interface SendArgs {
  to: string;
  subject: string;
  template: string;
  react: React.ReactElement;
  orderId?: string;
  from?: string | SenderKey;
}

function resolveFrom(input?: string | SenderKey): string {
  if (!input) return SENDERS.default;
  if (input in SENDERS) return SENDERS[input as SenderKey];
  return input;
}

export async function sendEmail({
  to,
  subject,
  template,
  react,
  orderId,
  from,
}: SendArgs) {
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — skipping email send:", subject, "→", to);
    return null;
  }

  const senderFrom = resolveFrom(from);

  try {
    const result = await client.emails.send({
      from: senderFrom,
      to,
      subject,
      react,
      replyTo,
    });

    if (result.error) {
      await db.insert(emailLog).values({
        toEmail: to,
        template,
        subject,
        orderId: orderId ?? null,
        error: result.error.message,
      });
      throw new Error(result.error.message);
    }

    await db.insert(emailLog).values({
      toEmail: to,
      template,
      subject,
      resendId: result.data?.id ?? null,
      orderId: orderId ?? null,
    });

    return result.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.insert(emailLog).values({
      toEmail: to,
      template,
      subject,
      orderId: orderId ?? null,
      error: message,
    });
    throw err;
  }
}

/** Used by Auth.js Resend provider — must not write to DB or it would break sign-in flow on first user. */
export async function sendMagicLinkEmail({ to, url }: { to: string; url: string }) {
  if (!client) {
    console.warn("[email] RESEND_API_KEY not set — would send magic link to", to, "→", url);
    return;
  }
  const { MagicLinkEmail } = await import("@/emails/magic-link");
  await client.emails.send({
    from: SENDERS.magicLink,
    to,
    replyTo,
    subject: "Dein Login-Link für ImmoHero",
    react: MagicLinkEmail({ url, email: to }),
  });
}
