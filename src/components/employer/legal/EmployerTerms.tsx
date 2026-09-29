import Link from "next/link";
import { JOBS_EMAIL, LISTING_DAYS } from "@/lib/employer/plans";
import { LEGAL_ENTITY_NAME, SITE_NAME } from "@/lib/site";

// Employer section of /terms. Kept in its own file so the candidate-side
// edits to the rest of the page never collide with it.

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";
const h3 = "mt-6 mb-2 text-[18px] font-semibold text-ink";
const link = "text-link underline";

function Mail() {
  return (
    <a href={`mailto:${JOBS_EMAIL}`} className={link}>
      {JOBS_EMAIL}
    </a>
  );
}

export function EmployerTerms() {
  return (
    <section aria-labelledby="employers" className="space-y-4">
      <h2 id="employers" className={h2}>
        Employer terms
      </h2>
      <p>
        This part applies to businesses and organisations that open an employer account to post jobs, receive applications or contact candidates on {SITE_NAME}.
        The rest of these terms also apply where relevant. By finishing account setup you confirm that you are allowed to act for the organisation you name and
        that you are using {SITE_NAME} for business, not as a consumer.
      </p>

      <h3 className={h3}>Your account</h3>
      <p>
        You sign in with a link we email to you. Keep access to that mailbox secure: anyone who can open your email can sign in. Tell us at <Mail /> if you think
        someone else has used your account.
      </p>

      <h3 className={h3}>What you can post</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          A real, current vacancy that you are recruiting for, based in the UK or open to people working from the UK. If you are a recruitment agency, say so in
          the advert and only post roles you have been asked to fill.
        </li>
        <li>Accurate details: title, location, pay, contract type and hours. If pay is commission only, say so clearly. Pay must meet National Minimum Wage law.</li>
        <li>
          No discrimination. Adverts must follow the Equality Act 2010 (or the equivalent law in Northern Ireland): no requirement or preference based on age,
          disability, gender reassignment, marriage or civil partnership, pregnancy or maternity, race, religion or belief, sex or sexual orientation, unless the
          law allows an occupational requirement and you say why.
        </li>
        <li>
          No fees. Never ask job seekers to pay to apply, for training, for checks or for the job itself, and follow the Employment Agencies Act 1973 and the
          Conduct of Employment Agencies and Employment Businesses Regulations 2003 where they apply.
        </li>
        <li>
          Nothing unlawful or misleading: no pyramid or multi-level marketing schemes, no work that breaks the law, no adverts that exist to collect personal data
          for other purposes, and no links to harmful or deceptive websites.
        </li>
        <li>You remain responsible for your own hiring decisions and legal checks, including right-to-work checks.</li>
      </ul>
      <p>
        A person checks every job before it goes live. We may decline or remove any job that breaks these terms or that we reasonably think could harm job
        seekers, and we will tell you why. Approved jobs run for {LISTING_DAYS} days and can be renewed from your dashboard.
      </p>

      <h3 className={h3}>Candidate details you receive</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You see a candidate&apos;s name, contact details and CV only because they applied to your job through {SITE_NAME} and agreed to share them with you, or
          because they accepted your request to contact them. Candidates in search are shown without their name or contact details; do not try to identify them.
        </li>
        <li>
          Use these details only to recruit for the role they applied to, or to talk to them about the role or opportunity your request described. Do not add them
          to marketing lists, sell or pass them on (other than to service providers who help you recruit, such as an applicant tracking system), or contact them for
          anything else.
        </li>
        <li>
          You are a separate controller for the details you receive and must handle them under UK data protection law (UK GDPR and the Data Protection Act 2018),
          including telling candidates how you use their data and keeping it secure.
        </li>
        <li>Delete a candidate&apos;s details when you no longer need them for that recruitment, and when the candidate asks you to, unless the law requires you to keep them.</li>
      </ul>

      <h3 className={h3} id="applicant-status">
        Applicant status, outcomes and placements
      </h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          You can mark where each applicant stands: viewed, shortlisted, interview, offer, hired or not taken forward. Keep it accurate: we record every change to
          measure how well {SITE_NAME} works, and marking someone hired records a placement.
        </li>
        <li>
          We ask applicants by email, 7 and 21 days after they apply, how it went. If an applicant to your job answers interview, offer or placed, you see it next to
          their application as &ldquo;Candidate says&rdquo;. It is their own answer; we do not check it.
        </li>
        <li>
          After a placement we may ask the person, separately, whether we can mention their move, anonymised, in our case studies. We will not name your organisation
          in a case study without asking you first.
        </li>
      </ul>

      <h3 className={h3} id="shortlists">
        Recruiter shortlists (Growth and Enterprise)
      </h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          On Growth and Enterprise you can ask for a recruiter shortlist for each job, when you post it or later from the job&apos;s page, once per job. Work starts
          when the job has been approved and is live.
        </li>
        <li>
          It is a human review: a recruiter from Flintstone Associates, our recruitment partner, looks at the people who applied to the job and at people who asked
          employers to find them, and sends you the
          ones they think fit best, in order, with a note on each. We email you when it is ready and it appears in your dashboard.
        </li>
        <li>
          We do not promise a set number of candidates, a time by which a shortlist will be ready, or that anyone on it will be hired. A shortlist is a professional
          opinion to help you decide who to talk to first; the hiring decision, and the checks that go with it, stay with you.
        </li>
        <li>
          People on a shortlist who applied to your job are shown with their details, on the terms above. People who have not applied are shown anonymously; you may
          ask to contact them in the usual way, and you get their name, email address and CV only if they accept. Do not try to identify them from the
          recruiter&apos;s note or their profile.
        </li>
      </ul>

      <h3 className={h3}>Plans, payment and cancelling</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Lite, Starter and Growth are monthly subscriptions at the price shown on the{" "}
          <Link href="/employers/pricing" className={link}>
            pricing page
          </Link>{" "}
          when you subscribe (or your partner rate, below). Stripe takes payment by card at the start of each monthly period, and the subscription renews each month
          until you cancel.
        </li>
        <li>
          Lite is one live job at a time with its applicants. It does not include matched candidates, candidate search, contact requests, recruiter shortlists,
          skills-gap reports or a company page.
        </li>
        <li>
          Partner rates: we may agree a lower monthly price for one plan with clients of Flintstone Associates. There is no public partner price. Once we have set it on
          your account, it is the price charged for that plan from your next card checkout, and your Plan and billing page shows &ldquo;Partner rate&rdquo;. If you
          already pay by card, choosing the plan again moves you onto it and ends the old subscription, crediting unused time. Everything else in these terms applies
          as normal.
        </li>
        <li>
          Cancel any time with Manage billing on your Plan and billing page, or by emailing <Mail />. Your plan runs to the end of the period you have paid for and
          then stops; your live jobs close at that point. We do not refund part months, unless the law requires it or we have not provided the service.
        </li>
        <li>If you move to another plan by card, the new plan starts straight away and we end the old subscription, crediting unused time on it to your account with Stripe.</li>
        <li>If a payment fails, your jobs stay live while Stripe tries again. If the payment still cannot be taken, we may end the subscription and close your jobs.</li>
        <li>
          Enterprise, pay per hire and any plan we set up for you without card payment (for example a trial) are agreed with you by email, and those agreed terms
          apply alongside these. A pay-per-hire fee is due only when someone you found through {SITE_NAME} starts work with you, at the amount we agreed before.
        </li>
        <li>We may change our prices for the future. We will email you at least 30 days before a change affects your subscription, and you can cancel before then.</li>
      </ul>

      <h3 className={h3}>Our responsibility to employers</h3>
      <p>
        We do our best to match your jobs with suitable people, but we do not promise any number of views, applicants, matches, shortlisted candidates or hires. To the extent the law
        allows, we are not liable to business users for indirect or consequential loss or for loss of profit, and our total liability to you in any 12 months is
        limited to what you paid us in that period. Nothing in these terms limits liability that cannot be limited by law. We may suspend or close an account that
        breaks these terms.
      </p>

      <h3 className={h3}>Closing your account</h3>
      <p>
        Email <Mail /> from your account address and we will close it: we cancel any subscription, take your jobs down and delete your account, jobs and the
        applications to them within 30 days. We keep billing records for six years for tax. {LEGAL_ENTITY_NAME} runs {SITE_NAME}; the rest of these terms, including
        the governing law, apply to employers too.
      </p>
    </section>
  );
}
