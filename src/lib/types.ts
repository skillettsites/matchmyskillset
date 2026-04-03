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
  id: string; // prefixed: "adzuna_123", "reed_456", "featured_789"
  source: "adzuna" | "reed" | "jooble" | "featured";
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
  isFeatured: boolean;
  isHidden?: boolean; // Fred's unadvertised roles
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

// ==========================================
// Employers (Fred's network)
// ==========================================

export interface Employer {
  id: string;
  name: string;
  contactEmail?: string;
  contactName?: string;
  industry?: string;
  size?: string;
  notes?: string;
  createdAt: string;
}

export interface FeaturedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
  employerId?: string;
  isHidden: boolean;
  featuredUntil?: string;
  createdBy: string;
  createdAt: string;
  applicationUrl?: string;
  applicationEmail?: string;
}

// ==========================================
// User Profile
// ==========================================

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  cvText?: string;
  preferences: {
    location?: string;
    salaryMin?: number;
    remotePreference?: "remote" | "hybrid" | "office" | "any";
  };
  role: "user" | "admin";
  createdAt: string;
}

// ==========================================
// Tracking
// ==========================================

export interface JobClick {
  source: string;
  jobExternalId: string;
  jobTitle: string;
  jobUrl: string;
  userId?: string;
  referrerPage?: string;
}
