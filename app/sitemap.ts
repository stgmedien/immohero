import type { MetadataRoute } from "next";
import { SERVICES } from "@/lib/services";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://immohero.org";
  const now = new Date();

  const staticPaths = [
    "/",
    "/pakete",
    "/services",
    "/ueber-uns",
    "/faq",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/agb",
    "/buchen",
  ];

  const servicePaths = SERVICES.map((s) => `/services/${s.slug}`);

  return [...staticPaths, ...servicePaths].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1.0 : 0.7,
  }));
}
