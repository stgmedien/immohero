// Lesefreundliche Auftragskürzel (kein I, O, 0, 1, um Verwechslungen zu vermeiden)
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateShortCode(length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

export function generateShareToken(length = 24): string {
  return generateShortCode(length).toLowerCase();
}
