import { NextRequest } from "next/server";

/**
 * Verifiziert, dass ein Request entweder von Vercel Cron stammt (Bearer-Header
 * mit CRON_SECRET) oder den Query-Token `?token=<CRON_SECRET>` mitliefert.
 * Wenn CRON_SECRET nicht gesetzt ist, lehnen wir alle externen Aufrufe ab.
 */
export function isAuthorizedCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  if (auth && auth === `Bearer ${secret}`) return true;
  const token = request.nextUrl.searchParams.get("token");
  if (token && token === secret) return true;
  return false;
}
