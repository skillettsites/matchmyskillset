import { NextResponse, type NextRequest } from "next/server";

// Employer dashboard only. Signed-out visitors are sent to sign in with the
// page they asked for as `next`, so the "See their CV" link in an applicant
// email lands on the applicants page after signing in, not the dashboard home.
// The session itself is still checked in requireEmployer(); this only looks at
// whether the cookie is there, and passes the path on for when it is stale.

/** Same name as SESSION_COOKIE in src/lib/employer/session.ts (not imported: that module reads the database). */
const SESSION_COOKIE = "mms_employer";
/** Read by requireEmployer() in src/lib/employer/session.ts. */
const DASHBOARD_PATH_HEADER = "x-mms-path";

export function proxy(request: NextRequest) {
  const path = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/employers/sign-in", request.url);
    if (path !== "/employers/dashboard") url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  const headers = new Headers(request.headers);
  headers.set(DASHBOARD_PATH_HEADER, path);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/employers/dashboard", "/employers/dashboard/:path*"],
};
