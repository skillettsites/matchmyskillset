// Centralised affiliate links with UTM tracking
// All affiliate URLs go through here for consistent tracking

interface AffiliateProgram {
  name: string;
  baseUrl: string;
  commission: string;
  category: "course" | "cv-builder" | "tool" | "wellbeing" | "coworking" | "banking" | "books";
  description: string;
}

const AFFILIATES: Record<string, AffiliateProgram> = {
  coursera: {
    name: "Coursera",
    baseUrl: "https://www.coursera.org",
    commission: "15-45%",
    category: "course",
    description: "Online courses from top universities",
  },
  datacamp: {
    name: "DataCamp",
    baseUrl: "https://www.datacamp.com",
    commission: "30-100%",
    category: "course",
    description: "Data science and analytics courses",
  },
  linkedin_learning: {
    name: "LinkedIn Learning",
    baseUrl: "https://www.linkedin.com/learning",
    commission: "£8/trial or 35%",
    category: "course",
    description: "Professional development courses",
  },
  futurelearn: {
    name: "FutureLearn",
    baseUrl: "https://www.futurelearn.com",
    commission: "10-15%",
    category: "course",
    description: "UK university-backed online courses",
  },
  codecademy: {
    name: "Codecademy",
    baseUrl: "https://www.codecademy.com",
    commission: "5-7%",
    category: "course",
    description: "Learn to code interactively",
  },
  resume_io: {
    name: "Resume.io",
    baseUrl: "https://resume.io",
    commission: "Up to 30%",
    category: "cv-builder",
    description: "Professional CV builder",
  },
  grammarly: {
    name: "Grammarly",
    baseUrl: "https://www.grammarly.com",
    commission: "£16/conversion",
    category: "tool",
    description: "Writing assistant for cover letters and emails",
  },
  canva: {
    name: "Canva Pro",
    baseUrl: "https://www.canva.com",
    commission: "15-80%",
    category: "tool",
    description: "Design tool for portfolios and presentations",
  },
  betterhelp: {
    name: "BetterHelp",
    baseUrl: "https://www.betterhelp.com",
    commission: "£8-120/referral",
    category: "wellbeing",
    description: "Online therapy and counselling",
  },
  headspace: {
    name: "Headspace",
    baseUrl: "https://www.headspace.com",
    commission: "8%",
    category: "wellbeing",
    description: "Meditation and mindfulness",
  },
};

export function buildAffiliateUrl(
  affiliateId: string,
  path: string = "",
  context: { page?: string; skill?: string; career?: string } = {}
): string {
  const affiliate = AFFILIATES[affiliateId];
  if (!affiliate) return "#";

  const url = new URL(path || "/", affiliate.baseUrl);

  // Add UTM tracking
  url.searchParams.set("utm_source", "matchmyskillset");
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", context.page || "general");
  if (context.skill) {
    url.searchParams.set("utm_content", context.skill);
  }
  if (context.career) {
    url.searchParams.set("utm_term", context.career);
  }

  return url.toString();
}

export function getAffiliate(id: string): AffiliateProgram | undefined {
  return AFFILIATES[id];
}

// Get course recommendations based on a skill gap
export function getCourseRecommendations(
  skillName: string
): { name: string; url: string; provider: string; description: string }[] {
  const recommendations: { name: string; url: string; provider: string; description: string }[] = [];
  const skill = skillName.toLowerCase();

  // Technical skills -> specific course platforms
  if (
    skill.includes("sql") ||
    skill.includes("python") ||
    skill.includes("data")
  ) {
    recommendations.push({
      name: `Learn ${skillName}`,
      url: buildAffiliateUrl("datacamp", "/courses", {
        page: "results",
        skill: skillName,
      }),
      provider: "DataCamp",
      description: "Hands-on interactive courses",
    });
  }

  if (
    skill.includes("code") ||
    skill.includes("javascript") ||
    skill.includes("web") ||
    skill.includes("software")
  ) {
    recommendations.push({
      name: `${skillName} courses`,
      url: buildAffiliateUrl("codecademy", "/catalog", {
        page: "results",
        skill: skillName,
      }),
      provider: "Codecademy",
      description: "Learn by building real projects",
    });
  }

  // General skills -> Coursera and LinkedIn Learning
  recommendations.push({
    name: `${skillName} on Coursera`,
    url: buildAffiliateUrl(
      "coursera",
      `/search?query=${encodeURIComponent(skillName)}`,
      { page: "results", skill: skillName }
    ),
    provider: "Coursera",
    description: "University-backed certificates",
  });

  recommendations.push({
    name: `${skillName} on LinkedIn Learning`,
    url: buildAffiliateUrl(
      "linkedin_learning",
      `/search?keywords=${encodeURIComponent(skillName)}`,
      { page: "results", skill: skillName }
    ),
    provider: "LinkedIn Learning",
    description: "Professional development",
  });

  // UK-specific
  recommendations.push({
    name: `${skillName} on FutureLearn`,
    url: buildAffiliateUrl(
      "futurelearn",
      `/search?q=${encodeURIComponent(skillName)}`,
      { page: "results", skill: skillName }
    ),
    provider: "FutureLearn",
    description: "UK university courses",
  });

  return recommendations.slice(0, 3); // Max 3 recommendations per skill
}

// Get CV builder recommendation
export function getCvBuilderRecommendation(careerTitle?: string): {
  name: string;
  url: string;
  description: string;
} {
  return {
    name: "Build your CV with Resume.io",
    url: buildAffiliateUrl("resume_io", "/", {
      page: "results",
      career: careerTitle,
    }),
    description:
      "Professional CV templates optimised for ATS systems. Rebuild your CV for your new career path.",
  };
}

// Get wellbeing recommendation
export function getWellbeingRecommendation(): {
  name: string;
  url: string;
  description: string;
} {
  return {
    name: "Support during your career change",
    url: buildAffiliateUrl("betterhelp", "/", { page: "results" }),
    description:
      "Career transitions can be stressful. Professional support can help you navigate the change with confidence.",
  };
}

// Get tool recommendations
export function getToolRecommendations(): {
  name: string;
  url: string;
  description: string;
}[] {
  return [
    {
      name: "Polish your cover letters with Grammarly",
      url: buildAffiliateUrl("grammarly", "/", { page: "results" }),
      description: "AI writing assistant to make your applications stand out.",
    },
    {
      name: "Create a portfolio with Canva",
      url: buildAffiliateUrl("canva", "/", { page: "results" }),
      description:
        "Design a professional portfolio to showcase your work and skills.",
    },
  ];
}
