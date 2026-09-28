import Link from "next/link";
import type { Metadata } from "next";
import { completeSignIn } from "@/app/employers/actions";

export const metadata: Metadata = {
  title: "Finish signing in",
  robots: { index: false, follow: false },
};

const TOKEN_RE = /^[A-Za-z0-9_-]{32,128}$/;

// The emailed link opens this page. The token is only spent when the button is
// pressed (a POST), so mail scanners that open links cannot use it up.
export default async function VerifySignInPage({ searchParams }: { searchParams: Promise<{ token?: string; next?: string }> }) {
  const { token, next } = await searchParams;
  const valid = typeof token === "string" && TOKEN_RE.test(token);

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-14 sm:pt-20">
      <div className="hero-glow top-[-30%] !opacity-[0.14]" aria-hidden="true" />
      <div className="relative mx-auto max-w-[440px] text-center">
        <h1 className="headline">{valid ? "Almost there." : "Link not recognised."}</h1>
        <div className="card-white mt-10 p-7 sm:p-8">
          {valid ? (
            <form action={completeSignIn}>
              <input type="hidden" name="token" value={token} />
              {next && <input type="hidden" name="next" value={next} />}
              <p className="text-[17px] leading-snug text-mute">Press the button to finish signing in to your employer account on this device.</p>
              <button type="submit" className="btn btn-primary btn-lg mt-6 w-full">
                Sign in
              </button>
            </form>
          ) : (
            <>
              <p className="text-[17px] leading-snug text-mute">This sign-in link is incomplete. Copy the whole link from the email, or ask for a new one.</p>
              <Link href="/employers/sign-in" className="btn btn-primary mt-6 w-full">
                Get a new link
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
