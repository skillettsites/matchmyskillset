import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Change From Nursing UK (2026) | Jobs for Ex-Nurses",
  description:
    "Leaving nursing? 12 careers for ex-nurses in the UK with salary data and transition timelines. Your clinical skills are worth more outside the NHS than you realise.",
  keywords: [
    "leaving nursing UK",
    "career change from nursing",
    "jobs for ex nurses",
    "nurse career change",
    "quitting nursing UK",
    "what can nurses do instead",
  ],
  openGraph: {
    title: "Career Change From Nursing UK (2026)",
    description: "12 careers for ex-nurses. Your clinical skills transfer to higher-paying roles outside healthcare.",
    type: "article",
  },
};

export default function CareerChangeFromNursingPage() {
  const careers = [
    { title: "Clinical Research Associate", salary: "£30,000 - £55,000", transition: "2-4 months", description: "Manage clinical trials for pharmaceutical and biotech companies. Your understanding of clinical protocols, patient care, and medical terminology gives you an immediate advantage.", howToGet: "GCP (Good Clinical Practice) certification. Apply to CROs like IQVIA, Parexel, or PPD. Your nursing registration is highly valued." },
    { title: "Health & Safety Manager", salary: "£35,000 - £55,000", transition: "3-6 months", description: "Ensure workplace safety compliance in any industry. Nurses understand risk assessment, incident management, and regulatory compliance at an instinctive level.", howToGet: "NEBOSH General Certificate (3-6 months). Your clinical risk management experience is directly relevant." },
    { title: "Medical Sales Representative", salary: "£30,000 - £65,000+ (OTE)", transition: "1-3 months", description: "Sell medical devices, pharmaceuticals, or healthcare technology to NHS trusts and private clinics. Your clinical credibility opens doors that non-clinical salespeople cannot.", howToGet: "Apply directly to medical device or pharma companies. Your nursing knowledge is the qualification they want." },
    { title: "Health Insurance Assessor", salary: "£28,000 - £45,000", transition: "1-2 months", description: "Assess insurance claims using your medical knowledge. Desk-based, regular hours, no night shifts. Your clinical judgement is exactly what insurers need.", howToGet: "Apply to Bupa, AXA Health, or Vitality. NMC registration and clinical experience are the primary requirements." },
    { title: "Occupational Health Nurse", salary: "£32,000 - £48,000", transition: "1-2 months", description: "Still nursing, but with regular hours, no nights, weekends, or emergencies. Support employee health in corporate settings. A bridge role for those who enjoy nursing but not the NHS conditions.", howToGet: "Apply to OH providers (Medigold Health, PAM Group). Specialist Practitioner Qualification in OH nursing is beneficial but not always required to start." },
    { title: "Pharmaceutical / Medical Writer", salary: "£30,000 - £55,000", transition: "2-4 months", description: "Write clinical documents, patient information leaflets, regulatory submissions, and medical education content. Your ability to translate complex clinical information into clear language is the core skill.", howToGet: "AMWA or EMWA medical writing courses. Build sample work. Target CROs, pharma companies, or medical communications agencies." },
    { title: "Care Quality Commission (CQC) Inspector", salary: "£35,000 - £48,000", transition: "1-3 months", description: "Inspect and regulate health and social care services. Your frontline experience gives you authentic insight into care quality that desk-based candidates lack.", howToGet: "Apply directly at CQC careers. Nursing qualification and experience are highly valued. Regular hours and no clinical pressure." },
    { title: "Nurse Educator / Practice Development", salary: "£33,000 - £50,000", transition: "1-2 months", description: "Train the next generation of nurses or develop clinical practice within healthcare organisations. Still connected to nursing, but without the ward-based pressure.", howToGet: "Teaching qualification (PGCert, ENB 998) is beneficial. Apply to universities or hospital education departments." },
    { title: "Charity / Healthcare Programme Manager", salary: "£28,000 - £48,000", transition: "1-3 months", description: "Manage health-related programmes for charities like Macmillan, Marie Curie, or the British Heart Foundation. Apply your clinical knowledge to improving health outcomes at a population level.", howToGet: "Search CharityJob and Third Sector Jobs. Your clinical background is often a specific requirement." },
    { title: "Corporate Wellness Coordinator", salary: "£28,000 - £45,000", transition: "1-3 months", description: "Design and manage employee wellbeing programmes for large companies. Regular hours, creative work, and the satisfaction of improving people's health without the acute pressure.", howToGet: "CIPD or wellbeing-specific qualifications are helpful. Your clinical credibility gives you authority that non-clinical wellness coordinators lack." },
    { title: "Legal Nurse Consultant", salary: "£35,000 - £60,000", transition: "3-6 months", description: "Provide medical expertise to law firms handling clinical negligence, personal injury, or medical malpractice cases. Your clinical knowledge is essential for evaluating claims.", howToGet: "Legal nurse consulting certification (available online). Target clinical negligence law firms. Can be done freelance." },
    { title: "Project Manager (Healthcare)", salary: "£32,000 - £58,000", transition: "2-4 months", description: "Manage healthcare transformation projects within the NHS or private sector. Your understanding of clinical workflows means you can lead projects that pure project managers struggle to grasp.", howToGet: "PRINCE2 Foundation certification (1 week). Target NHS improvement teams or healthcare consulting firms." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "Career Change From Nursing UK (2026)",
            description: "Guide for UK nurses exploring career changes with 12 realistic options and transition timelines.",
            author: { "@type": "Organization", name: "MatchMySkillset" },
            publisher: { "@type": "Organization", name: "MatchMySkillset", url: "https://matchmyskillset.com" },
            datePublished: "2026-04-01",
            dateModified: "2026-04-01",
          }),
        }}
      />

      <div className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-indigo-600">Home</Link>
        {" / "}
        <Link href="/careers-for" className="hover:text-indigo-600">Career Change</Link>
        {" / "}<span className="text-gray-600">From Nursing</span>
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
        Career Change From Nursing: What Ex-Nurses Actually Do
      </h1>

      <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
        <span>Updated April 2026</span>
        <span>|</span>
        <span>12 min read</span>
      </div>

      <p className="text-lg text-gray-600 leading-relaxed mb-4">
        The NHS is haemorrhaging nurses. The RCN reports that one in three nurses is considering leaving the profession, with burnout, unsafe staffing levels, and pay erosion cited as the primary drivers. If you are thinking about leaving, you are part of a national trend, not an outlier.
      </p>
      <p className="text-gray-600 leading-relaxed mb-4">
        The good news: nursing equips you with some of the most transferable skills in any profession. Clinical decision-making under pressure, empathy, complex documentation, team leadership, and the ability to function calmly when everything around you is chaotic. These skills are in enormous demand outside healthcare.
      </p>
      <p className="text-gray-600 leading-relaxed mb-10">
        This guide covers 12 careers where your nursing skills command respect (and often better pay), how to translate your clinical experience into corporate language, and realistic timelines for each transition.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-600">1 in 3</div>
          <div className="text-xs text-gray-500">Nurses considering leaving</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">£65k+</div>
          <div className="text-xs text-gray-500">Top salary potential</div>
        </div>
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600">12</div>
          <div className="text-xs text-gray-500">Careers listed here</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">1-6</div>
          <div className="text-xs text-gray-500">Months to transition</div>
        </div>
      </div>

      {/* CTA 1 */}
      <div className="bg-indigo-50 rounded-xl p-5 mb-10 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <div className="font-semibold text-gray-900">Your clinical skills are worth more than Band 5 pay</div>
          <div className="text-sm text-gray-500">Upload your CV and see which roles value your nursing experience at higher salary ranges.</div>
        </div>
        <Link href="/discover" className="bg-indigo-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap">
          Analyse My Skills Free
        </Link>
      </div>

      {/* Skills Translation */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Translating your nursing skills</h2>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ["Clinical assessment", "Risk assessment / diagnostic analysis"],
              ["Patient handover", "Stakeholder communication / briefings"],
              ["Care planning", "Project planning / programme design"],
              ["Drug administration", "Quality assurance / protocol compliance"],
              ["MDT meetings", "Cross-functional team collaboration"],
              ["Incident reporting", "Compliance / governance documentation"],
              ["Triage decisions", "Prioritisation / critical decision-making"],
              ["Patient advocacy", "Client relationship management"],
            ].map(([nursing, corporate]) => (
              <div key={nursing} className="flex items-center gap-2 py-1">
                <span className="text-gray-500">{nursing}</span>
                <span className="text-gray-400">&rarr;</span>
                <span className="font-medium text-indigo-600">{corporate}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career Listings */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">12 Careers for Ex-Nurses</h2>
        <div className="space-y-5">
          {careers.map((career, idx) => (
            <div key={career.title}>
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{career.title}</h3>
                  <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.salary}</span>
                </div>
                <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium mb-3">
                  Transition: {career.transition}
                </div>
                <p className="text-sm text-gray-600 mb-3">{career.description}</p>
                <div>
                  <span className="text-xs font-semibold text-gray-500">How to get there</span>
                  <p className="text-sm text-gray-600 mt-1">{career.howToGet}</p>
                </div>
              </div>

              {idx === 3 && (
                <div className="bg-gray-900 text-white rounded-xl p-6 text-center mt-5">
                  <h3 className="text-lg font-semibold mb-2">You kept people alive. You can handle any career.</h3>
                  <p className="text-gray-300 text-sm mb-4">Our AI maps your clinical experience to roles where your skills are valued, not taken for granted.</p>
                  <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                    Get My Personalised Matches
                  </Link>
                </div>
              )}

              {idx === 8 && (
                <div className="border-l-4 border-indigo-600 bg-indigo-50 rounded-r-xl p-5 mt-5">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Ex-nurses moving into clinical research or medical sales typically earn £10,000-£25,000 more than their NHS salary</span> with significantly better work-life balance.{" "}
                    <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">See your matches</Link>.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <p className="text-gray-600 mb-10">
        Ready to explore life beyond the ward?{" "}
        <Link href="/discover" className="text-indigo-600 font-medium hover:text-indigo-700">
          Upload your CV and see your career matches in 2 minutes &rarr;
        </Link>
      </p>

      <section className="bg-indigo-50 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Your nursing career built extraordinary skills</h2>
        <p className="text-gray-500 mb-6 max-w-lg mx-auto">Upload your CV and discover which careers value your clinical expertise the most. Free. 2 minutes.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/discover" className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors">Discover My Career Matches</Link>
          <Link href="/careers-for/nurses" className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-white transition-colors">Full Nurses Guide</Link>
        </div>
      </section>

      <div className="pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/career-change-from-teaching" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change From Teaching</Link>
          <span className="text-gray-300">|</span>
          <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
          <span className="text-gray-300">|</span>
          <Link href="/jobs-for-empaths" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Empaths</Link>
          <span className="text-gray-300">|</span>
          <Link href="/careers-for/nurses" className="text-sm text-indigo-600 hover:text-indigo-700">Careers for Nurses</Link>
        </div>
      </div>
    </div>
  );
}
