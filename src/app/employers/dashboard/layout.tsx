import type { Metadata } from "next";
import { DashboardNav } from "@/components/employer/DashboardNav";
import { Badge } from "@/components/employer/ui";
import { getEmployer, isSetUp } from "@/lib/employer/session";
import { effectivePlan, PLAN_NAMES } from "@/lib/employer/plans";
import { signOut } from "./actions";

export const metadata: Metadata = {
  // Pages below name themselves ("Applicants", "Plan and billing"), followed by where they are.
  title: { default: "Employer dashboard | MatchMySkillset", template: "%s | Employer dashboard | MatchMySkillset" },
  robots: { index: false, follow: false },
};

// Every page below checks the session itself (requireEmployer). This layout
// only draws the frame, and hides the menu until setup is finished.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const account = await getEmployer();
  const ready = account && isSetUp(account);
  const plan = account ? effectivePlan(account) : null;

  return (
    <div className="min-h-[70vh] bg-cloud px-5 pb-24 pt-8">
      <div className="mx-auto max-w-[1180px]">
        {ready && (
          <div className="mb-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <p className="truncate text-[17px] font-semibold text-ink">{account.company_name}</p>
                <Badge tone={plan ? "green" : "grey"}>{plan ? `${PLAN_NAMES[plan]} plan` : "No plan yet"}</Badge>
              </div>
              <form action={signOut}>
                <button type="submit" className="btn btn-secondary btn-sm">
                  Sign out
                </button>
              </form>
            </div>
            <DashboardNav />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
