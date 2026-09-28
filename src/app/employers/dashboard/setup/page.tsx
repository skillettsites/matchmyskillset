import type { Metadata } from "next";
import { SetupForm } from "@/components/employer/SetupForm";
import { requireEmployer } from "@/lib/employer/session";

export const metadata: Metadata = { title: "Set up your employer account", robots: { index: false, follow: false } };

function safeNext(value: string | undefined): string | null {
  return value && /^\/employers\/dashboard(\/[A-Za-z0-9/_?=&.-]*)?$/.test(value) ? value : null;
}

export default async function SetupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const account = await requireEmployer({ allowIncomplete: true });
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-[560px] pt-6">
      <div className="text-center">
        <p className="eyebrow text-blue">Welcome</p>
        <h1 className="headline mt-2">Tell us about your company.</h1>
        <p className="mt-4 text-[17px] leading-snug text-mute">Two minutes, once. Then you can post your first job.</p>
      </div>
      <div className="mt-10">
        <SetupForm
          email={account.email}
          next={safeNext(next)}
          company={account.company_name ?? ""}
          contact={account.contact_name ?? ""}
          website={account.website ?? ""}
        />
      </div>
    </div>
  );
}
