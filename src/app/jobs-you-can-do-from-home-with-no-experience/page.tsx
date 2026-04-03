import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "15 Work From Home Jobs With No Experience UK (2026)",
  description:
    "Genuine work from home jobs in the UK that require no prior experience or qualifications. Real roles, real pay, no scams. Salary ranges and entry routes included.",
  keywords: [
    "work from home no experience UK",
    "remote jobs no qualifications",
    "no experience work from home",
    "entry level remote jobs UK",
    "WFH jobs no degree",
    "beginner remote jobs",
  ],
  openGraph: {
    title: "15 Work From Home Jobs With No Experience UK (2026)",
    description:
      "Genuine remote jobs that need zero experience. Real pay, real opportunities, no scams.",
    type: "article",
  },
};

interface NoExpJob {
  title: string;
  salary: string;
  genuinelyRemote: boolean;
  description: string;
  whyNoExperience: string;
  howToStart: string;
  watchOut: string;
}

const JOBS: NoExpJob[] = [
  {
    title: "Customer Service Advisor (Remote)",
    salary: "£20,000 - £26,000",
    genuinelyRemote: true,
    description: "Handle customer enquiries via phone, chat, or email for companies like Amazon, BT, or insurance firms. Many large employers now hire fully remote customer service teams.",
    whyNoExperience: "Companies provide full training on their products and systems. Your ability to communicate clearly and stay calm is the real requirement.",
    howToStart: "Apply directly on company careers pages. Search 'remote customer service' on Indeed or Reed. Many offer paid training.",
    watchOut: "Avoid any role that asks you to pay for training or equipment upfront. Legitimate employers provide everything.",
  },
  {
    title: "Data Entry Clerk",
    salary: "£18,000 - £24,000",
    genuinelyRemote: true,
    description: "Input information into databases, spreadsheets, or CRM systems. Repetitive but straightforward work that can be done from anywhere with a computer and internet connection.",
    whyNoExperience: "If you can type accurately and follow instructions, you qualify. Speed improves with practice.",
    howToStart: "Temp agencies (Reed, Hays, Office Angels) frequently have remote data entry roles. Start with a typing speed test to prove your ability.",
    watchOut: "Beware of 'data entry jobs' that require upfront payment. These are almost always scams.",
  },
  {
    title: "Virtual Assistant",
    salary: "£10 - £20/hour",
    genuinelyRemote: true,
    description: "Provide remote administrative support: managing diaries, emails, travel bookings, and basic tasks for businesses and entrepreneurs.",
    whyNoExperience: "Basic organisational skills and computer literacy are the real requirements. If you can manage your own life, you can manage someone else's admin.",
    howToStart: "Register on Time Etc, Virtalent, or Belay. Start at lower rates to build reviews, then increase as you gain experience.",
    watchOut: "Some VA platforms take a large commission. Compare terms before signing up.",
  },
  {
    title: "Online Survey Taker / User Tester",
    salary: "£100 - £500/month (part-time)",
    genuinelyRemote: true,
    description: "Complete paid surveys, test websites and apps, and provide feedback on user experiences. Not a full salary, but genuine supplementary income.",
    whyNoExperience: "Companies want opinions from real people, not experts. Your perspective as a regular consumer is exactly what they pay for.",
    howToStart: "Register on Prolific (academic surveys, best pay), UserTesting (£8-15 per test), and Respondent.io (higher paying studies).",
    watchOut: "This is side income, not a career. Anyone claiming you can earn £3,000/month from surveys is lying.",
  },
  {
    title: "Transcriptionist",
    salary: "£18,000 - £28,000",
    genuinelyRemote: true,
    description: "Convert audio recordings into written text. General transcription has a low barrier to entry. Medical and legal transcription pays more but requires training.",
    whyNoExperience: "Good listening skills, fast typing, and attention to detail. You develop speed and accuracy with practice.",
    howToStart: "Start on TranscribeMe or Rev for general transcription. Practice with free audio files. Specialise later for higher rates.",
    watchOut: "Initial pay on platforms like Rev can be low (£3-5/audio hour). Rates improve as your accuracy scores increase.",
  },
  {
    title: "Social Media Assistant",
    salary: "£18,000 - £28,000",
    genuinelyRemote: true,
    description: "Help businesses manage their social media accounts: scheduling posts, responding to comments, and basic content creation. If you use social media daily, you already have the fundamentals.",
    whyNoExperience: "Small businesses need help but cannot afford experienced social media managers. Your personal social media experience is relevant.",
    howToStart: "Offer to manage social accounts for local businesses for free initially. Build a portfolio. Then pitch freelance services or apply to agencies.",
    watchOut: "Do not pay for expensive social media courses. Free resources from HubSpot and Google are better than most paid ones.",
  },
  {
    title: "Content Moderator",
    salary: "£20,000 - £28,000",
    genuinelyRemote: true,
    description: "Review user-generated content on platforms to ensure it meets community guidelines. Involves reviewing text, images, and sometimes video content.",
    whyNoExperience: "Companies train you on their specific guidelines. The core skill is judgement, which does not require formal qualifications.",
    howToStart: "Search for content moderator roles on Indeed. Companies like Accenture, Cognizant, and Meta hire moderators regularly.",
    watchOut: "This role can involve exposure to distressing content. Read the role description carefully and check what wellbeing support is offered.",
  },
  {
    title: "Online Tutor",
    salary: "£15 - £40/hour",
    genuinelyRemote: true,
    description: "Teach subjects you know via video call. English language tutoring is particularly in demand from international students. Primary school subjects are also popular.",
    whyNoExperience: "If you are proficient in a subject, you can tutor it. Formal teaching qualifications help but are not always required.",
    howToStart: "Register on Tutorful, MyTutor, or Preply. Set your rates. Build reviews through consistent quality.",
    watchOut: "Demand fluctuates seasonally (peaks around exam time). Build a regular client base rather than relying on platform bookings.",
  },
  {
    title: "Freelance Proofreader",
    salary: "£20,000 - £35,000",
    genuinelyRemote: true,
    description: "Check written content for spelling, grammar, and consistency errors. Businesses, publishers, and students all need proofreading services.",
    whyNoExperience: "Strong command of English and an eye for detail. A short proofreading course adds credibility but is not mandatory.",
    howToStart: "Take the free CIEP proofreading quiz to test your skills. Register on Reedsy or PeoplePerHour. Build a portfolio from initial clients.",
    watchOut: "Pricing varies wildly. Research market rates before setting yours too low.",
  },
  {
    title: "E-commerce Reseller",
    salary: "Variable (£200 - £3,000+/month)",
    genuinelyRemote: true,
    description: "Buy items cheaply (car boots, charity shops, clearance) and resell on eBay, Vinted, or Amazon. A genuine business model that thousands of UK sellers profit from.",
    whyNoExperience: "Start with items you already own. Learn what sells through experience. Scale gradually with profits.",
    howToStart: "List 10 items from your home on eBay or Vinted today. Learn what categories sell fast. Reinvest profits into stock.",
    watchOut: "Track your costs carefully. HMRC requires you to declare income over the £1,000 trading allowance.",
  },
  {
    title: "Delivery Driver (Flexible)",
    salary: "£10 - £18/hour",
    genuinelyRemote: false,
    description: "Not desk-remote, but flexible. Deliver for Amazon Flex, Deliveroo, or DPD on your own schedule. Choose when and how long you work each day.",
    whyNoExperience: "A driving licence and a suitable vehicle are the main requirements. Training is provided through the app.",
    howToStart: "Sign up on Amazon Flex, Deliveroo, or Stuart. Approval usually takes 1-2 weeks. Start with a few hours to test it.",
    watchOut: "Factor in fuel, insurance, and vehicle wear. Your actual hourly rate after expenses matters more than the headline figure.",
  },
  {
    title: "Chat Support Agent",
    salary: "£19,000 - £25,000",
    genuinelyRemote: true,
    description: "Handle customer queries through live chat rather than phone. Suits people who prefer written communication and can type quickly while maintaining a friendly tone.",
    whyNoExperience: "Full training provided. If you can write clearly, type at a reasonable speed, and stay patient, you meet the requirements.",
    howToStart: "Search 'live chat agent remote' on Indeed or LinkedIn. E-commerce and SaaS companies hire chat agents regularly.",
    watchOut: "Some roles require you to handle multiple chat conversations simultaneously. Ask about this in interviews.",
  },
  {
    title: "Subtitler / Captioner",
    salary: "£18,000 - £30,000",
    genuinelyRemote: true,
    description: "Add subtitles to videos for streaming platforms, YouTube creators, and corporate content. Growing demand due to accessibility requirements and international content.",
    whyNoExperience: "Good listening, fast typing, and timing skills. You learn subtitle formatting quickly. Bilingual skills are a bonus.",
    howToStart: "Apply to Rev, 3Play Media, or Ai-Media. Practice with free tools like Subtitle Edit. Build accuracy before speed.",
    watchOut: "AI is handling more basic subtitling work. Specialise in quality-critical content (broadcast, legal) for job security.",
  },
  {
    title: "Affiliate Blogger",
    salary: "Variable (£0 - £5,000+/month)",
    genuinelyRemote: true,
    description: "Create a blog or niche website that earns commission by recommending products. Takes months to build traffic, but generates passive income once established.",
    whyNoExperience: "You need curiosity and willingness to learn SEO, not qualifications. Many successful affiliate bloggers started with zero experience.",
    howToStart: "Pick a niche you know about. Start a WordPress site (under £50/year). Write helpful content. Apply to Amazon Associates and other affiliate programmes.",
    watchOut: "This takes 6-12 months before meaningful income. Anyone promising quick riches from blogging is misleading you.",
  },
  {
    title: "Mystery Shopper",
    salary: "£50 - £300/month (part-time)",
    genuinelyRemote: true,
    description: "Evaluate customer experiences at shops, restaurants, and online stores. Some assignments are fully online (reviewing websites, phone services, online ordering processes).",
    whyNoExperience: "Companies want real customer perspectives, not trained assessors. Your honest feedback is the product.",
    howToStart: "Register with Market Force, Retail Maxim, or Grassroots. Complete your profile fully. Accept assignments in your area.",
    watchOut: "Never pay to become a mystery shopper. Legitimate companies do not charge you.",
  },
];

