/**
 * Twilio-Integration für WhatsApp und SMS — vollständig env-gated.
 * Wenn die Env-Variablen nicht gesetzt sind, sind diese Funktionen No-Ops
 * und werfen nicht, damit der Rest der App weiterläuft.
 */

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      (process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_SMS_FROM),
  );
}

function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+") && cleaned.length >= 8) return cleaned;
  if (cleaned.startsWith("00")) return "+" + cleaned.slice(2);
  if (cleaned.startsWith("0")) return "+49" + cleaned.slice(1); // DE default
  return null;
}

async function sendTwilioMessage(opts: {
  from: string;
  to: string;
  body: string;
}): Promise<{ ok: boolean; sid?: string; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { ok: false, error: "Twilio not configured" };

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const body = new URLSearchParams({
    From: opts.from,
    To: opts.to,
    Body: opts.body,
  });
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[twilio] failed", res.status, text);
      return { ok: false, error: `${res.status} ${text}` };
    }
    const data = (await res.json()) as { sid?: string };
    return { ok: true, sid: data.sid };
  } catch (err) {
    console.error("[twilio] error", err);
    return { ok: false, error: String(err) };
  }
}

export async function sendWhatsApp(phone: string, body: string) {
  if (!isTwilioConfigured()) {
    console.warn("[twilio] would send WhatsApp to", phone, body.slice(0, 60));
    return { ok: false, skipped: true } as const;
  }
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) return { ok: false, error: "TWILIO_WHATSAPP_FROM missing" } as const;
  const to = normalizePhone(phone);
  if (!to) return { ok: false, error: "invalid phone" } as const;
  const result = await sendTwilioMessage({
    from: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    to: `whatsapp:${to}`,
    body,
  });
  return result;
}

export async function sendSms(phone: string, body: string) {
  if (!isTwilioConfigured()) {
    console.warn("[twilio] would send SMS to", phone, body.slice(0, 60));
    return { ok: false, skipped: true } as const;
  }
  const from = process.env.TWILIO_SMS_FROM;
  if (!from) return { ok: false, error: "TWILIO_SMS_FROM missing" } as const;
  const to = normalizePhone(phone);
  if (!to) return { ok: false, error: "invalid phone" } as const;
  return sendTwilioMessage({ from, to, body });
}
