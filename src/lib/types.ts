// ==========================================
// Skills & Career Matching
// ==========================================

export interface ExtractedSkill {
  skillId: string;
  name: string;
  confidence: number; // 0-1
  category: "hard" | "soft" | "knowledge" | "life";
  source?: string; // which part of input it came from
}

export interface CareerMatch {
  occupationId: string; // O*NET SOC code
  title: string;
  description: string;
  matchPercentage: number; // 0-100
  matchedSkills: { skillId: string; name: string; importance: number }[];
  gapSkills: { skillId: string; name: string; importance: number }[];
  salaryRange: { min: number; max: number; median: number };
  demandLevel: "high" | "medium" | "low";
  transitionDifficulty: "easy" | "moderate" | "hard";
}

export interface SkillAssessment {
  id: string;
  inputHash: string;
  extractedSkills: ExtractedSkill[];
  careerMatches: CareerMatch[];
  createdAt: string;
  userId?: string;
}

// ==========================================
// Jobs
// ==========================================

export interface UnifiedJob {
  id: string; // prefixed: "adzuna_123", "reed_456", "himalayas_789"
  source: "adzuna" | "reed" | "jooble" | "himalayas";
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryDisplay?: string;
  description: string;
  descriptionSnippet: string;
  url: string;
  postedDate?: string;
  skills?: string[];
  matchScore?: number; // 0-100, added after matching
  isFeatured: boolean; // always false: featured and hidden jobs were removed in the 2026-09 revamp
  contractType?: string;
  workType?: "remote" | "hybrid" | "office";
}

export interface JobSearchParams {
  query: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  skills?: string[];
  limit?: number;
}

export interface JobSearchResult {
  jobs: UnifiedJob[];
  totalResults: number;
  page: number;
  hasMore: boolean;
}
