import { NextRequest, NextResponse } from "next/server";

// In-memory featured jobs store (will move to Supabase)
const featuredJobs: Array<{
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  requiredSkills: string[];
  applicationUrl?: string;
  applicationEmail?: string;
  isHidden: boolean;
  createdAt: string;
}> = [];

// GET: list all featured jobs
export async function GET() {
  const activeJobs = featuredJobs.filter((j) => !j.isHidden);
  return NextResponse.json({ jobs: activeJobs });
}

// POST: create a featured job (admin only - will add auth later)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const job = {
      id: `featured_${crypto.randomUUID()}`,
      title: body.title || "",
      company: body.company || "",
      location: body.location || "UK",
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      description: body.description || "",
      requiredSkills: body.requiredSkills || [],
      applicationUrl: body.applicationUrl,
      applicationEmail: body.applicationEmail,
      isHidden: body.isHidden || false,
      createdAt: new Date().toISOString(),
    };

    if (!job.title || !job.company) {
      return NextResponse.json(
        { error: "Title and company are required" },
        { status: 400 }
      );
    }

    featuredJobs.push(job);

    return NextResponse.json({ job }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
