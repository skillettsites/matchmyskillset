import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CandidateSignInForm } from "@/components/candidate/SignInForm";
import { getCandidate, safeNext } from "@/lib/candidate/session";
import { NOT_SWITCHED_ON } from "@/lib/candidate/plans";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your MatchMySkillset account with a link sent to your email.",
  robots: { index: false, follow: true },
};

const MESSAGES: Record<string, { text: string; tone: "error" | "info" }> = {
  expired: { text: "That sign-in link has expired or has already been used. Enter your email for a new one.", tone: "error" },
  busy: { text: "Too many sign-in attempts from here. Please wait a few minutes and try again.", tone: "error" },
  off: { text: NOT_SWITCHED_ON, tone: "error" },
  failed: { text: "Something went wrong signing you in. Please ask for a new link.", tone: "error" },
  signedout: { text: "You have signed out.", tone: "info" },
  deleted: { text: "Your account has been deleted, with your job packs and saved CV.", tone: "info" },
};

export default async function CandidateSignInPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const account = await getCandidate();
  if (account) redirect(next ?? "/account");
  const key = sp.error ?? (sp.signedout ? "signedout" : sp.deleted ? "deleted" : "");
  const msg = MESSAGES[key];

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-14 sm:pt-20">
      <div className="hero-glow top-[-30%] !opacity-[0.14]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[440px]">
        <div className="text-center">
          <p className="eyebrow text-blue">Your account</p>
          <h1 className="headline mt-2">Sign in.</h1>
          <p className="mt-4 text-[17px] leading-snug text-mute">Keep your job packs in one place, use your free tailored CV, and manage Plus.</p>
        </div>
        <div className="card-white mt-10 p-7 sm:p-8">
          {msg && (
            <p
              role={msg.tone === "error" ? "alert" : "status"}
              className={`mb-5 rounded-2xl px-4 py-3 text-[14px] leading-snug ${msg.tone === "error" ? "bg-[#fdecea] text-[#8c1d18]" : "bg-cloud text-ink"}`}
            >
              {msg.text}
            </p>
          )}
          <CandidateSignInForm next={next} />
        </div>
        <p className="mt-6 text-center text-[14px] text-mute">
          You do not need an account to see jobs that match your CV.{" "}
          <Link href="/discover" className="text-link hover:underline">
            Match your CV
          </Link>
          . By signing in you agree to the{" "}
          <Link href="/terms#cv-tools" className="text-link hover:underline">
            terms
          </Link>
          . Hiring?{" "}
          <Link href="/employers/sign-in" className="text-link hover:underline">
            Employer sign in
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
