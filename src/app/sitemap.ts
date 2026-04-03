import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://matchmyskillset.com";
  const now = new Date().toISOString();

  const professions = [
    "teachers", "nurses", "construction", "retail",
    "military", "parents", "admin", "finance",
  ];

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/discover`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteUrl}/careers-for`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...professions.map((p) => ({
      url: `${siteUrl}/careers-for/${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
