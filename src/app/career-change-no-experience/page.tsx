import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change With No Experience: How Transferable Skills Fill the Gap",
  description:
    "Changing careers with no direct experience? Your transferable skills are more valuable than you think. Practical guide with industries that welcome career changers and steps to transition.",
  keywords: [
    "career change with no experience",
    "how to change career with no qualifications",
    "entry level career change",
    "career change no experience UK",
    "switching careers with no skills",
    "change career without experience",
  ],
  openGraph: {
    title: "Career Change With No Experience: A Practical Guide",
    description: "Your transferable skills fill the experience gap. Industries, strategies, and practical steps for career changers.",
    type: "article",
  },
};

export default function CareerChangeNoExperiencePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Can I change career with no experience in a new field?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes. Most career changers succeed by leveraging transferable skills from their current role. Communication, problem solving, project management, and stakeholder management are valuable in every industry. The key is reframing your experience to show how it maps to your target role's requirements.",
                },
              },
              {
                "@type": "Question",
                name: "What jobs are easiest to switch to with no experience?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Roles that prioritise soft skills and trainable technical skills are the easiest to switch into. Customer Success Manager, Recruitment Consultant, Project Manager, Business Development, and Digital Marketing are all popular entry points for career changers with no direct industry experience.",
                },
              },
              {
                "@type": "Question",
                name: "How do I get a job with no relevant experience?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Focus on three things: (1) identify and articulate your transferable skills, (2) close any gaps with short courses or certifications rather than full degrees, and (3) use a skills-based CV format that leads with what you can do rather than where you have worked.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to go back to university to change careers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Almost certainly not. Most career transitions require a short professional certification (weeks or months, not years) plus evidence of practical ability. Bootcamps, online courses, and portfolio projects are more relevant for career changers than full degrees.",
                },
              },
            ],
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/career-change" className="hover:text-indigo-600">Career Change</Link>
        {" / "}<span className="text-gray-600">Career Change With No Experience</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        How to Change Career With No Experience in Your Target Field
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>11 min read</span>
      </div>

      {/* Intro */}
      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Here is the uncomfortable truth about "entry level" job postings: most of them ask for 2-3 years of experience. If you are changing careers, that feels like a Catch-22. You need experience to get the job, but you need the job to get the experience.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The good news? This barrier is largely an illusion. Employers list "ideal" requirements, not hard minimums. Research from LinkedIn shows that women typically apply for jobs only when they meet 100% of the requirements, while men apply at 60%. The actual hiring bar is almost always lower than the job posting suggests.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        More importantly, you are not starting from zero. Whatever you have done before, whether it is teaching, retail, nursing, admin, or raising a family, has built genuine, transferable, marketable skills. This guide shows you how to identify them, reframe them, and land a role in a field where you have zero direct experience.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">76%</div>
          <div className="text-xs text-gray-500">of employers prioritise skills over qualifications</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">60%</div>
          <div className="text-xs text-gray-500">Match is enough to apply</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">88%</div>
          <div className="text-xs text-gray-500">CVs filtered by ATS systems</div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">33%</div>
          <div className="text-xs text-gray-500">of UK workers want a career change</div>
        </div>
      </div>

      {/* Section 1 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          You have more experience than you think
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          When you say "I have no experience," what you actually mean is "I have no experience with the job title I want." But job titles are not skills. A Customer Success Manager needs empathy, communication, problem solving, and relationship management. A retail worker, a nurse, and a teacher all have these skills in abundance.
        </p>
        <p className="text-gray-600 leading-relaxed mb-6">
          The real challenge is not that you lack skills. It is that you have not learned to describe your skills in the language your target industry uses. Our AI does this translation automatically when you upload your CV, but here is how to do it manually:
        </p>

        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Skill translation examples</h3>
          <div className="space-y-3 text-sm">
            {[
              { old: "I managed a classroom of 30 students", new: "Stakeholder management, team coordination, programme delivery" },
              { old: "I worked on the shop floor in retail", new: "Customer engagement, sales, problem solving under pressure, inventory management" },
              { old: "I organised my children's activities", new: "Project management, scheduling, budget management, logistics coordination" },
              { old: "I dealt with patient complaints", new: "Conflict resolution, empathy, active listening, process improvement" },
              { old: "I processed invoices and expenses", new: "Financial administration, attention to detail, compliance, system management" },
              { old: "I trained new joiners", new: "Learning and development, coaching, communication, programme design" },
            ].map((t) => (
              <div key={t.old} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <span className="text-gray-400 line-through flex-1">{t.old}</span>
                <span className="text-gray-300 hidden sm:inline">to</span>
                <span className="text-green-700 font-medium flex-1">{t.new}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Not sure how to translate your experience?</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will automatically identify and reframe every transferable skill for your target industry.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My CV Free
        </Link>
      </div>

      {/* Section 2 - Industries that welcome career changers */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Industries that actively welcome career changers
        </h2>
        <p className="text-gray-600 leading-relaxed mb-6">
          Not all industries are equally open to career changers. These sectors actively recruit people without direct experience because they value transferable skills, train on the job, or face skills shortages that make them less selective about backgrounds.
        </p>

        <div className="space-y-5">
          {[
            {
              title: "Technology",
              openness: "Very High",
              why: "The tech industry has a massive skills shortage and a culture of self-taught talent. Google, Apple, and many others have removed degree requirements. Bootcamp graduates regularly land roles alongside computer science graduates.",
              roles: ["Software Developer", "Data Analyst", "UX Designer", "Digital Marketing", "Cybersecurity Analyst", "Product Manager"],
              timeToTransition: "3-12 months",
            },
            {
              title: "Recruitment",
              openness: "Very High",
              why: "Recruitment agencies actively hire career changers because the skills that matter (persuasion, resilience, relationship building, work ethic) cannot be taught. They prefer to train the technical aspects themselves.",
              roles: ["Recruitment Consultant", "Talent Acquisition", "HR Coordinator"],
              timeToTransition: "Immediate (training on the job)",
            },
            {
              title: "Sales & Business Development",
              openness: "High",
              why: "Sales is results-driven. If you can sell, nobody cares where you learned. Your track record matters infinitely more than your qualifications. Many salespeople come from retail, hospitality, or completely unrelated fields.",
              roles: ["Business Development Manager", "Account Executive", "Sales Development Representative"],
              timeToTransition: "1-3 months",
            },
            {
              title: "Customer Success",
              openness: "High",
              why: "SaaS companies are growing rapidly and need people who understand customers. Anyone with strong communication skills and empathy is a competitive candidate. Tech-specific knowledge is trained on the job.",
              roles: ["Customer Success Manager", "Implementation Specialist", "Technical Support"],
              timeToTransition: "1-3 months",
            },
            {
              title: "Project Management",
              openness: "High",
              why: "Project management skills are developed in every profession: teaching, construction, nursing, military, even parenting. A PRINCE2 or APM certification formalises what you already know.",
              roles: ["Junior Project Manager", "Project Coordinator", "Scrum Master"],
              timeToTransition: "1-6 months",
            },
            {
              title: "Learning & Development",
              openness: "High",
              why: "L&D teams value people who can design learning experiences and engage audiences. Teachers, trainers, and presenters have these skills by default. Corporate L&D is one of the most natural transitions from education.",
              roles: ["L&D Coordinator", "Instructional Designer", "Training Manager"],
              timeToTransition: "2-6 months",
            },
          ].map((industry) => (
            <div key={industry.title} className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{industry.title}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded flex-shrink-0 ml-4 ${
                  industry.openness === "Very High" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}>
                  Openness: {industry.openness}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{industry.why}</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {industry.roles.map((role) => (
                  <Link
                    key={role}
                    href={`/jobs?q=${encodeURIComponent(role)}`}
                    className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs hover:bg-indigo-100 transition-colors"
                  >
                    {role}
                  </Link>
                ))}
              </div>
              <span className="text-xs text-gray-400">Typical transition time: {industry.timeToTransition}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 2 - Dark */}
      <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
        <h3 className="text-lg font-semibold mb-2">"No experience" is rarely the real barrier</h3>
        <p className="text-gray-300 text-sm mb-4">The real barrier is not knowing which of your existing skills matter to employers. Our AI identifies every transferable skill in your CV and matches them to careers, even ones you have never heard of.</p>
        <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Find My Career Matches
        </Link>
      </div>

      {/* Section 3 - Practical strategies */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          7 strategies to land a role without direct experience
        </h2>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">1.</span>Use a skills-based CV format
            </h3>
            <p className="text-sm text-gray-600">Instead of listing jobs chronologically, lead with a skills summary that maps directly to the role requirements. Group your experience under skill headings (Communication, Project Management, Analysis) rather than employer names. Read our <Link href="/career-change/career-change-cv" className="text-indigo-600 hover:text-indigo-700 font-medium">career change CV guide</Link>.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">2.</span>Get a quick-win certification
            </h3>
            <p className="text-sm text-gray-600">A relevant certification shows commitment and closes the biggest perception gap. Google certificates (6 months), HubSpot Academy (free), PRINCE2 (1 week), and CompTIA certifications are all respected and fast. Pick the one that is most relevant to your target role.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">3.</span>Build evidence through side projects
            </h3>
            <p className="text-sm text-gray-600">Want to be a data analyst? Analyse a public dataset and publish the results. Want to be a UX designer? Redesign a real app and write up a case study. Want to be a copywriter? Write spec ads for brands you admire. Side projects prove ability more convincingly than any certificate.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">4.</span>Volunteer or freelance for experience
            </h3>
            <p className="text-sm text-gray-600">Charities, startups, and small businesses often need help they cannot afford to hire for. Offer your services for free or at a reduced rate. Even 4-8 weeks of freelance experience in your target field dramatically strengthens your CV.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">5.</span>Target "bridge" roles that get you in the door
            </h3>
            <p className="text-sm text-gray-600">You do not need to land your dream role immediately. A "bridge" role gets you into the right industry. An admin role at a tech company, a sales role at a recruitment agency, or a coordinator role in project management. Once inside, lateral moves are much easier.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">6.</span>Network through informational interviews
            </h3>
            <p className="text-sm text-gray-600">Reach out to 5-10 people on LinkedIn who work in your target role. Ask them: "How did you get into this role? What skills matter most? What would you recommend for someone transitioning?" Most people are happy to share. These conversations also build your network for when you start applying.</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              <span className="text-indigo-600 mr-2">7.</span>Write a "bridge" cover letter
            </h3>
            <p className="text-sm text-gray-600">Address the career change directly. Do not hide it; own it. "I am transitioning from [old field] to [new field] because [genuine reason]. My experience in [skill X] and [skill Y] maps directly to this role's requirements. Here is how..." Honesty and confidence work better than trying to disguise a career change.</p>
          </div>
        </div>
      </section>

      {/* CTA 3 - Inline */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mb-10">
        <p className="text-gray-700 text-sm">
          <span className="font-semibold">The biggest mistake career changers make</span> is underselling themselves. You have genuine, valuable skills that employers are actively looking for. Our AI identifies skills you have overlooked and matches them to careers you have not considered.{" "}
          <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Try it free</Link>.
        </p>
      </div>

      {/* Section 4 - Common myths */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Myths about career change without experience
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-2">Myth: You need a degree in the new field</h3>
            <p className="text-sm text-gray-600">Reality: 76% of UK employers now prioritise skills over qualifications. Short certifications and demonstrable ability matter more than degrees for career changers.</p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-2">Myth: You will start at the bottom again</h3>
            <p className="text-sm text-gray-600">Reality: Your transferable skills mean you rarely start at entry level. A teacher moving to L&D enters at a mid-level position, not as a graduate trainee.</p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-2">Myth: Career changers are seen as flight risks</h3>
            <p className="text-sm text-gray-600">Reality: Employers value career changers for their diverse perspectives and fresh thinking. Companies like Google actively seek people from non-traditional backgrounds.</p>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-100">
            <h3 className="font-semibold text-red-800 mb-2">Myth: It takes years to transition</h3>
            <p className="text-sm text-gray-600">Reality: Most successful career changes happen within 3-9 months. Some transitions (retail to recruitment, for example) can happen in weeks.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Your experience is more valuable than you realise
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe what you have done. Our AI will find the transferable skills hiding in your experience and match them to careers you never knew existed. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Discover My Career Matches
          </Link>
          <Link href="/quiz" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">
            Take the Career Quiz
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Can I change career with no experience?</h3>
            <p className="text-sm text-gray-600">Yes. Focus on your transferable skills, get a quick-win certification, and build evidence through side projects. Most career changers succeed without starting from scratch.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">What is the easiest career change to make?</h3>
            <p className="text-sm text-gray-600">The easiest transitions leverage the most overlap between your existing skills and the target role. Recruitment, sales, customer success, and project management are common first transitions because they value people skills above all else.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">How do I explain a career change on my CV?</h3>
            <p className="text-sm text-gray-600">Use a skills-based format. Lead with your relevant transferable skills, then provide evidence. Address the change directly in your cover letter. Confidence and clarity work better than trying to disguise the transition.</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Do I need to go back to university?</h3>
            <p className="text-sm text-gray-600">Almost certainly not. Professional certifications (weeks or months) and practical evidence (portfolios, projects, freelance work) are more relevant and more valued by employers for career changers. See our <Link href="/high-paying-jobs-no-degree" className="text-indigo-600 hover:text-indigo-700 font-medium">guide to high-paying jobs without a degree</Link>.</p>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change/transferable-skills-guide" className="text-sm text-indigo-600 hover:text-indigo-700">Transferable Skills Guide</Link>
          <span className="text-gray-300">|</span>
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs Without a Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change by Profession</Link>
        </div>
      </div>
    </div>
  );
}
