import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";
import { PACK_PRICE_LABEL, PLUS_PACKS_PER_MONTH, PLUS_PRICE_LABEL, SIGN_IN_MINUTES } from "@/lib/candidate/plans";

// CV tools section of /privacy (candidate accounts, job packs, Plus). Kept in
// its own file so edits to the rest of the page never collide with it.

const h2 = "mt-12 mb-3 scroll-mt-24 text-[24px] font-bold tracking-[-0.02em] text-ink";
const h3 = "mt-6 mb-2 text-[18px] font-semibold text-ink";
const link = "text-link underline";

export function CandidateToolsPrivacy() {
  return (
    <section aria-labelledby="cv-tools" className="space-y-4">
      <h2 id="cv-tools" className={h2}>
        If you use the CV tools (job packs, Plus and accounts)
      </h2>
      <p>
        This part covers the optional CV tools: a tailored CV, cover letter and interview prep for one job (a &ldquo;job pack&rdquo;, {PACK_PRICE_LABEL} or your one free
        tailored CV), the {PLUS_PRICE_LABEL} a month Plus plan, and job seeker accounts. Matching your CV to jobs does not need any of this.
      </p>

      <h3 className={h3}>What we collect and why</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Your account</strong> (optional): your email address, when you signed up and last signed in, your plan, whether you have used your free tailored CV,
          and the choices you make in your account settings. Sign-in is by an emailed link: links and sessions are stored only as a scrambled (hashed) version; a
          link works once, within {SIGN_IN_MINUTES} minutes, and a session lasts 30 days. Lawful basis: our contract with you, and our legitimate interest in keeping
          accounts secure.
        </li>
        <li>
          <strong>Job packs:</strong> the job advert, the CV text you gave us for that pack, and what we wrote (your tailored CV, including the name and contact
          details from your CV, the cover letter, the interview prep, the gaps and our check notes), plus any edits you make. We keep the CV text inside the pack so we
          can finish, redo or add to it; it is deleted with the pack. Lawful basis: our contract with you.
        </li>
        <li>
          <strong>A saved CV</strong>, only if you tick &ldquo;Keep this CV on my account&rdquo;. You can delete it from your account at any time. Lawful basis: your
          consent.
        </li>
        <li>
          <strong>Results pages linked to your account</strong>, when you open them while signed in, and your employer profile if you have one (found by your email
          address), so your account can show them. Lawful basis: our contract with you.
        </li>
        <li>
          <strong>Usage counts:</strong> when you use a Plus job pack or Check any job, so we can apply the fair use limit of {PLUS_PACKS_PER_MONTH} packs a billing
          month. Lawful basis: our contract with you.
        </li>
        <li>
          <strong>Optional settings:</strong> application tracking (keeping a record of jobs you apply for and asking you afterwards how they went) and news emails
          are off unless you switch them on, and you can switch them off at any time. Lawful basis: your consent.
        </li>
        <li>
          <strong>Payments:</strong> Stripe handles card details; we never see them. We keep the Stripe customer and subscription references, your plan, when it
          renews, and a record of each payment. Lawful basis: our contract with you, and our legal duty to keep tax records.
        </li>
      </ul>

      <h3 className={h3}>How a job pack is written</h3>
      <p>
        We send your CV text and the job advert to Anthropic, PBC (United States), the company behind the Claude AI model, which writes the pack. We also send a list
        of the advert&apos;s skills that our own software found in your CV. Anthropic acts as our processor and, by default, does not use data sent through its API to
        train its models; it deletes API inputs and outputs within 30 days, except where it has to keep them longer to enforce its usage policies or by law. Our own
        checks then take out anything the pack says that is not in your CV. The pack is a draft for you to check and edit; it is not a decision about you.
      </p>

      <h3 className={h3}>Who else sees it</h3>
      <p>
        Nobody, unless you send it. We do not send your pack to employers: you download it and use it as you choose. The same service providers as the rest of the
        site store and send it (Supabase stores it in the European Union; Vercel hosts the site; Resend sends your sign-in links and pack emails), and Stripe processes
        payments.
      </p>

      <h3 className={h3}>How long we keep it</h3>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong>Job packs in an account</strong> (with the CV text inside them): while your account exists. You can delete any pack at any time; deleting your account
          deletes them all.
        </li>
        <li>
          <strong>Job packs bought without an account:</strong> 12 months from the purchase, then deleted. You can delete one sooner from its page.
        </li>
        <li>
          <strong>Packs started but never paid for:</strong> deleted after a day.
        </li>
        <li>
          <strong>Your saved CV:</strong> until you delete it or your account.
        </li>
        <li>
          <strong>Your account, usage counts and linked results list:</strong> until you delete your account. Deleting your account also deletes the linked results
          pages if you leave that box ticked.
        </li>
        <li>
          <strong>Payment records</strong> (email, amount, date and Stripe reference): 6 years from the payment, for tax, even after you delete your account.
        </li>
      </ul>

      <h3 className={h3}>Cookies and browser storage</h3>
      <p>
        Signing in sets one cookie, <code>mms_candidate</code>, which keeps you signed in for up to 30 days. It is strictly necessary for the account to work, so it is
        set without asking. An advert you pass from Check any job to the tailor page is kept in your browser&apos;s session storage for that tab only.
      </p>

      <h3 className={h3}>Your rights</h3>
      <p>
        In your account you can download everything we hold for it (&ldquo;Download my data&rdquo;), delete your saved CV, delete any pack, and delete the whole account.
        For anything else, or a pack bought without an account, email <a href={`mailto:${CONTACT_EMAIL}`} className={link}>{CONTACT_EMAIL}</a>. See also the{" "}
        <Link href="/terms#cv-tools" className={link}>
          {SITE_NAME} CV tools terms
        </Link>
        .
      </p>
    </section>
  );
}
