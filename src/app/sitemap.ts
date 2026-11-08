import type { MetadataRoute } from "next";
import { cases } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://clarityops.io", lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...cases.map((c) => ({ url: `https://clarityops.io/work/${c.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
  ];
}
