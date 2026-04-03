import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "MatchMySkillset is an AI-powered career platform that matches people to jobs based on their actual skills, not just job titles.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
        About MatchMySkillset
      </h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-lg text-gray-600 leading-relaxed">
          MatchMySkillset is a career intelligence platform built on a simple
          idea: the most valuable job match is one neither the candidate nor
          the employer would have found on their own.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          The Problem We Solve
        </h2>
        <p className="text-gray-600">
          Every job board works the same way: search by job title. A teacher
          searches for &quot;teacher.&quot; A project manager searches for
          &quot;project manager.&quot; Nobody searches for &quot;learning
          experience designer&quot; or &quot;customer success manager&quot;
          because they have never heard of those roles, despite having every
          skill required.
        </p>
        <p className="text-gray-600">
          Meanwhile, employers receive hundreds of irrelevant applications while
          the perfect candidate, someone from a different industry with exactly
          the right transferable skills, never applies.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
          AI-Assisted. Human-Led.
        </h2>
        <p className="text-gray-600">
          Our AI analyses your actual skills, including those from parenting,
          volunteering, caring, and side projects, and matches you to careers
          you never knew existed. Our recruitment experts then validate those
          matches and help you make the transition.
        </p>

        <h2
          className="text-2xl font-semibold text-gray-900 mt-10 mb-4"
          id="employers"
        >
          For Employers
        </h2>
        <p className="text-gray-600">
          Instead of receiving 1,500 random applications, get a curated
          shortlist of candidates whose actual skills match your actual needs.
          We find talent from adjacent industries that you would never have
          searched for.
        </p>
        <p className="text-gray-600">
          Interested in posting a role or receiving matched candidates? Get in
          touch at{" "}
          <a
            href="mailto:hello@matchmyskillset.com"
            className="text-indigo-600 hover:text-indigo-700"
          >
            hello@matchmyskillset.com
          </a>
          .
        </p>

        <h2
          className="text-2xl font-semibold text-gray-900 mt-10 mb-4"
          id="how-it-works"
        >
          How It Works
        </h2>
        <ol className="text-gray-600 space-y-3">
          <li>
            <strong>Tell us your skills:</strong> Paste your CV, describe your
            experience, or just tell us what you have done.
          </li>
          <li>
            <strong>AI discovers matches:</strong> Our AI extracts your skills
            and maps them to careers ranked by match strength.
          </li>
          <li>
            <strong>Find real jobs:</strong> Browse thousands of live UK jobs
            ranked by how well your skills match each role.
          </li>
        </ol>
      </div>

      <div className="mt-12">
        <Link
          href="/discover"
          className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Try It Free
        </Link>
      </div>
    </div>
  );
}