export default function WFHNoExperiencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "15 Work From Home Jobs With No Experience UK (2026)",
            description:
              "Genuine remote jobs requiring no prior experience or qualifications, with salary ranges.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: {
              "@type": "Organization",
              name: "MatchMySkillset",
              url: "https://matchmyskillset.com",
            },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <span className="text-gray-600">Work From Home Jobs No Experience</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        15 Work From Home Jobs You Can Start With No Experience (UK)
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Searching for remote jobs with no experience feels like a minefield. Half the results are scams promising £5,000 a month for "easy online work." The other half require 3 years of experience for what they call an entry-level role.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        This guide cuts through the noise. Every role listed here is genuine, pays real money, and does not require prior professional experience. Some are full-time careers with progression. Others are flexible side income. All can be started from your home in the UK.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        We have also included specific red flags for each role, because knowing what to avoid is just as important as knowing where to apply.
      </p>

      {/* Scam Warning */}
      <div className="bg-red-50 rounded-xl p-5 border border-red-100 mb-10">
        <h2 className="font-semibold text-red-800 mb-2">Scam Warning: 3 Rules That Protect You</h2>
        <ul className="text-sm text-red-700 space-y-2">
          <li><strong>1. Never pay to start a job.</strong> Legitimate employers do not charge application fees, training fees, or starter kit costs.</li>
          <li><strong>2. If the salary sounds too good to be true, it is.</strong> "Earn £5,000/month from home with no skills" is a scam, every single time.</li>
          <li><strong>3. Research the company.</strong> Check Companies House, read Glassdoor reviews, and verify the company exists before sharing personal details.</li>
        </ul>
      </div>

      {/* CTA 1 - Style A */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">You have more skills than "no experience" suggests</div>
          <div className="text-sm text-gray-500">
            Even without formal work experience, you have life skills employers value. Our AI finds them and matches you to roles.
          </div>
        </div>
        <Link
          href="/discover"
          className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap"
        >
          Analyse My Skills Free
        </Link>
      </div>

      {/* Job Listings */}
      <section className="mb-12">
        <div className="space-y-5">
          {JOBS.map((job, idx) => (
            <div key={job.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                </div>
                {job.genuinelyRemote && (
                  <div className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs font-medium mb-3">
                    100% remote
                  </div>
                )}
                <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-green-700 mb-1">Why no experience is needed</div>
                    <p className="text-xs text-green-800">{job.whyNoExperience}</p>
                  </div>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <div className="text-xs font-semibold text-amber-700 mb-1">How to start</div>
                    <p className="text-xs text-amber-800">{job.howToStart}</p>
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-red-700 mb-1">Watch out for</div>
                  <p className="text-xs text-red-800">{job.watchOut}</p>
                </div>
              </div>

              {idx === 4 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">Even "no experience" is not quite true</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Organising your life, communicating with people, solving daily problems: these are all transferable skills. Our AI identifies yours and maps them to careers.
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                  >
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 9 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">76% of UK employers now prioritise skills over formal qualifications.</span> The "experience required" barrier is shrinking fast.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
                      See what roles match your existing skills
                    </Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Building Experience */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Building Experience From Zero
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Volunteer remotely</h3>
            <p className="text-sm text-gray-600">Offer your time to charities who need admin, social media, or data entry help. This builds genuine experience you can reference in applications.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Take free certifications</h3>
            <p className="text-sm text-gray-600">Google, HubSpot, and Meta offer free professional certifications. They cost nothing and give you something concrete to list on your CV.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Start a side project</h3>
            <p className="text-sm text-gray-600">A blog, social media account, or small eBay shop proves initiative and builds practical skills employers value.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Use temp agencies</h3>
            <p className="text-sm text-gray-600">Reed, Hays, and Office Angels have temporary remote roles that do not require experience. These can become permanent positions.</p>
          </div>
        </div>
      </section>

      {/* Simple text CTA */}
      <p className="text-gray-600 mb-10">
        Ready to see what you qualify for right now?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your details and get matched to careers in 2 minutes &rarr;
        </Link>
      </p>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Start your remote career today
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Tell us about yourself and we will match you to entry-level remote roles that fit your skills. Free. No experience needed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/discover"
            className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Discover My Career Matches
          </Link>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors"
          >
            Take the Career Quiz
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/work-from-home-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">Work From Home Jobs</Link>
          <span className="text-gray-300">|</span>
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs No Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/best-side-hustles-uk" className="text-sm text-indigo-600 hover:text-indigo-700">Best Side Hustles UK</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
        </div>
      </div>
    </div>
  );
}
