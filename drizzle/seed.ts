import { db } from "@/lib/db/client";
import { services, bundles, shotDefinitions, serviceAreas, users } from "@/lib/db/schema";
import { SERVICES, BUNDLES } from "@/lib/services";
import { SHOTS } from "@/lib/shots";
import { buildServiceAreas } from "./service-areas";

async function seed() {
  console.log("→ Seed: services");
  for (const svc of SERVICES) {
    await db
      .insert(services)
      .values({
        slug: svc.slug,
        name: svc.name,
        shortDescription: svc.shortDescription,
        longDescription: svc.longDescription,
        priceCents: svc.priceCents,
        durationMinutes: svc.durationMinutes ?? null,
        durationLabel: svc.durationLabel,
        iconKey: svc.iconKey,
        category: svc.category,
        stylePackage: svc.stylePackage,
        propertyTypes: svc.propertyTypes,
        popular: svc.popular ?? false,
        active: true,
      })
      .onConflictDoNothing();
  }

  console.log("→ Seed: bundles");
  for (const bundle of BUNDLES) {
    await db
      .insert(bundles)
      .values({
        slug: bundle.slug,
        name: bundle.name,
        tagline: bundle.tagline,
        serviceSlugs: bundle.serviceSlugs,
        discountPercent: bundle.discountPercent,
        recommended: bundle.recommended ?? false,
        active: true,
      })
      .onConflictDoNothing();
  }

  console.log(`→ Seed: ${SHOTS.length} shot definitions`);
  for (const shot of SHOTS) {
    await db
      .insert(shotDefinitions)
      .values({
        id: shot.id,
        name: shot.name,
        category: shot.category,
        perspective: shot.perspective,
        altitudeMeters: Math.round(shot.altitudeMeters),
        movement: shot.movement,
        durationSec: shot.durationSec,
        priority: shot.priority,
        description: shot.description,
        propertyTemplate: shot.propertyTemplate,
        stylePackage: shot.stylePackage,
      })
      .onConflictDoNothing();
  }

  console.log("→ Seed: service areas");
  const areas = buildServiceAreas();
  console.log(`   inserting ${areas.length} PLZs…`);
  // Batch insert for performance
  const chunkSize = 500;
  for (let i = 0; i < areas.length; i += chunkSize) {
    const chunk = areas.slice(i, i + chunkSize);
    await db
      .insert(serviceAreas)
      .values(
        chunk.map((a) => ({
          plz: a.plz,
          city: a.city,
          region: a.region,
          active: true,
        })),
      )
      .onConflictDoNothing();
  }

  console.log("→ Seed: admin user");
  await db
    .insert(users)
    .values({
      email: "jonathan@stg-medien.com",
      name: "Jonathan Kreutzheide",
      role: "admin",
      phone: "+4915906828161",
    })
    .onConflictDoNothing();

  console.log("✓ Seed complete.");
}

seed().catch((err) => {
  console.error("✗ Seed failed:", err);
  process.exit(1);
});
