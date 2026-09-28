import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/GoogleAnalytics";
import {
  CONTACT_EMAIL,
  LEGAL_ENTITY_NAME,
  LEGAL_LAST_UPDATED,
  RECRUITER_SHARING_ENABLED,
  RECRUITMENT_PARTNER_NAME,
  SITE_NAME,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What MatchMySkillset collects when you check your CV or buy a report, why, who processes it, how long it is kept and how to exercise your rights.",
};

const h2 = "text-xl font-semibold text-gray-900 mt-10 mb-3 scroll-mt-24";
const h3 = "font-semibold text-gray-900 mt-6 mb-2";
const link = "text-indigo-700 underline";

function Email() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className={link}>
      {CONTACT_EMAIL}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {LEGAL_LAST_UPDATED}</p>

      <div className="text-gray-700 leading-relaxed space-y-4">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="font-semibold text-gray-900 mb-2">The short version</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>There are no accounts. You can check your CV without signing up.</li>
            <li>
              Your CV text is sent to Anthropic (the company behind the Claude AI model) in the
              United States to identify your skills. We do not keep the raw CV text once the
              analysis has finished.
            </li>
            <li>
              We keep your results (skills, career matches and the job title you gave) for 12
              months so your results link keeps working, then delete them.
            </li>
            <li>Payments are handled by Stripe. We keep purchase records for 6 years for tax.</li>
            <li>Google Analytics cookies are only used if you click Accept.</li>
            <li>
              We do not sell your data.{" "}
              {RECRUITER_SHARING_ENABLED
                ? `We only pass your CV to a recruitment agency (${RECRUITMENT_PARTNER_NAME}) if you tick the optional box asking us to, and you can withdraw at any time.`
                : "We do not pass your CV to recruiters or employers."}
            </li>
          </ul>
        </div>

        <h2 className={h2}>1. Who we are</h2>
        <p>
          {SITE_NAME} (matchmyskillset.com) is run by {LEGAL_ENTITY_NAME}, the controller of the
          personal data described here. You can contact us about anything in this policy at{" "}
          <Email />.
        </p>

        <h2 className={h2}>2. What we collect and why</h2>

        <h3 className={h3}>Your CV or job title</h3>
        <p>
          When you use the free check, you either paste or upload your CV, or type your current job
          title. We send that text to Anthropic to pick out your skills and compare them with UK
          occupations. The raw CV text, and any file you upload, is used only for that analysis and
          is not stored by us afterwards
          {RECRUITER_SHARING_ENABLED
            ? ", unless you tick the optional recruiter box (see section 4a)."
            : "."}
        </p>
        <p>
          <strong>Lawful basis:</strong> contract. We need the text to give you the result you asked
          for.
        </p>

        <h3 className={h3}>Your results</h3>
        <p>
          We store the output of the analysis: the skills we found, your career matches, the job
          title you gave (if any) and a random code that makes up your private results link. Anyone
          who has the link can open the results, so only share it with people you trust.
        </p>
        <p>
          <strong>Lawful basis:</strong> contract, so the link you are given keeps working.
        </p>

        <h3 className={h3}>Your email address (optional)</h3>
        <p>
          If you ask us to email your results or a report, we use your email address to send it.
          We do not add you to a mailing list, and we will not send you marketing emails unless you
          have separately agreed to receive them.
        </p>
        <p>
          <strong>Lawful basis:</strong> contract.
        </p>

        <h3 className={h3}>Paid reports</h3>
        <p>
          If you buy a report, Stripe takes the payment. We never see your full card details. Stripe
          tells us your email address, the amount, the payment status and a payment reference, and
          we record which report you bought so we can deliver it and deal with any questions.
        </p>
        <p>
          <strong>Lawful basis:</strong> contract, and legal obligation for the tax records we must
          keep.
        </p>

        <h3 className={h3}>Job searches</h3>
        <p>
          When you search for jobs, the words and location you type are sent to Reed, Adzuna and
          Himalayas to fetch live listings. They do not receive your name, email or CV. When you
          click a listing, we record the listing (its source, reference, title and link) but not who
          you are, so we can see which listings are useful. The listing opens on the job
          board&apos;s own site, where its privacy policy applies.
        </p>
        <p>
          <strong>Lawful basis:</strong> legitimate interests in running and improving the service.
        </p>

        <h3 className={h3}>Security and abuse prevention</h3>
        <p>
          Our hosting provider receives your IP address and browser details with every request, as
          any website does, and keeps server logs for a short period. To stop automated abuse, we
          count requests per IP address. We store only a scrambled (keyed hash) version of the
          address for this, and delete it within 24 hours.
        </p>
        <p>
          <strong>Lawful basis:</strong> legitimate interests in keeping the service secure and
          available.
        </p>

        <h3 className={h3}>Analytics</h3>
        <p>
          With your consent, we use Google Analytics to understand how people use the site, such as
          which pages they visit and whether they complete a check. We also use Vercel Web
          Analytics, which does not use cookies and reports only aggregated figures such as page
          views.
        </p>
        <p>
          <strong>Lawful basis:</strong> consent for Google Analytics cookies; legitimate interests
          for aggregated, cookieless statistics.
        </p>

        <h2 className={h2} id="special-category">
          3. Sensitive information in your CV
        </h2>
        <p>
          CVs often contain more than work history. Please remove anything you would rather we did
          not process before you submit, especially information about your health or disability,
          ethnicity, religion or beliefs, sexual orientation, political opinions, trade union
          membership or criminal record. We do not need any of it, and it plays no part in your
          matches. If it is included, it is sent to Anthropic with the rest of the text for the
          analysis and is not stored by us afterwards.
        </p>

        <h2 className={h2}>4. Who we share it with</h2>
        <p>
          We use these service providers. They process data on our behalf and under our
          instructions, except where noted.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Anthropic, PBC</strong> (United States): analyses your CV text or job title. By
            default Anthropic does not use data sent through its API to train its models, and it
            deletes API inputs and outputs within 30 days, except where it has to keep them longer
            to enforce its usage policies or by law.
          </li>
          <li>
            <strong>Vercel Inc.</strong> (United States): hosts the website, keeps server logs and
            provides cookieless web analytics.
          </li>
          <li>
            <strong>Supabase</strong>: stores your results and purchase records in a database hosted
            in the European Union (Ireland).
          </li>
          <li>
            <strong>Resend</strong> (United States): sends the emails you ask for.
          </li>
          <li>
            <strong>Stripe</strong>: processes payments. For some purposes, such as preventing fraud
            and meeting its own legal duties, Stripe acts as a separate controller under its own
            privacy policy.
          </li>
          <li>
            <strong>Google</strong>: Google Analytics, only if you accept analytics cookies.
          </li>
          <li>
            <strong>Reed, Adzuna and Himalayas</strong>: receive the search words and location you
            type when you search for jobs, and nothing else about you.
          </li>
          {RECRUITER_SHARING_ENABLED && (
            <li>
              <strong>{RECRUITMENT_PARTNER_NAME}</strong> (recruitment agency): only if you tick the
              optional recruiter box. It receives your details as a separate controller, as described
              in <a href="#recruiter" className={link}>section 4a</a>.
            </li>
          )}
        </ul>
        <p>
          We may also disclose information if the law requires it. We do not sell personal data
          {RECRUITER_SHARING_ENABLED
            ? ", and we only share your CV, results or contact details with a recruitment agency if you ask us to."
            : ", and we do not share your CV, results or contact details with recruiters or employers."}
        </p>

        {RECRUITER_SHARING_ENABLED && (
          <>
            <h3 className={h3} id="recruiter">
              4a. Optional: letting a recruitment agency contact you
            </h3>
            <p>
              When you check your CV you can tick an optional, unticked box that reads &quot;Let{" "}
              {RECRUITMENT_PARTNER_NAME}, a UK recruitment agency, contact me about roles that fit my
              skills&quot;. Nothing is shared unless you tick it.
            </p>
            <p>
              If you tick it, we keep and pass to {RECRUITMENT_PARTNER_NAME}: your email address, your
              CV text, the skills we found, your top career matches, and your name and current job
              if you gave them. Anything else in your CV, including any sensitive information you
              chose to leave in (see <a href="#special-category" className={link}>section 3</a>), is
              shared too, so please remove it first. {RECRUITMENT_PARTNER_NAME} uses these details to
              contact you about suitable roles and handles them under its own privacy policy as a
              separate controller.
            </p>
            <p>
              <strong>Lawful basis:</strong> your consent. You can withdraw it at any time by
              emailing <Email />. We then stop sharing your details, delete the copy we hold, and ask{" "}
              {RECRUITMENT_PARTNER_NAME} to delete theirs. Withdrawing does not affect sharing that
              happened before you withdrew.
            </p>
          </>
        )}

        <h2 className={h2}>5. International transfers</h2>
        <p>
          Some of these providers process data in the United States. Where they do, the transfer is
          covered by the UK Extension to the EU-US Data Privacy Framework (where the provider is
          certified) or by the International Data Transfer Addendum to the EU standard contractual
          clauses in the provider&apos;s data processing terms.
        </p>

        <h2 className={h2}>6. How long we keep it</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Raw CV text and uploaded files:</strong> not stored by us after the analysis
            {RECRUITER_SHARING_ENABLED ? " unless you tick the recruiter box" : ""}. Anthropic keeps
            API data for up to 30 days, as described above.
          </li>
          <li>
            <strong>Results</strong> (skills, matches, job title, results link, and your email if you
            gave it): 12 months, then deleted.
          </li>
          <li>
            <strong>Purchase records</strong> (email, amount, payment reference, report
            reference): 6 years from the purchase, for tax, then deleted.
          </li>
          {RECRUITER_SHARING_ENABLED && (
            <li>
              <strong>Details you asked us to pass to {RECRUITMENT_PARTNER_NAME}</strong> (including
              your CV text): 12 months from when you ticked the box, or until you withdraw consent if
              sooner, then deleted from our systems.
            </li>
          )}
          <li>
            <strong>Hashed IP addresses used for abuse prevention:</strong> up to 24 hours.
          </li>
          <li>
            <strong>Job click records:</strong> these contain no personal details.
          </li>
          <li>
            <strong>Google Analytics data:</strong> no longer than 14 months.
          </li>
          <li>
            <strong>Emails you send us:</strong> as long as we need to deal with your message.
          </li>
        </ul>

        <h2 className={h2} id="cookies">
          7. Cookies and local storage
        </h2>
        <p>
          We only use analytics cookies if you click Accept on the cookie banner. If you do, Google
          Analytics sets the <code>_ga</code> and <code>_ga_*</code> cookies, which last up to 2
          years. If you click Reject, Google Analytics does not load at all. Your choice is saved in
          your browser&apos;s local storage so we do not ask again on every page; that is
          necessary for the banner to work and does not track you.
        </p>
        <p>
          Vercel Web Analytics does not use cookies. When you pay, Stripe&apos;s checkout page sets
          its own cookies on stripe.com to process the payment and prevent fraud.
        </p>
        <p>
          You can change or withdraw your choice at any time: <CookieSettingsButton />.
        </p>

        <h2 className={h2}>8. Automated suggestions</h2>
        <p>
          Your career matches are produced automatically by software, including an AI model. They
          are suggestions for you to consider, not decisions about you, and they have no legal or
          similarly significant effect. Check anything important, such as pay or entry
          requirements, before relying on it.
        </p>

        <h2 className={h2}>9. Your rights</h2>
        <p>Under UK data protection law you have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>get a copy of the personal data we hold about you;</li>
          <li>have inaccurate data corrected;</li>
          <li>have your data deleted;</li>
          <li>restrict or object to how we use it, including where we rely on legitimate interests;</li>
          <li>receive data you gave us in a portable format;</li>
          <li>withdraw consent at any time, for example to analytics cookies.</li>
        </ul>
        <p>
          To use any of these rights, email <Email />. As there are no accounts, please include your
          results link or the email address you used, so we can find your data. We will reply
          within one month.
        </p>

        <h2 className={h2}>10. Complaints</h2>
        <p>
          If you are unhappy with how we have handled your data, please tell us first at{" "}
          <Email />. You also have the right to complain to the Information Commissioner&apos;s
          Office (ICO), the UK data protection regulator:{" "}
          <a href="https://ico.org.uk/make-a-complaint/" className={link}>
            ico.org.uk/make-a-complaint
          </a>{" "}
          or 0303 123 1113.
        </p>

        <h2 className={h2}>11. Children</h2>
        <p>The site is designed for adults thinking about their careers and is not aimed at children.</p>

        <h2 className={h2}>12. Changes to this policy</h2>
        <p>
          If we change how we use personal data, we will update this page and the date at the top.
          See also our <Link href="/terms" className={link}>Terms of Service</Link>.
        </p>
      </div>
    </div>
  );
}
