import "server-only";
import { cookies, headers } from "next/headers";
import type { Locale } from "./i18n";

/** Alias damit Bestandscode `getLocale` weiter funktioniert. */
export { getLocaleServer as getLocale };

export async function getLocaleServer(): Promise<Locale> {
  const c = await cookies();
  const ck = c.get("locale")?.value;
  if (ck === "en" || ck === "de") return ck;
  const h = await headers();
  const al = h.get("accept-language") ?? "";
  if (al.toLowerCase().startsWith("en")) return "en";
  return "de";
}
