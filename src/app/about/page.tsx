import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "What MatchMySkillset does, how the CV check works, what it cannot do, and how your data is handled.",
};

const h2 = "text-2xl font-semibold text-gray-900 mt-10 mb-4";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">About {SITE_NAME}</h1>

      <div className="space-y-4 text-gray-600 leading-relaxed">
        <p className="text-lg">
          {SITE_NAME} is an independent UK website for people thinking about changing career. It
          looks at the skills you already have and suggests other careers they could carry over to.
        </p>

        <h2 className={h2}>Why it exists</h2>
        <p>
          Most job searches start with a job title. That works if you want the same job somewhere
          else, but not if you want a change. A teacher already plans, explains, manages groups and
          handles difficult conversations, yet searching for &quot;teacher&quot; will never show
          roles such as learning and development or customer success, where those skills are
          valued. The aim is to make those options easier to spot.
        </p>

        <h2 className={h2} id="how-it-works">
          How it works
        </h2>
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>Tell us what you do.</strong> Paste or upload your CV, or type your current job
            title. No account is needed.
          </li>
          <li>
            <strong>Software picks out your skills.</strong>{" "}An AI model (Anthropic&apos;s Claude)
            reads the text and identifies your skills, which are then compared with a list of UK
            occupations.
          </li>
          <li>
            <strong>You see where they could take you.</strong> Suggested careers, the skills you
            already have for each, and the gaps you would need to fill. You can also search live
            listings from Reed, Adzuna and Himalayas.
          </li>
          <li>
            <strong>Optional paid report.</strong> If you want more detail on one career, you can
            buy a one-off Career Change Report. There is no subscription.
          </li>
        </ol>

        <h2 className={h2}>What it is not</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            The suggestions are generated automatically. Nobody reviews them by hand, so treat them
            as a starting point for your own research, not professional careers advice.
          </li>
          <li>
            Salary and demand figures are estimates and can differ from what a particular employer
            pays.
          </li>
          <li>
            We are not a recruitment agency and cannot promise interviews or jobs. We do not pass
            your CV to employers or recruiters unless you choose to.
          </li>
        </ul>

        <h2 className={h2}>Your data</h2>
        <p>
          Your CV text is used to run the analysis and is not kept by us afterwards, unless you
          choose to let a recruiter contact you. Your results
          are kept for 12 months so your results link works. Analytics cookies are only used if you
          accept them. The{" "}
          <Link href="/privacy" className="text-indigo-700 underline">
            Privacy Policy
          </Link>{" "}
          has the details.
        </p>

        <h2 className={h2}>Contact</h2>
        <p>
          Questions, corrections or feedback:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-700 underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
      </div>

      <div className="mt-12">
        <Link
          href="/discover"
          className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Check your CV free
        </Link>
      </div>
    </div>
  );
}
