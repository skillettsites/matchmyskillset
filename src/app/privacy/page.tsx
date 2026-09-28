import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/GoogleAnalytics";
import { ALERT_CONSENT_TEXT, PROFILE_CONSENT_TEXT } from "@/lib/candidates/consent";
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
              analysis has finished, unless you apply for a job posted here or choose to add it to
              an employer-visible profile.
            </li>
            <li>
              To find live jobs for you we send job titles and the place you typed (never your name,
              email or CV) to the job boards we search.
            </li>
            <li>
              We keep your results (skills, career matches, the job title you gave, and for a CV a few
              paraphrased achievements, short notes on where each skill shows and what you said matters to you) for 12 months so your results
              link keeps working, then delete them.
            </li>
            <li>Payments are handled by Stripe. We keep purchase records for 6 years for tax.</li>
            <li>Google Analytics cookies are only used if you click Accept.</li>
            <li>
              We do not sell your data. An employer only gets your CV and contact details if you
              apply for their job on MatchMySkillset (ticking a box that names them) or accept their
              request to contact you.
              {RECRUITER_SHARING_ENABLED
                ? ` We only pass your CV to a recruitment agency (${RECRUITMENT_PARTNER_NAME}) if you tick the optional box asking us to, and you can withdraw at any time.`
                : ""}
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

        <h3 className={h3} id="cv">Your CV or job title</h3>
        <p>
          When you use the free check, you either paste or upload your CV, or type your current job
          title. We send that text to Anthropic to pick out your skills and compare them with UK
          occupations. The raw CV text, and any file you upload, is used only for that analysis and
          is not stored by us afterwards, except when you ask us to: when you apply for a job posted
          on MatchMySkillset (see &ldquo;Applying for a job posted here&rdquo;), or when you add your
          CV to a profile employers can find (see &ldquo;Letting employers find you&rdquo;)
          {RECRUITER_SHARING_ENABLED
            ? ", or when you tick the optional recruiter box (see section 4a)."
            : "."}
        </p>
        <p>
          So you do not have to upload it again, your browser keeps a copy of your CV text in its
          session storage for the tab you used, until you close that tab. It stays on your device and
          is only sent to us if you use it to apply for a job or add it to a profile.
        </p>
        <p>
          <strong>Lawful basis:</strong> contract. We need the text to give you the result you asked
          for.
        </p>

        <h3 className={h3}>Your results</h3>
        <p>
          We store the output of the analysis: the skills we found, your career matches, the job
          title you gave (if any), the town, postcode or region you typed for where you want to work
          (if any), the list of live jobs we found and scored for you, and a random code that makes
          up your private results link. For a CV we also store 4 to 8 short achievement points, a
          short summary of anything you said matters to you, and for each skill a note of up to 10
          words on where it shows in your CV (for example &ldquo;led a department of four
          teachers&rdquo;), all paraphrased by the AI model without names or contact details, so the
          results page and the paid report can use them. Anyone who has the
          link can open the results, so only share it with people you trust.
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
          On your results page we search for live jobs for you: we send the job title of your own job
          and of your closest career matches, and the town, postcode or region you typed, to Reed,
          Adzuna and Himalayas (GOV.UK Teaching Vacancies and Remotive listings are fetched in bulk
          and filtered on our side). No board receives your name, email or CV. We work out the match
          scores ourselves. When you type a town, the letters you type are sent from our server to
          postcodes.io (a free UK postcode and place-name service) to suggest places and find the
          region; your IP address is not passed to it.
        </p>
        <p>
          When you search for jobs, the words and location you type are sent to the job boards we
          use (Reed, Adzuna and Himalayas, and Careerjet and Jooble when we use them) to fetch live
          listings. GOV.UK Teaching Vacancies and Remotive listings are fetched in bulk and filtered
          on our side, so they receive nothing about your search. Careerjet also requires the IP
          address and browser details of the person searching, so those are passed to it with your
          search. No board receives your name, email or CV. When you
          click a listing, we record the listing (its source, reference, title and link) but not who
          you are, so we can see which listings are useful. The listing opens on the job
          board&apos;s own site, where its privacy policy applies.
        </p>
        <p>
          <strong>Lawful basis:</strong> legitimate interests in running and improving the service.
        </p>

        <h3 className={h3} id="alerts">Job alerts</h3>
        <p>
          If you ask for job alerts, we keep your email address, how often you want them, the skill
          codes and job titles from your results (not your CV), the place you searched and a list of
          jobs we have already sent you, so we never send the same job twice. The box you tick
          reads: &ldquo;{ALERT_CONSENT_TEXT}&rdquo; Every alert email has a link to change or pause the
          alert, and a one-click unsubscribe, which deletes it.
        </p>
        <p>
          <strong>Lawful basis:</strong> consent, which you can withdraw at any time by unsubscribing.
        </p>

        <h3 className={h3} id="applying">Applying for a job posted here</h3>
        <p>
          Some jobs are posted on MatchMySkillset by employers. When you apply for one, you tick a box
          that names the employer and the job. We then make your name, email address, phone number
          (if you gave it), CV, note (if you wrote one), your match score and the skills from the
          advert we found in your CV available to that employer in their MatchMySkillset account, and
          email them to say you applied. For a job we posted for an employer without an account, we
          email the application to the address they gave us instead. We keep the application so the
          employer can see it and so you can ask us about it, and we email you a receipt. Once the employer has your application they are a separate controller
          and handle it under their own privacy policy.
        </p>
        <p>
          <strong>Lawful basis:</strong> consent, given by the tick box, and contract, to send the
          application you asked us to send.
        </p>

        <h3 className={h3} id="employers-find-me">Letting employers find you</h3>
        <p>
          You can choose to create a profile that employers using MatchMySkillset can search. The box
          is unticked until you tick it, and reads: &ldquo;{PROFILE_CONSENT_TEXT}&rdquo; We keep your
          first name, email address, headline, job title, town, region, years of experience, skills
          and, only if you add it, your CV. The profile stays hidden until you switch it on from the
          email we send you, so we know the address is yours.
        </p>
        <p>
          Employers see only the headline, job title, region, years of experience and skills. They
          never see your name, email or CV unless they ask to contact you and you accept, from the
          link we email you. If you accept, that employer can see your first name, email address and
          CV (if you added one) in their MatchMySkillset account, we email them to say you accepted,
          and they become a separate controller for those details. If you decline, they are told, and
          get nothing about you. You can edit the profile, switch it off or delete it,
          with your contact requests and our copies of your applications and job alerts, from your
          private profile link at any time.
        </p>
        <p id="contact-requests">
          <strong>Lawful basis:</strong> consent, which you can withdraw at any time by switching the
          profile off or deleting it.
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
            <strong>Resend</strong> (United States): sends the emails you ask for, including job
            alerts and the application and contact emails we send to employers for you.
          </li>
          <li>
            <strong>postcodes.io</strong> (a free service from Ideal Postcodes): receives the place names and
            postcodes typed into the location box, from our server, to suggest places and find the
            region.
          </li>
          <li>
            <strong>Employers who post jobs on MatchMySkillset</strong>: only when you apply for their
            job or accept their request to contact you, as described in section 2. They receive your
            details as separate controllers.
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
            <strong>Reed, Adzuna, Himalayas, and Careerjet and Jooble when we use them</strong>:
            receive the search words and location you type when you search for jobs. Careerjet also
            receives your IP address and browser details, which it requires. None of them receives
            your name, email or CV.
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
          We may also disclose information if the law requires it. We do not sell personal data, and
          we only share your CV or contact details with an employer
          {RECRUITER_SHARING_ENABLED ? " or recruitment agency" : ""} when you ask us to.
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
            <strong>Job alerts:</strong> until you unsubscribe, or 12 months after you set the alert
            up, whichever is sooner.
          </li>
          <li>
            <strong>Profiles employers can find</strong> (including a CV you added): until you
            delete the profile, or 12 months after you created it. A profile you never switch on is
            deleted after 14 days. Contact requests are deleted with the profile.
          </li>
          <li>
            <strong>Applications for jobs posted here:</strong> our copy is deleted 12 months after
            you applied, or sooner if you ask. The employer keeps the copy we sent them under their own
            policy.
          </li>
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
          Analytics sets the <code>_ga</code> and <code>_ga_*</code>{" "}cookies, which last up to 2
          years. If you click Reject, Google Analytics does not load at all. Your choice is saved in
          your browser&apos;s local storage so we do not ask again on every page; that is
          necessary for the banner to work and does not track you.
        </p>
        <p>
          Two more things are kept in your browser to make features you use work, not to track you:
          your latest results link is kept in local storage for up to 30 days so the job search page
          can show how well each job matches you (you can clear it there with &ldquo;Stop using
          them&rdquo;), and your CV text is kept in session storage for the tab you used until you close
          it (see section 2). Neither is sent anywhere unless you use it.
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
          Your career matches and job match scores are produced automatically by software, including
          an AI model for reading your CV. They are suggestions for you to consider, not decisions
          about you. When you apply for a job posted here, the employer sees your match score with an
          explanation of how it is worked out; it is a rough, automatic indicator, and the employer
          makes its own decisions. Check anything important, such as pay or entry requirements,
          before relying on it.
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
