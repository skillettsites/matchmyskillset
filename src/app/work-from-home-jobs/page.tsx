import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "20+ Work From Home Jobs UK (2026) | Remote & Flexible Careers",
  description:
    "Discover 20+ genuine work from home jobs in the UK for 2026. Fully remote, hybrid, and flexible careers with salary ranges. No scams, just real opportunities.",
  keywords: [
    "work from home jobs UK",
    "remote jobs UK",
    "WFH careers",
    "flexible working jobs",
    "remote work UK 2026",
    "best remote jobs",
  ],
  openGraph: {
    title: "20+ Work From Home Jobs UK (2026)",
    description: "Genuine remote and flexible careers with salary ranges. Fully remote, hybrid, and flexible hour options.",
    type: "article",
  },
};

interface RemoteJob {
  title: string;
  salary: string;
  category: string;
  remoteLevel: string;
  description: string;
  whyRemote: string;
  gettingStarted: string;
}

const JOBS: RemoteJob[] = [
  // Fully Remote
  { title: "Software Developer", salary: "£30,000 - £75,000", category: "Fully Remote", remoteLevel: "100% remote common", description: "Build websites, applications, and software products. The tech industry led the remote work revolution, and most development roles now offer full remote as standard.", whyRemote: "Code can be written anywhere. Git, Slack, and video calls replace the office. Many companies are remote-first.", gettingStarted: "Bootcamp or self-taught route. Portfolio matters more than location. Apply to remote-first companies like GitLab, Automattic, or Zapier." },
  { title: "Content Writer / Copywriter", salary: "£22,000 - £50,000", category: "Fully Remote", remoteLevel: "100% remote common", description: "Write blog posts, website copy, marketing emails, and social media content for businesses. One of the most accessible remote careers with huge freelance potential.", whyRemote: "Writing is inherently solo work. Briefs arrive by email, work is delivered digitally. No physical presence needed.", gettingStarted: "Build a portfolio, start freelancing on platforms like Upwork, then pitch agencies and businesses directly." },
  { title: "Virtual Assistant", salary: "£18,000 - £35,000", category: "Fully Remote", remoteLevel: "100% remote", description: "Provide remote administrative support to businesses and executives. Manage diaries, emails, travel, and projects from your home office.", whyRemote: "All tools are cloud-based: Google Workspace, Slack, Zoom. Your clients may be anywhere in the world.", gettingStarted: "List on Time Etc or Virtalent. Offer a niche (e.g., social media VA, bookkeeping VA) to command higher rates." },
  { title: "UX/UI Designer", salary: "£30,000 - £65,000", category: "Fully Remote", remoteLevel: "100% remote common", description: "Design digital products that users love. Figma and other design tools are inherently collaborative and cloud-based.", whyRemote: "Design work happens in Figma. User testing is conducted via Zoom. The entire workflow is digital.", gettingStarted: "Learn Figma (free). Complete a UX bootcamp or Google UX Design Certificate. Build case studies." },
  { title: "Data Analyst", salary: "£25,000 - £55,000", category: "Fully Remote", remoteLevel: "90% remote", description: "Analyse business data, build dashboards, and present insights. SQL, Python, and visualisation tools are your daily companions.", whyRemote: "Data lives in the cloud. Analysis, reporting, and dashboards are all digital. Meetings are for presenting findings.", gettingStarted: "Google Data Analytics Certificate, then apply to remote-friendly analytics teams." },
  { title: "SEO Specialist", salary: "£25,000 - £55,000", category: "Fully Remote", remoteLevel: "95% remote", description: "Optimise websites for search engines. Keyword research, technical audits, content strategy, and link building. All done from a laptop.", whyRemote: "Every tool is online: Ahrefs, SEMrush, Google Search Console. Clients rarely need in-person meetings.", gettingStarted: "Self-taught through blogs and free courses. Google certifications. Start by optimising your own site." },
  { title: "Customer Success Manager", salary: "£30,000 - £60,000", category: "Fully Remote", remoteLevel: "85% remote", description: "Help SaaS clients achieve their goals with a product. Build relationships, reduce churn, and identify upsell opportunities.", whyRemote: "Client calls happen on Zoom. CRM updates happen in the cloud. Most SaaS companies are remote-friendly.", gettingStarted: "Previous customer service or account management experience. Apply to SaaS companies hiring remote CSMs." },
  // Hybrid
  { title: "Project Manager", salary: "£32,000 - £70,000", category: "Hybrid", remoteLevel: "2-3 days office", description: "Plan and deliver projects on time and budget. While some in-person collaboration helps, most PM work is digital: Jira, Asana, Slack, and video calls.", whyRemote: "Project planning, tracking, and reporting are all digital. Stand-ups work fine on Zoom. Many PMs are hybrid.", gettingStarted: "PRINCE2 or APM certification. Apply specifying hybrid preference. Most employers now expect to offer it." },
  { title: "Marketing Manager", salary: "£30,000 - £60,000", category: "Hybrid", remoteLevel: "2-3 days office", description: "Plan and execute marketing campaigns across digital and traditional channels. Strategy meetings benefit from in-person time, but execution is digital.", whyRemote: "Campaign management, analytics, content creation, and social media are all done digitally.", gettingStarted: "Build experience across digital channels. CIM qualification or Google/HubSpot certifications." },
  { title: "HR Business Partner", salary: "£35,000 - £65,000", category: "Hybrid", remoteLevel: "2-3 days office", description: "Support business leaders with people strategies. Employee relations, talent development, and workforce planning. In-person presence matters for sensitive conversations.", whyRemote: "Policy writing, data analysis, and planning work well remotely. Sensitive employee matters are often in person.", gettingStarted: "CIPD qualification (Level 5 or 7). Previous HR experience. Most large employers offer hybrid HR roles." },
  { title: "Accountant", salary: "£25,000 - £60,000", category: "Hybrid", remoteLevel: "2-3 days office", description: "Prepare accounts, tax returns, and financial reports. Cloud accounting software means most work can be done remotely.", whyRemote: "Xero, QuickBooks, and Sage are all cloud-based. Client meetings can be virtual. Audit work may require site visits.", gettingStarted: "AAT, then ACCA or CIMA qualification. Many firms offer hybrid working as standard." },
  { title: "Business Analyst", salary: "£30,000 - £60,000", category: "Hybrid", remoteLevel: "2-3 days office", description: "Bridge the gap between business needs and technology solutions. Requirements workshops benefit from in-person sessions, but analysis work is remote-friendly.", whyRemote: "Process mapping, documentation, and analysis are digital. Stakeholder workshops can be hybrid.", gettingStarted: "BCS or IIBA certification. Apply to tech companies or consultancies with hybrid policies." },
  { title: "Graphic Designer", salary: "£22,000 - £50,000", category: "Hybrid", remoteLevel: "Freelance: 100% remote", description: "Create visual content for brands. In-house roles often offer hybrid; freelance designers work fully remotely.", whyRemote: "Adobe Creative Suite and Figma are digital tools. Briefs and feedback are exchanged online.", gettingStarted: "Strong portfolio. Learn Adobe suite and Figma. Freelance platforms or agency roles." },
  // Flexible Hours
  { title: "Freelance Web Developer", salary: "£30,000 - £80,000+", category: "Flexible Hours", remoteLevel: "Set your own schedule", description: "Build websites for clients on your own terms. Choose your hours, your clients, and your rates. The most flexible option on this list.", whyRemote: "You control everything: when you work, where you work, and who you work with.", gettingStarted: "Learn React/Next.js or WordPress. Build portfolio sites. Use Upwork initially, then build direct client relationships." },
  { title: "Online Tutor", salary: "£20,000 - £50,000", category: "Flexible Hours", remoteLevel: "100% remote, flexible", description: "Teach students via video call. Set your own hours and specialise in subjects you know. Evening and weekend slots are often the most popular.", whyRemote: "Zoom, Skype, or dedicated tutoring platforms. Whiteboard tools replace the classroom.", gettingStarted: "Register on Tutorful, MyTutor, or Superprof. Set your rates. Build reviews." },
  { title: "Social Media Manager", salary: "£22,000 - £45,000", category: "Flexible Hours", remoteLevel: "Mostly remote, some flexibility", description: "Manage social media accounts for businesses. Schedule posts, engage with audiences, and track performance. Increasingly done by freelancers.", whyRemote: "Social media is managed through scheduling tools. Content creation and analytics are digital.", gettingStarted: "Build your own social media presence first. Offer services to local businesses. Scale from there." },
  { title: "Transcriptionist", salary: "£18,000 - £30,000", category: "Flexible Hours", remoteLevel: "100% remote, flexible", description: "Convert audio and video recordings into written text. Medical and legal transcription pay the most. Work as many or as few hours as you choose.", whyRemote: "Audio files are delivered digitally. Transcripts are returned digitally. No location requirement.", gettingStarted: "Practice with free audio files. Register on TranscribeMe or Rev. Specialise in medical or legal for higher rates." },
  { title: "E-commerce Store Owner", salary: "Variable (£10,000 - £100,000+)", category: "Flexible Hours", remoteLevel: "100% remote, your own boss", description: "Sell products online through Shopify, Etsy, or Amazon. Dropshipping, print-on-demand, or your own products. Build a business from your laptop.", whyRemote: "The entire business runs online: sourcing, listing, marketing, and fulfilment.", gettingStarted: "Start on Etsy or Shopify. Test products with small investment. Scale what works." },
  { title: "Bookkeeper", salary: "£20,000 - £38,000", category: "Flexible Hours", remoteLevel: "100% remote possible", description: "Manage financial records for small businesses. Cloud accounting software means you never need to visit a client's office.", whyRemote: "Xero and QuickBooks are cloud-native. Bank feeds, invoicing, and reporting are all digital.", gettingStarted: "IAB or ICB bookkeeping qualification. Register with Xero/QuickBooks as a partner. Market to local small businesses." },
  { title: "Therapy / Counselling", salary: "£25,000 - £50,000", category: "Flexible Hours", remoteLevel: "Online sessions increasingly common", description: "Provide therapeutic support via video call. The pandemic normalised online therapy, and many clients now prefer it to in-person sessions.", whyRemote: "Platforms like BetterHelp and BACP-registered online practices make remote therapy accessible.", gettingStarted: "Counselling diploma or degree. BACP registration. Set up on an online therapy platform." },
];

