import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "I Hate My Job: What to Do Next (Practical Guide 2026)",
  description:
    "Stuck in a job you hate? Practical steps to figure out what you actually want, whether to quit, and how to transition. No toxic positivity, just honest advice.",
  keywords: [
    "I hate my job what should I do",
    "want to quit my job",
    "hate my job UK",
    "stuck in a job I hate",
    "should I quit my job",
    "unhappy at work",
  ],
  openGraph: {
    title: "I Hate My Job: What to Do Next",
    description: "Practical guide for people who hate their job. Honest advice on whether to stay, fix, or leave.",
    type: "article",
  },
};

export default function HateMyJobPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "I Hate My Job: What to Do Next (2026 Guide)",
            description: "Practical guide for people stuck in a job they hate, with honest advice on next steps.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">I Hate My Job</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        I Hate My Job: What to Do Next
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>10 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        If you typed "I hate my job" into a search engine, you are not alone. CIPD research shows that 1 in 4 UK workers is actively unhappy at work, and a further 33% are disengaged (doing the minimum, mentally checked out, counting down to Friday). That is over half the workforce not enjoying what they spend 40+ hours a week doing.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        This page is not going to tell you to "find your passion" or "just be grateful you have a job." Those responses are useless when you are dreading Monday morning. Instead, this is a structured process to figure out what is actually wrong, whether it can be fixed, and what to do if it cannot.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        The feeling of hating your job is a signal, not a character flaw. Treat it like data.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">1 in 4</div>
          <div className="text-xs text-gray-500">UK workers actively unhappy</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">33%</div>
          <div className="text-xs text-gray-500">Mentally disengaged at work</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">5-7</div>
          <div className="text-xs text-gray-500">Career changes in a lifetime</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">76%</div>
          <div className="text-xs text-gray-500">Employers value skills over loyalty</div>
        </div>
      </div>

      {/* Section 1: Diagnose */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Diagnose what you actually hate</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          "I hate my job" is too broad to act on. The solution for hating your boss is different from hating your industry. Before you do anything, figure out which of these is the real problem:
        </p>
        <div className="space-y-4">
          {[
            { problem: "You hate your manager", sign: "You liked the work before they arrived. Sunday dread started when they did.", fix: "Internal transfer, new team, or new company in the same role. The work is fine; the management is not." },
            { problem: "You hate the culture", sign: "Toxic colleagues, unreasonable expectations, no work-life balance, or values that clash with yours.", fix: "Same role at a different company. Culture varies massively even within the same industry." },
            { problem: "You hate the actual work", sign: "Even on your best days, the tasks themselves bore or drain you. This started years ago and is getting worse.", fix: "Career change. No amount of culture or management fixes will make you enjoy work you fundamentally dislike." },
            { problem: "You are burned out", sign: "You used to enjoy this job. Now you feel exhausted, cynical, and ineffective. Everything feels pointless.", fix: "Rest first, decide second. Burnout distorts your thinking. Take leave, reduce hours, or see your GP before making permanent decisions." },
            { problem: "You are underpaid", sign: "You enjoy the work but feel resentful because you know you are worth more.", fix: "Negotiate a raise, or take the same role elsewhere at market rate. Do not let salary resentment destroy a career you otherwise enjoy." },
            { problem: "You have outgrown the role", sign: "The job is too easy now. You are bored, not stressed. No challenge left.", fix: "Seek promotion, take on a stretch project, or move to a more senior role elsewhere. Your skills need a bigger stage." },
          ].map((item) => (
            <div key={item.problem} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{item.problem}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-700 mb-1">Signs</div>
                  <p className="text-xs text-red-800">{item.sign}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-green-700 mb-1">What to do</div>
                  <p className="text-xs text-green-800">{item.fix}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 1 - Style A */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Not sure what you would rather be doing?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will show you careers you qualify for that you might not have considered.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Section 2: Should you quit? */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Should you quit? The honest checklist</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-green-800 mb-2">Quit if:</h3>
            <ul className="text-sm text-green-700 space-y-2">
              <li>Your mental or physical health is deteriorating</li>
              <li>You have tried to fix it (new team, conversation with boss) and nothing changed</li>
              <li>You have been unhappy for over 12 months consistently</li>
              <li>You have savings or another offer lined up</li>
              <li>The work itself conflicts with your values</li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-2">Do not quit yet if:</h3>
            <ul className="text-sm text-red-700 space-y-2">
              <li>You have not tried to fix the specific problem</li>
              <li>The unhappiness started recently (under 3 months)</li>
              <li>You have no financial safety net</li>
              <li>You are making the decision while burned out or after a bad week</li>
              <li>You have no idea what you would do instead</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA 2 - Style B */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">Knowing your options makes everything clearer</h3>
        <p className="text-gray-300 text-sm mb-4">The fear of the unknown keeps people in jobs they hate. Once you see what else is out there, the decision becomes rational, not emotional.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Get My Personalised Matches
        </Link>
      </div>

      {/* Section 3: Exit plan */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Build your exit plan</h2>
        <div className="space-y-6">
          {[
            { step: "Calculate your runway", detail: "How many months could you survive without income? This determines how aggressive or cautious your exit needs to be. Aim for 3-6 months of expenses saved before leaving without another job lined up." },
            { step: "Identify what you want instead", detail: "Do not just run from something bad. Run towards something better. What tasks energise you? What work conditions do you need? Use our career matching tool to discover roles that fit." },
            { step: "Start applying while employed", detail: "It is always easier to find a job when you have one. Your negotiating position is stronger. You can be selective. Dedicate 5-10 hours per week to your job search while employed." },
            { step: "Upskill in gaps (not from scratch)", detail: "If your target career requires skills you lack, close the gap with a short course, not a degree. Most transitions need weeks of learning, not years." },
            { step: "Leave professionally", detail: "Resist the urge to burn bridges. Give proper notice. Write a professional resignation letter. You never know when you will cross paths with former colleagues." },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <span className="text-indigo-600 mr-2">{i + 1}.</span>{s.step}
              </h3>
              <p className="text-sm text-gray-600">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 3 - Style C */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The average person changes careers 5-7 times.</span> Leaving a job you hate is not failure. It is self-awareness. Upload your CV and{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">see what you qualify for</Link>.
        </p>
      </div>

      {/* Section: Mental health */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">If it is affecting your mental health</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          A job you hate is not just unpleasant. It can cause anxiety, depression, insomnia, and physical health problems. If you are experiencing any of these, please take action:
        </p>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <ul className="text-sm text-gray-600 space-y-3">
            <li><strong>Talk to your GP.</strong> Work-related mental health issues are valid medical concerns. Your GP can sign you off, refer you for therapy, or support a phased return.</li>
            <li><strong>Call the Samaritans</strong> on 116 123 (free, 24/7) if you are in crisis.</li>
            <li><strong>Contact Mind</strong> at mind.org.uk for workplace mental health resources and advice.</li>
            <li><strong>Know your rights.</strong> You are legally protected from being dismissed for taking sick leave due to mental health. ACAS (acas.org.uk) provides free employment advice.</li>
          </ul>
        </div>
      </section>

      {/* Simple text CTA */}
      <p className="text-gray-600 mb-10">
        Ready to see what is out there?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and discover your options in 2 minutes &rarr;
        </Link>
      </p>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">You deserve to enjoy your work</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover careers that match your skills but not your current misery. Free. 2 minutes. No judgement.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Take the Career Quiz</Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-50" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 50</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-with-no-money" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change With No Money</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-jobs-for-work-life-balance" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs With Work-Life Balance</Link>
        </div>
      </div>
    </div>
  );
}
