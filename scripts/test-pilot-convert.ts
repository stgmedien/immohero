/**
 * LLM-freier End-to-End-Test des Conversion-Kerns (lib/pilot/convert.ts):
 * Lauf 1 erzeugt Profil + User + CRM + Enrollment + Events,
 * Lauf 2 (gleiche E-Mail) muss idempotent sein (keine Duplikate).
 * Danach vollständiges Cleanup.
 *
 *   pnpm tsx --env-file=.env.local scripts/test-pilot-convert.ts
 */
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  academyEnrollments,
  customers,
  pilotEvents,
  pilotProfiles,
  users,
} from "@/lib/db/schema";
import { convertPilot } from "@/lib/pilot/convert";

const TEST_EMAIL = "pilot-convert-test@example.com";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function cleanup() {
  const profs = await db.select({ id: pilotProfiles.id, customerRecordId: pilotProfiles.customerRecordId }).from(pilotProfiles).where(eq(pilotProfiles.email, TEST_EMAIL));
  for (const p of profs) {
    await db.delete(pilotEvents).where(eq(pilotEvents.profileId, p.id));
    await db.delete(pilotProfiles).where(eq(pilotProfiles.id, p.id));
    if (p.customerRecordId) await db.delete(customers).where(eq(customers.id, p.customerRecordId));
  }
  const us = await db.select({ id: users.id }).from(users).where(eq(users.email, TEST_EMAIL));
  if (us.length) {
    await db.delete(academyEnrollments).where(inArray(academyEnrollments.userId, us.map((u) => u.id)));
    await db.delete(users).where(eq(users.email, TEST_EMAIL));
  }
}

async function main() {
  await cleanup();

  // ---- Lauf 1: Neuanlage über den Onboarding-Weg
  const r1 = await convertPilot(
    {
      email: TEST_EMAIL,
      name: "Convert Test",
      plz: "33332",
      country: "DE",
      equipment: [{ model: "DJI Mavic 3 Pro", euClass: "C2" }],
      certificates: { a1a3: true, a2: true },
      flightHours: 60,
      portfolio: { hasRealEstateFootage: true },
      onboarding: { goal: "hobby-zum-beruf", availabilityHoursPerWeek: 10 },
    },
    { source: "onboarding", sendMagicLink: false }, // kein Mail-Versand im Test
  );
  console.log("Lauf 1:", {
    level: r1.level,
    score: r1.levelScore,
    passport: r1.passportLevel,
    userCreated: r1.userCreated,
    enrollmentCreated: r1.enrollmentCreated,
    course: r1.recommendedCourse?.slug ?? null,
  });
  assert(r1.level === "advanced", `advanced erwartet, war ${r1.level}`);
  assert(r1.userCreated, "User sollte neu angelegt werden");
  assert(r1.profile.userId, "profile.userId muss gesetzt sein");
  assert(r1.profile.customerRecordId, "CRM-Verknüpfung muss gesetzt sein");
  assert(r1.profile.source === "onboarding", "source muss onboarding sein");

  // ---- Lauf 2: identische E-Mail → idempotent
  const r2 = await convertPilot(
    { email: TEST_EMAIL, name: "Convert Test" },
    { source: "onboarding", sendMagicLink: false },
  );
  assert(!r2.userCreated, "Lauf 2 darf keinen neuen User anlegen");
  assert(!r2.enrollmentCreated, "Lauf 2 darf kein neues Enrollment anlegen");
  assert(r2.profile.id === r1.profile.id, "Profil muss dedupen");

  const profCount = await db.select({ id: pilotProfiles.id }).from(pilotProfiles).where(eq(pilotProfiles.email, TEST_EMAIL));
  const userCount = await db.select({ id: users.id }).from(users).where(eq(users.email, TEST_EMAIL));
  assert(profCount.length === 1, `genau 1 Profil erwartet, waren ${profCount.length}`);
  assert(userCount.length === 1, `genau 1 User erwartet, waren ${userCount.length}`);

  const enrolls = await db.select().from(academyEnrollments).where(eq(academyEnrollments.userId, userCount[0].id));
  console.log("Enrollments:", enrolls.length, enrolls.map((e) => e.source));
  assert(enrolls.length <= 1, "höchstens 1 Enrollment (bei vorhandenem published Kurs genau 1)");

  const events = await db.select({ type: pilotEvents.type }).from(pilotEvents).where(eq(pilotEvents.profileId, r1.profile.id));
  console.log("Events:", events.map((e) => e.type).join(", "));
  assert(events.some((e) => e.type === "account_created"), "account_created-Event fehlt");
  assert(events.some((e) => e.type === "pilot_registered"), "pilot_registered-Event fehlt");

  await cleanup();
  console.log("Aufgeräumt. ✓");
  console.log("\n✅ Conversion-Kern: Neuanlage + Dedupe + Events funktionieren.");
}

main()
  .then(() => process.exit(0))
  .catch(async (e) => {
    console.error(e);
    try {
      await cleanup();
      console.error("(Cleanup nach Fehler ausgeführt)");
    } catch {}
    process.exit(1);
  });
