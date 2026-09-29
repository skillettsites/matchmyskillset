import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_ENTITY_NAME, LEGAL_LAST_UPDATED, SITE_NAME } from "@/lib/site";
import { EmployerTerms } from "@/components/employer/legal/EmployerTerms";
import { CandidateToolsTerms } from "@/components/candidate/legal/CandidateToolsTerms";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms for using MatchMySkillset's free CV check, job search and paid Career Change Report.",
};

const h2 = "text-xl font-semibold text-gray-900 mt-10 mb-3";
const link = "text-indigo-700 underline";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="text-gray-700 leading-relaxed space-y-4">
        <h2 className={h2}>1. About these terms</h2>
        <p>
          These terms apply when you use {SITE_NAME} (matchmyskillset.com), which is run by{" "}
          {LEGAL_ENTITY_NAME}. By using the site you agree to them. Our{" "}
          <Link href="/privacy" className={link}>
            Privacy Policy
          </Link>{" "}
          explains how we handle personal data. Questions:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <h2 className={h2}>2. What the service does</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Free CV check:</strong> you paste or upload your CV, or type your current job
            title. We identify your skills and suggest careers they could transfer to, with the
            skills you already have and the ones you may need. No account is needed.
          </li>
          <li>
            <strong>Job matches and job search:</strong> live listings from third-party job boards
            (currently Reed, Adzuna, GOV.UK Teaching Vacancies, Himalayas and Remotive) and jobs that
            employers post on MatchMySkillset, with a match score worked out from your skills.
          </li>
          <li>
            <strong>Job alerts (free, optional):</strong> emails with new matching jobs, weekly or
            daily. You can stop them with one click.
          </li>
          <li>
            <strong>Applying with MatchMySkillset (free):</strong> for jobs posted on the site, we
            send your application to the employer when you ask us to.
          </li>
          <li>
            <strong>Profiles employers can find (free, optional):</strong> an anonymous profile that
            employers can ask to contact. Nothing about who you are is shared unless you accept.
          </li>
          <li>
            <strong>Recruiter shortlists:</strong> if you apply to a job, or switch on &lsquo;Let
            employers find me&rsquo;, our recruitment team may review your application or profile to put
            together shortlists for employers on Growth and Enterprise plans. Employers only see your
            name and contact details if you applied to them or you accept their request.
          </li>
          <li>
            <strong>Career Change Report (paid):</strong> a one-off report about one career you
            choose. It is not a subscription.
          </li>
        </ul>

        <h2 className={h2}>3. Guidance, not a guarantee</h2>
        <p>
          Skills and career suggestions are produced automatically by software, including an AI
          model. They are a starting point for your own research, not professional careers, legal or
          financial advice. Salary, demand and training information is an estimate based on
          published sources and may be out of date or not match a particular employer. We do not
          promise that you will get any job, interview or pay level.
        </p>
        <p>
          {SITE_NAME} is not an employer and does not decide who is hired. We never charge job
          seekers for finding work. When you apply for a job posted here, we pass your application to
          the employer because you asked us to; the employer decides what happens next. We do not
          pass your details to employers or outside recruiters unless you choose to. A match score is an
          automatic indicator of how your skills compare with an advert, not an assessment of you.
        </p>

        <h2 className={h2}>4. What you submit</h2>
        <p>
          You must only submit a CV or other text that you are entitled to use, normally your own,
          and only apply, set up alerts or create a profile with your own email address. What you put
          in a profile or application must be true to the best of your knowledge.
          Please leave out sensitive details you do not want processed (see the Privacy Policy) and
          other people&apos;s personal details, such as referees&apos; contact information. You keep
          ownership of what you submit. You allow us to use it only to provide the service you asked
          for.
        </p>

        <h2 className={h2}>5. Paid reports</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>The price is shown before you pay. Payment is taken by Stripe.</li>
          <li>
            The report is delivered straight after payment, on screen and by email to the address
            you give at checkout. Your report link works for 12 months from purchase, so save a copy
            if you want it for longer.
          </li>
          <li>
            The report is digital content supplied immediately. At checkout you will be asked to
            agree to immediate supply and to acknowledge that, once supply starts, you lose the
            14-day right to cancel that would otherwise apply.
          </li>
          <li>
            This does not affect your legal rights. If a report is faulty or not as described, you
            are entitled to have it fixed or replaced, or in some cases to a refund. Email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
              {CONTACT_EMAIL}
            </a>{" "}
            and tell us what went wrong.
          </li>
        </ul>

        <h2 className={h2}>6. Job listings</h2>
        <p>
          Most listings come from third-party job boards. We do not write, check or control them and
          cannot guarantee that they are accurate or still open. Clicking one takes you to the job
          board&apos;s own site, where its own terms apply. Jobs marked &ldquo;Posted on
          MatchMySkillset&rdquo; are written by the employers who post them. We check each one before
          it goes live, but the employer is responsible for the job, the advert and how it handles
          your application.
        </p>

        <h2 className={h2}>7. Fair use</h2>
        <p>
          Please do not use automated tools to scrape or bulk-query the site, try to get around our
          usage limits, interfere with the service, submit other people&apos;s CVs without their
          permission, or use the service for anything unlawful. We may limit or block access where
          this happens.
        </p>

        <h2 className={h2}>8. Our content</h2>
        <p>
          The site, its guides and its design belong to {LEGAL_ENTITY_NAME} or its licensors. Your
          results and reports are for your own personal use.
        </p>

        <h2 className={h2}>9. Our responsibility to you</h2>
        <p>
          We are responsible for loss or damage you suffer that is a foreseeable result of our
          breaking these terms or failing to use reasonable care and skill. We are not responsible
          for loss that was not foreseeable, for decisions you make based on the suggestions, or for
          business losses, as the service is for personal use. Nothing in these terms limits our
          liability for death or personal injury caused by our negligence, for fraud, or for
          anything else that cannot be limited by law.
        </p>

        <h2 className={h2}>10. Changes</h2>
        <p>
          We may change the service or these terms. If we change the terms, we will update this
          page and the date at the top. The terms in force when you buy a report apply to that
          purchase.
        </p>

        <h2 className={h2}>11. Law</h2>
        <p>
          These terms are governed by the law of England and Wales. You can bring proceedings in
          the courts of England and Wales, or, if you live in Scotland or Northern Ireland, in the
          courts where you live.
        </p>

        <h2 className={h2}>12. Contact</h2>
        <p>
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        {/* CV tools terms (job packs, Plus, accounts): kept in its own component. */}
        <CandidateToolsTerms />

        {/* Employer terms: owned by the employer side, kept in its own component. */}
        <EmployerTerms />
      </div>
    </div>
  );
}
