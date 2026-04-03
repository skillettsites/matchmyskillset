import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Jobs for Empaths (2026) | Careers for Sensitive People",
  description:
    "The best careers for empaths and highly sensitive people. Roles that reward emotional intelligence without causing burnout. Salary data, boundaries advice, and practical tips.",
  keywords: [
    "best jobs for empaths",
    "careers for sensitive people",
    "empath career advice",
    "highly sensitive person jobs",
    "empathetic careers",
    "emotional intelligence jobs",
  ],
  openGraph: {
    title: "Best Jobs for Empaths (2026)",
    description: "Careers that reward emotional intelligence without draining you.",
    type: "article",
  },
};

export default function EmpathJobsPage() {
  const jobs = [
    { title: "UX Researcher", salary: "£30,000 - £60,000", category: "Helping Through Design", why: "Your ability to understand how other people think and feel is literally the job description. UX research requires deep empathy, active listening, and the ability to identify unstated needs." },
    { title: "Counsellor / Therapist", salary: "£25,000 - £55,000", category: "Direct Helping", why: "The most obvious fit for empaths. Your natural ability to hold space for others' emotions is a professional asset. Crucial caveat: you must maintain strong boundaries to avoid compassion fatigue." },
    { title: "Occupational Therapist", salary: "£28,000 - £44,000", category: "Direct Helping", why: "Help people regain independence after illness or injury. Meaningful, one-to-one work with tangible outcomes. Less acute pressure than hospital nursing." },
    { title: "Librarian", salary: "£24,000 - £38,000", category: "Quiet Service", why: "Helping people in a calm, structured environment. Brief interactions rather than emotionally intense ones. The quiet atmosphere protects empaths from overstimulation." },
    { title: "Technical Writer", salary: "£28,000 - £55,000", category: "Quiet Service", why: "Your empathy helps you anticipate what users need from documentation. This is empathy expressed through writing rather than direct emotional labour. Remote, quiet, and well-paid." },
    { title: "Charity / Non-Profit Worker", salary: "£22,000 - £45,000", category: "Purposeful Work", why: "Channel your empathy into systemic change. Programme management, fundraising, and advocacy roles let you help at a broader level than individual cases." },
    { title: "Social Worker", salary: "£27,000 - £42,000", category: "Direct Helping", why: "Deeply meaningful work supporting vulnerable people. Your empathy is essential. Warning: this role requires exceptional boundaries and resilience. Supervision and self-care are non-negotiable." },
    { title: "HR / People Partner", salary: "£30,000 - £58,000", category: "Purposeful Work", why: "Support employees through difficult situations: grievances, redundancy, wellbeing. Your emotional intelligence is a genuine professional advantage in people management." },
    { title: "Speech and Language Therapist", salary: "£27,000 - £42,000", category: "Direct Helping", why: "Help children and adults communicate. Patient, one-to-one work where empathy directly improves outcomes. Appointment-based, so you control your emotional load." },
    { title: "Veterinary Nurse / Animal Care", salary: "£20,000 - £28,000", category: "Quiet Service", why: "If human emotions are overwhelming, working with animals channels your nurturing instincts without the emotional complexity of human relationships." },
    { title: "Art / Music Therapist", salary: "£28,000 - £45,000", category: "Creative Healing", why: "Use creative expression to help people process emotions. Less verbally intensive than talking therapy. Your sensitivity to non-verbal cues is the core skill." },
    { title: "Environmental / Conservation Officer", salary: "£24,000 - £40,000", category: "Purposeful Work", why: "Empathy extends beyond humans. If you feel deeply about the natural world, conservation work channels that energy into tangible environmental protection." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Best Jobs for Empaths (2026)",
            description: "Careers that reward emotional intelligence, with salary data and boundary advice.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Jobs for Empaths</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Best Jobs for Empaths and Highly Sensitive People
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Being an empath in the workplace is a paradox. Your ability to read emotions, anticipate needs, and connect deeply with others makes you exceptionally good at many jobs. But the same sensitivity can leave you drained, overwhelmed, and burning out faster than your colleagues.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The solution is not to suppress your empathy. It is to channel it into roles that value emotional intelligence while providing enough structure and boundaries to protect your energy. Research from the University of Michigan shows that emotional intelligence is the strongest predictor of workplace performance in roles involving human interaction.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers 12 careers for empaths, organised by the type of empathy they reward, with honest warnings about which roles carry burnout risk and how to protect yourself.
      </p>

      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your empathy is a professional strength</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will match your skills (including emotional intelligence) to careers that value them.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Careers for Empaths</h2>
        <div className="space-y-5">
          {jobs.map((job, idx) => (
            <div key={job.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs font-medium mb-3">
                  {job.category}
                </div>
                <p className="text-sm text-gray-600">{job.why}</p>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Empathy is increasingly valued by employers</h3>
                  <p className="text-gray-300 text-sm mb-4">Emotional intelligence is the #1 predictor of leadership success. Our AI matches your empathetic strengths to careers where they are rewarded.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 8 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Emotional intelligence is the strongest predictor of workplace performance</span> in people-facing roles. Your sensitivity is not a weakness; it is your competitive advantage.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your matches</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Boundary advice */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Protecting Your Energy at Work</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Set emotional boundaries</h3>
            <p className="text-sm text-gray-600">You can be empathetic without absorbing others' emotions. Practice noticing the difference between "I understand how they feel" and "I feel what they feel."</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Schedule recovery time</h3>
            <p className="text-sm text-gray-600">After emotionally intensive work (meetings, client sessions, difficult conversations), build in 15-30 minutes of quiet time. This is not luxury; it is maintenance.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Choose your environment</h3>
            <p className="text-sm text-gray-600">Open-plan offices drain empaths faster than private spaces. Prioritise roles that offer remote work, private offices, or quiet zones.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Seek supervision or peer support</h3>
            <p className="text-sm text-gray-600">In emotionally demanding roles (therapy, social work), professional supervision is essential. In any role, a peer support group helps process emotional experiences.</p>
          </div>
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to find a career that values your empathy?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your matches &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your sensitivity is your superpower</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover careers that reward your emotional intelligence. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-jobs-for-work-life-balance" className="text-sm text-indigo-600 hover:text-indigo-700">Work-Life Balance Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-people-with-adhd" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for People With ADHD</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-from-nursing" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change From Nursing</Link>
        </div>
      </div>
    </div>
  );
}
