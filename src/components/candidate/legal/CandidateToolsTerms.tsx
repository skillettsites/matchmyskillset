import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { PACK_PRICE_LABEL, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL } from "@/lib/candidate/plans";

// CV tools section of /terms (job packs, the free tailored CV, Plus and job
// seeker accounts). Kept in its own file so edits to the rest of the page never
// collide with it.

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";
const h3 = "mt-6 mb-2 text-[18px] font-semibold text-ink";
const link = "text-link underline";

function Mail() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
      {CONTACT_EMAIL}
    </a>
  );
}

export function CandidateToolsTerms() {
  return (
    <section aria-labelledby="cv-tools" className="space-y-4">
      <h2 id="cv-tools" className={h2}>
        CV tools: job packs, Plus and accounts
      </h2>
      <p>
        This part applies when you use the optional CV tools on {SITE_NAME}. The rest of these terms also apply. Finding and matching jobs stays free and does not
        need an account.
      </p>

      <h3 className={h3}>What a job pack is</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          A job pack is written for one job advert from the CV you give us: your CV rewritten for that job, a cover letter, and interview prep (likely questions with
          answer points drawn from your CV, and questions to ask). The free tailored CV is the first of these only.
        </li>
        <li>
          It is written by an AI model and checked by our software, which takes out employers, dates, qualifications, skills and figures that are not in your CV. It
          can still contain mistakes. It is a draft: read and correct it before you use it. You are responsible for what you send to an employer, and you must only
          claim experience and qualifications you really have.
        </li>
        <li>
          We do not promise that a pack will get you an interview or a job. A match score is a rough guide worked out by software.
        </li>
        <li>Only give us your own CV, or one you have permission to use.</li>
      </ul>

      <h3 className={h3}>The free tailored CV</h3>
      <p>
        Each person can have one free tailored CV, to try the tool. It needs a free account, so we can tell who has had one. Please do not open extra accounts to get
        more: we may withdraw free CVs where that happens.
      </p>

      <h3 className={h3}>Paying for one job pack ({PACK_PRICE_LABEL})</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>The price is shown before you pay. Payment is taken by Stripe. You do not need an account; we email the link to your pack to the address you give.</li>
        <li>
          A job pack is digital content supplied straight away. Before paying you agree to immediate supply and acknowledge that you then lose the 14-day right to
          cancel that would otherwise apply.
        </li>
        <li>
          If we cannot write your pack, or it is faulty or not as described, we will fix it, write it again or refund you. This does not affect your legal rights.
          Email <Mail />.
        </li>
      </ul>

      <h3 className={h3}>Plus ({PLUS_PRICE_LABEL} a month)</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Plus is a monthly subscription taken by Stripe. It renews each month on the date you started until you cancel. We will tell you before we change the price,
          and a new price only applies from your next renewal after that.
        </li>
        <li>
          It includes up to {PLUS_PACKS_PER_MONTH} job packs in each billing month (fair use; the count starts again when your plan renews and unused packs do not carry
          over) and Check any job. Check any job has a daily limit to stop misuse. The application tracker is free for everyone and is not part of Plus.
        </li>
        <li>
          You can cancel at any time from Manage billing in your account. Plus then keeps working until the end of the month you have paid for and does not renew. We
          do not refund part months.
        </li>
        <li>
          You can cancel within 14 days of starting Plus for a full refund, as long as you have not had a job pack yet: email <Mail />. Once you have had a pack, you
          agreed at checkout that the 14-day right to cancel ends, but you can still stop Plus renewing at any time.
        </li>
        <li>If a renewal payment fails, Stripe tries again for a short time. If it still fails, Plus ends.</li>
      </ul>

      <h3 className={h3}>Accounts</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You sign in with a link sent to your email. Keep access to your email account safe: anyone who can open your email can sign in. Keep your job pack links
          private too, because anyone with a link can open that pack.
        </li>
        <li>
          You can delete your account at any time from your account page. We may suspend an account that breaks these terms, for example by trying to get around the
          limits above; if we end a paid plan for a reason that is not your fault, we will refund the unused part.
        </li>
      </ul>
      <p>
        How we handle your data is in the{" "}
        <Link href="/privacy#cv-tools" className={link}>
          privacy policy
        </Link>
        .
      </p>
    </section>
  );
}
