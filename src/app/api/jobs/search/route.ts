import { NextRequest, NextResponse } from "next/server";
import { searchAllJobs } from "@/lib/apis/jobs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || undefined;
  const salaryMin = searchParams.get("salaryMin")
    ? parseInt(searchParams.get("salaryMin")!)
    : undefined;
  const salaryMax = searchParams.get("salaryMax")
    ? parseInt(searchParams.get("salaryMax")!)
    : undefined;
  const page = parseInt(searchParams.get("page") || "1");

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch more results from each source so client-side filtering has a bigger pool
    const results = await searchAllJobs({
      query,
      location,
      salaryMin,
      salaryMax,
      page,
      limit: 50,
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("[jobs/search] Error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs. Please try again." },
      { status: 500 }
    );
  }
}
