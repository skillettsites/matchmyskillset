import Link from "next/link";
import type { Metadata } from "next";
import { requireEmployer } from "@/lib/employer/session";
import { hasCompanyPage, initials } from "@/lib/employer/company";
import { AccountDetailsForm, CompanyPageForm } from "@/components/employer/CompanyForms";
import { Notice, PageHead } from "@/components/employer/ui";

export const metadata: Metadata = { title: "Company profile", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const account = await requireEmployer();
  const pageAllowed = hasCompanyPage(account);
  const publicUrl = account.slug && account.company_description ? `/companies/${account.slug}` : null;

  return (
    <div>
      <PageHead title="Company" />
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <AccountDetailsForm
          company={account.company_name ?? ""}
          contact={account.contact_name ?? ""}
          website={account.website ?? ""}
          email={account.email}
        />
        <div className="space-y-6">
          {pageAllowed ? (
            <CompanyPageForm description={account.company_description ?? ""} publicUrl={publicUrl} />
          ) : (
            <Notice tone="amber">
              <strong>Company pages come with Growth and Enterprise.</strong> A public page with your description, website and every live job.{" "}
              <Link href="/employers/dashboard/billing" className="font-semibold underline">
                Compare plans
              </Link>
            </Notice>
          )}
          <div className="rounded-[22px] bg-white p-6">
            <p className="text-[13px] font-semibold text-mute">Your logo on MatchMySkillset</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-[16px] bg-gradient-to-br from-[#1d1d1f] to-[#424245] text-[20px] font-bold text-white">
                {initials(account.company_name ?? "")}
              </div>
              <div>
                <p className="text-[17px] font-semibold text-ink">{account.company_name}</p>
                <p className="text-[14px] text-mute">We show your initials rather than an uploaded logo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
