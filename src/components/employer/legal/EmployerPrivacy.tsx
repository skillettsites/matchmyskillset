import { JOBS_EMAIL } from "@/lib/employer/plans";
import { SITE_NAME } from "@/lib/site";

// Employer section of /privacy. Kept in its own file so the candidate-side
// edits to the rest of the page never collide with it.

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";
const h3 = "mt-6 mb-2 text-[18px] font-semibold text-ink";
const link = "text-link underline";

export function EmployerPrivacy() {
  return (
    <section aria-labelledby="employers" className="space-y-4">
      <h2 id="employers" className={h2}>
        If you use {SITE_NAME} as an employer
      </h2>
      <p>This part covers people who open an employer account to post jobs or contact candidates, and people who send us an employer enquiry.</p>

      <h3 className={h3}>What we collect and why</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Your account:</strong> your work email address, your name, your company name and website, the text of your company page if you have one, and
          when you accepted the employer terms. We use them to run your account and show your jobs. Lawful basis: our contract with you.
        </li>
        <li>
          <strong>Signing in:</strong> sign-in links and sessions are stored only as a scrambled (hashed) version. Sign-in links expire after 20 minutes and are
          cleared out regularly; sessions last 30 days. Lawful basis: our contract with you, and our legitimate interest in keeping accounts secure.
        </li>
        <li>
          <strong>Jobs you post:</strong> everything in the job form, the skills we find in it, and how many times it is viewed. Job seekers see your jobs, and your
          company page if you have one.
        </li>
        <li>
          <strong>Payments:</strong> Stripe handles card details; we never see them. We keep your Stripe customer and subscription references, your plan and when
          it renews. Lawful basis: our contract with you, and our legal duty to keep tax records.
        </li>
        <li>
          <strong>Enquiries:</strong> what you send through the enquiry form, so we can reply. Lawful basis: our legitimate interest in answering you.
        </li>
        <li>
          <strong>Contact requests:</strong> the message you write and which candidate and job it is about. We email it to the candidate with your company name.
        </li>
        <li>
          <strong>Recruiter shortlists (Growth and Enterprise):</strong> whether you asked for one for each job, and the shortlist itself: who was picked, in what
          order, the recruiter&apos;s notes and summary, and when it was asked for and sent. Our recruiters see the job and its applicants to put it together, but not
          your plan or billing details. Lawful basis: our contract with you.
        </li>
      </ul>

      <h3 className={h3}>Cookies for employers</h3>
      <p>
        When you sign in we set one strictly necessary cookie, <code>mms_employer</code>, which keeps you signed in for 30 days. It is marked httpOnly, so page
        scripts cannot read it, and signing out removes it. It is not used for tracking.
      </p>

      <h3 className={h3}>Who else handles it</h3>
      <p>
        The same service providers listed above: Supabase (database), Vercel (hosting), Resend (sign-in links and notification emails) and Stripe (payments). We
        also send ourselves short alerts on Telegram when an employer signs up, submits a job, sends an enquiry, changes plan, or has a recruiter shortlist
        requested or sent; these name the company, not the person.
      </p>

      <h3 className={h3}>Candidate details you receive</h3>
      <p>
        When a candidate applies to your job or accepts your contact request, we share their name, contact details and CV with you at their request. From then on
        you are a separate controller for that copy and must handle it under UK data protection law and our{" "}
        <a href="/terms#employers" className={link}>
          employer terms
        </a>
        . We keep applications for 12 months from when they were made, then delete them.
      </p>

      <h3 className={h3}>How long we keep employer data</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>Your account, jobs and company page: while your account is open. Ask us to close it and we delete them within 30 days.</li>
        <li>Billing records: six years from the payment, for tax.</li>
        <li>Enquiries: as long as we need to deal with them.</li>
      </ul>
      <p>
        Your rights are the same as everyone&apos;s (see &ldquo;Your rights&rdquo; above). For anything about an employer account, email{" "}
        <a href={`mailto:${JOBS_EMAIL}`} className={link}>
          {JOBS_EMAIL}
        </a>
        .
      </p>
    </section>
  );
}
