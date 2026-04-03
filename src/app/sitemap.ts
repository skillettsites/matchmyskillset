import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://matchmyskillset.com";
  // Use a fixed date so GSC doesn't re-crawl everything on every deploy
  // Update this when content actually changes
  const contentDate = "2026-04-03T00:00:00.000Z";
  const now = contentDate;

  const professions = [
    "teachers", "nurses", "construction", "retail",
    "military", "parents", "admin", "finance",
  ];

  const careerChangeGuides = [
    "how-to-change-careers",
    "transferable-skills-guide",
    "career-change-cv",
    "career-change-at-40",
    "skills-based-hiring",
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
    { url: `${siteUrl}/career-change`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...careerChangeGuides.map((g) => ({
      url: `${siteUrl}/career-change/${g}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${siteUrl}/what-jobs`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...[
      // Full PAGES (skills)
      "teaching-skills", "project-management-skills", "customer-service-skills", "nursing-skills", "sales-skills",
      "communication-skills", "leadership-skills", "problem-solving-skills", "excel-skills", "empathy-skills",
      // SIMPLE_PAGES (skills)
      "admin-skills", "management-skills", "writing-skills", "data-analysis-skills", "creative-skills",
      "construction-skills", "military-skills", "accounting-skills", "caring-skills", "it-support-skills", "retail-skills",
      // How to Become pages
      "how-to-become-data-analyst", "how-to-become-ux-designer", "how-to-become-product-manager",
      "how-to-become-project-manager", "how-to-become-software-developer", "how-to-become-digital-marketer",
      "how-to-become-hr-manager", "how-to-become-business-analyst", "how-to-become-scrum-master",
      "how-to-become-cybersecurity-analyst", "how-to-become-content-writer", "how-to-become-operations-manager",
      "how-to-become-financial-analyst", "how-to-become-graphic-designer", "how-to-become-recruitment-consultant",
      // Jobs That Pay pages
      "jobs-that-pay-30k", "jobs-that-pay-40k", "jobs-that-pay-50k",
      "jobs-that-pay-60k", "jobs-that-pay-70k", "jobs-that-pay-100k",
      // Jobs For pages
      "jobs-for-extroverts", "jobs-for-creative-people", "jobs-for-analytical-thinkers",
      "jobs-for-people-who-like-helping", "jobs-for-over-50s", "jobs-for-career-changers",
      "jobs-for-graduates", "jobs-for-parents", "jobs-for-ex-military", "jobs-for-people-with-anxiety",
    ].map((q) => ({
      url: `${siteUrl}/what-jobs/${q}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // SEO content pages
    { url: `${siteUrl}/quiz`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/jobs-for-introverts`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/high-paying-jobs-no-degree`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/work-from-home-jobs`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/career-change-at-30`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/highest-paying-careers-uk`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${siteUrl}/career-change-no-experience`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    // Standalone SEO pages batch 2
    ...[
      "best-jobs-for-women-returning-to-work",
      "jobs-you-can-do-from-home-with-no-experience",
      "career-change-at-50",
      "best-side-hustles-uk",
      "jobs-for-people-who-hate-their-job",
      "highest-paying-remote-jobs-uk",
      "career-change-from-teaching",
      "career-change-from-nursing",
      "career-change-from-retail",
      "best-jobs-for-work-life-balance",
      "jobs-that-dont-require-a-degree",
      "how-to-write-a-cv-for-career-change",
      "what-job-is-right-for-me",
      "best-careers-for-the-future-uk",
      "jobs-for-people-with-adhd",
      "apprenticeships-for-adults-uk",
      "freelance-careers-uk",
      "jobs-for-empaths",
      "career-change-with-no-money",
      "skills-employers-want-2026",
    ].map((slug) => ({
      url: `${siteUrl}/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${siteUrl}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
