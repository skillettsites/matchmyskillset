import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/employer/SignInForm";
import { getEmployer, isSetUp } from "@/lib/employer/session";

export const metadata: Metadata = {
  title: "Employer sign in",
  description: "Sign in to your MatchMySkillset employer account with a link sent to your email.",
  robots: { index: false, follow: true },
};

const ERRORS: Record<string, string> = {
  expired: "That sign-in link has expired or has already been used. Enter your email for a new one.",
  busy: "Too many sign-in attempts from here. Please wait a few minutes and try again.",
};

function safeNext(value: string | undefined): string | null {
  return value && /^\/employers\/dashboard(\/[A-Za-z0-9/_?=&.-]*)?$/.test(value) ? value : null;
}

export default async function EmployerSignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const { error, next } = await searchParams;
  const account = await getEmployer();
  if (account) redirect(isSetUp(account) ? (safeNext(next) ?? "/employers/dashboard") : "/employers/dashboard/setup");

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-14 sm:pt-20">
      <div className="hero-glow top-[-30%] !opacity-[0.14]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[440px]">
        <div className="text-center">
          <p className="eyebrow text-blue">For employers</p>
          <h1 className="headline mt-2">Sign in.</h1>
          <p className="mt-4 text-[17px] leading-snug text-mute">Post jobs, see applicants and search candidates who asked to be found.</p>
        </div>
        <div className="card-white mt-10 p-7 sm:p-8">
          {error && ERRORS[error] && (
            <p role="alert" className="mb-5 rounded-2xl bg-[#fdecea] px-4 py-3 text-[14px] leading-snug text-[#8c1d18]">
              {ERRORS[error]}
            </p>
          )}
          <SignInForm next={safeNext(next)} />
        </div>
        <p className="mt-6 text-center text-[14px] text-mute">
          By signing in you agree to the{" "}
          <Link href="/terms#employers" className="text-link hover:underline">
            employer terms
          </Link>
          . Looking for a job instead?{" "}
          <Link href="/discover" className="text-link hover:underline">
            Match your CV
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
