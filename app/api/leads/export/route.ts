import { auth } from "@/lib/auth";
import { canAccessCustomers } from "@/lib/access";
import { db } from "@/lib/db/client";
import { desc } from "drizzle-orm";
import { leads } from "@/lib/db/schema";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !canAccessCustomers(session.user.role)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = await db.select().from(leads).orderBy(desc(leads.createdAt));

  const header = [
    "Name",
    "E-Mail",
    "Telefon",
    "Gutschein-Code",
    "Quelle",
    "Erfasst am",
    "Gültig bis",
    "Eingelöst am",
    "Einwilligung am",
  ];

  const lines = [
    header.join(";"),
    ...rows.map((l) =>
      [
        l.name,
        l.email,
        l.phone,
        l.voucherCode,
        l.source,
        l.createdAt.toISOString(),
        l.expiresAt.toISOString(),
        l.redeemedAt ? l.redeemedAt.toISOString() : "",
        l.consentAt.toISOString(),
      ]
        .map(csvCell)
        .join(";"),
    ),
  ];

  const csv = "﻿" + lines.join("\r\n"); // BOM for Excel UTF-8

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="immohero-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
