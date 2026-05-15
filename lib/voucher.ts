// Voucher code generator — readable alphabet (no I/O/0/1 to avoid confusion)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateVoucherCode(length = 5): string {
  let body = "";
  for (let i = 0; i < length; i++) {
    body += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `IMMO-${body}`;
}

export const VOUCHER_AMOUNT_CENTS = 1500;
export const VOUCHER_MIN_ORDER_CENTS = 19900;
export const VOUCHER_VALID_DAYS = 90;

export function voucherExpiry(from = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + VOUCHER_VALID_DAYS);
  return d;
}