const CATEGORIES = ["Fully Remote", "Hybrid", "Flexible Hours"] as const;

export default function WorkFromHomeJobsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "20+ Work From Home Jobs UK (2026)",
            description: "Genuine remote and flexible careers in the UK with salary ranges and entry routes.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}<span className="text-gray-600">Work From Home Jobs</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        20+ Work From Home Jobs in the UK (2026)
      </h1>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        Remote work is no longer a pandemic experiment. It is how millions of UK workers operate every day. According to the ONS, 44% of UK workers now work from home at least part of the time, and companies offering remote work receive 3x more applications than those that do not.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        But finding genuine remote jobs amid the noise of scams and clickbait is frustrating. This guide lists 20+ real careers that offer remote or flexible working in the UK, with honest salary ranges, how remote they actually are, and how to get started.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        We have organised them into three categories: fully remote (you never need to go to an office), hybrid (2-3 days from home), and flexible hours (you set your own schedule).
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">44%</div>
          <div className="text-xs text-gray-500">of UK workers WFH</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">3x</div>
          <div className="text-xs text-gray-500">More applications for remote roles</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">£4,800</div>
          <div className="text-xs text-gray-500">Avg annual commuting savings</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Find remote jobs that match YOUR skills</div>
          <div className="text-sm text-gray-500">Upload your CV and our AI will find remote-friendly careers that match your specific experience.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My CV Free
        </Link>
      </div>

      {/* Quick Nav */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-10">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">Jump to a section</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <a
              key={cat}
              href={`#${cat.toLowerCase().replace(/ /g, "-")}`}
              className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {cat}
            </a>
          ))}
        </div>
      </div>

      {/* Job Listings */}
      {CATEGORIES.map((category, catIdx) => {
        const categoryJobs = JOBS.filter((j) => j.category === category);
        return (
          <section key={category} id={category.toLowerCase().replace(/ /g, "-")} className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{category}</h2>
            <p className="text-sm text-gray-500 mb-6">
              {category === "Fully Remote" && "No office required. Work from anywhere in the UK (or sometimes, anywhere in the world)."}
              {category === "Hybrid" && "Typically 2-3 days in the office, with the rest from home. The most common pattern in UK workplaces."}
              {category === "Flexible Hours" && "Set your own schedule. Ideal for parents, carers, or anyone who wants control over their time."}
            </p>
            <div className="space-y-5">
              {categoryJobs.map((job) => (
                <div key={job.title} className="bg-white rounded-xl border border-gray-100 p-6">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{job.salary}</span>
                  </div>
                  <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                    {job.remoteLevel}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{job.description}</p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-green-700 mb-1">Why it works remotely</div>
                      <p className="text-xs text-green-800">{job.whyRemote}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-xs font-semibold text-amber-700 mb-1">Getting started</div>
                      <p className="text-xs text-amber-800">{job.gettingStarted}</p>
                    </div>
                  </div>
                  <Link
                    href={`/jobs?q=${encodeURIComponent(job.title)}`}
                    className="inline-block text-xs text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Search {job.title} jobs
                  </Link>
                </div>
              ))}
            </div>

            {/* Inline CTAs */}
            {catIdx === 0 && (
              <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-8">
                <h3 className="text-lg font-semibold mb-2">Your skills might be more remote-friendly than you think</h3>
                <p className="text-gray-300 text-sm mb-4">Many skills that seem office-bound translate perfectly to remote work. Our AI identifies your transferable skills and matches you to remote-friendly careers.</p>
                <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                  Discover Remote Matches
                </Link>
              </div>
            )}
            {catIdx === 1 && (
              <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-8">
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Remote work saves the average UK worker £4,800 per year in commuting costs.</span> That is before you factor in lunches, coffee, and work clothes. Explore careers that let you keep that money.{" "}
                  <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">Find your remote matches</Link>.
                </p>
              </div>
            )}
          </section>
        );
      })}

      {/* Remote Work Tips */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Finding Genuine Remote Jobs</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Use remote-specific job boards</h3>
            <p className="text-sm text-gray-600">RemoteOK, WeWorkRemotely, and FlexJobs specialise in remote roles. LinkedIn also lets you filter by "Remote" location. These are more reliable than general job boards.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Check the company's remote policy</h3>
            <p className="text-sm text-gray-600">Look for "remote-first" companies rather than "remote-allowed" ones. Remote-first means the entire company is built around distributed work. The difference in experience is massive.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Beware of scams</h3>
            <p className="text-sm text-gray-600">If a "remote job" asks you to pay upfront, buy a starter kit, or seems too good to be true, it probably is. Legitimate employers never charge you to work for them.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-semibold text-gray-900 mb-2">Highlight remote skills in your CV</h3>
            <p className="text-sm text-gray-600">Self-motivation, written communication, time management, and experience with collaboration tools (Slack, Zoom, Asana) are all worth mentioning explicitly.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Ready to find your remote career?
        </h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">
          Upload your CV or describe your experience and discover remote-friendly careers that match your skills. Free. 2 minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">
            Discover Remote Career Matches
          </Link>
          <Link href="/jobs-for-introverts" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">
            Jobs for Introverts
          </Link>
        </div>
      </section>

      {/* Related */}
      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
          <span className="text-gray-300">|</span>
          <Link href="/high-paying-jobs-no-degree" className="text-sm text-indigo-600 hover:text-indigo-700">High Paying Jobs Without a Degree</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/quiz" className="text-sm text-indigo-600 hover:text-indigo-700">Career Quiz</Link>
        </div>
      </div>
    </div>
  );
}
