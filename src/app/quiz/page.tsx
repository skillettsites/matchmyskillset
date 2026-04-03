"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Quiz Data ─── */
interface Question {
  id: number;
  question: string;
  options: { label: string; traits: string[] }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "When you are working on something, which gives you the most energy?",
    options: [
      { label: "Solving a tricky problem nobody else can crack", traits: ["analytical", "technical"] },
      { label: "Helping someone achieve a breakthrough", traits: ["people", "coaching"] },
      { label: "Creating something new from scratch", traits: ["creative", "entrepreneurial"] },
      { label: "Organising chaos into a smooth system", traits: ["organised", "operational"] },
    ],
  },
  {
    id: 2,
    question: "How do you prefer to spend your working day?",
    options: [
      { label: "Deep focused work with minimal interruptions", traits: ["independent", "analytical"] },
      { label: "Collaborating with a team, bouncing ideas around", traits: ["people", "collaborative"] },
      { label: "A mix of meetings, calls, and solo tasks", traits: ["versatile", "operational"] },
      { label: "Out and about, meeting clients or visiting sites", traits: ["active", "sales"] },
    ],
  },
  {
    id: 3,
    question: "Which of these feels most natural to you?",
    options: [
      { label: "Analysing data and spotting patterns", traits: ["analytical", "technical"] },
      { label: "Persuading and negotiating with people", traits: ["sales", "leadership"] },
      { label: "Writing, designing, or storytelling", traits: ["creative", "communication"] },
      { label: "Planning, scheduling, and managing timelines", traits: ["organised", "operational"] },
    ],
  },
  {
    id: 4,
    question: "What matters most to you in a career?",
    options: [
      { label: "High salary and financial security", traits: ["ambitious", "sales"] },
      { label: "Making a genuine difference in people's lives", traits: ["people", "coaching"] },
      { label: "Creative freedom and variety", traits: ["creative", "entrepreneurial"] },
      { label: "Work-life balance and flexibility", traits: ["independent", "versatile"] },
    ],
  },
  {
    id: 5,
    question: "You are thrown into a crisis at work. What is your instinct?",
    options: [
      { label: "Gather data, analyse the root cause, then fix it", traits: ["analytical", "technical"] },
      { label: "Rally the team and delegate tasks fast", traits: ["leadership", "operational"] },
      { label: "Talk to everyone affected, calm things down", traits: ["people", "coaching"] },
      { label: "Find a creative workaround nobody else sees", traits: ["creative", "entrepreneurial"] },
    ],
  },
  {
    id: 6,
    question: "Which work environment appeals to you most?",
    options: [
      { label: "A quiet office or home setup with good tech", traits: ["independent", "technical"] },
      { label: "A buzzy open-plan office with lots of energy", traits: ["collaborative", "sales"] },
      { label: "A studio, workshop, or creative space", traits: ["creative", "active"] },
      { label: "Wherever the work takes me, I like variety", traits: ["versatile", "entrepreneurial"] },
    ],
  },
  {
    id: 7,
    question: "How do you feel about public speaking?",
    options: [
      { label: "Love it. Give me the stage.", traits: ["leadership", "sales", "communication"] },
      { label: "Fine in small groups, not my favourite for large crowds", traits: ["coaching", "collaborative"] },
      { label: "I would rather put my ideas in writing", traits: ["creative", "analytical"] },
      { label: "I prefer one-to-one conversations", traits: ["people", "independent"] },
    ],
  },
  {
    id: 8,
    question: "Which of these skills do other people compliment you on?",
    options: [
      { label: "Being detail-oriented and thorough", traits: ["analytical", "organised"] },
      { label: "Being a natural leader who inspires others", traits: ["leadership", "coaching"] },
      { label: "Coming up with ideas nobody else thinks of", traits: ["creative", "entrepreneurial"] },
      { label: "Being calm under pressure and reliable", traits: ["operational", "versatile"] },
    ],
  },
  {
    id: 9,
    question: "What would you happily spend a weekend learning?",
    options: [
      { label: "A new programming language, spreadsheet technique, or tool", traits: ["technical", "analytical"] },
      { label: "Psychology, coaching, or communication skills", traits: ["people", "coaching"] },
      { label: "Photography, design, writing, or music", traits: ["creative", "communication"] },
      { label: "Business strategy, investing, or entrepreneurship", traits: ["entrepreneurial", "sales"] },
    ],
  },
  {
    id: 10,
    question: "If money were no object, what would your ideal day involve?",
    options: [
      { label: "Building something: an app, a system, a solution", traits: ["technical", "entrepreneurial"] },
      { label: "Teaching, mentoring, or coaching others", traits: ["coaching", "people"] },
      { label: "Creating art, content, or experiences", traits: ["creative", "communication"] },
      { label: "Running a business or leading a team towards a goal", traits: ["leadership", "sales", "operational"] },
    ],
  },
];

/* ─── Career Archetypes ─── */
interface CareerResult {
  archetype: string;
  description: string;
  careers: { title: string; salary: string; why: string }[];
  traits: string[];
}

const ARCHETYPES: CareerResult[] = [
  {
    archetype: "The Analyst",
    description: "You thrive on data, logic, and solving complex problems. You are the person teams turn to when they need clarity from chaos.",
    careers: [
      { title: "Data Analyst", salary: "£25k-£55k", why: "Your pattern-spotting and analytical thinking are the core of this role." },
      { title: "Business Analyst", salary: "£30k-£60k", why: "Bridging business needs with solutions, using structured thinking." },
      { title: "Financial Analyst", salary: "£28k-£65k", why: "Numbers, models, and commercial insight are your natural territory." },
      { title: "UX Researcher", salary: "£30k-£60k", why: "Methodical research and insight generation match your thinking style." },
      { title: "Compliance Officer", salary: "£30k-£65k", why: "Detail orientation and regulatory analysis suit your approach." },
    ],
    traits: ["analytical", "technical"],
  },
  {
    archetype: "The Connector",
    description: "You are drawn to people. You build trust quickly, understand what others need, and create genuine relationships that drive results.",
    careers: [
      { title: "Customer Success Manager", salary: "£30k-£60k", why: "Your ability to build trust and understand client needs is the core skill." },
      { title: "HR Business Partner", salary: "£35k-£65k", why: "People strategy, empathy, and conflict resolution are your strengths." },
      { title: "Recruitment Consultant", salary: "£22k-£60k+", why: "Reading people and matching needs to opportunities is what you do naturally." },
      { title: "Counsellor", salary: "£25k-£50k", why: "Deep listening and genuine care for people's wellbeing." },
      { title: "Community Manager", salary: "£25k-£45k", why: "Building and nurturing communities of people around shared interests." },
    ],
    traits: ["people", "coaching"],
  },
  {
    archetype: "The Creator",
    description: "You see possibilities where others see blank pages. You need variety, creative freedom, and the chance to make something original.",
    careers: [
      { title: "Content Strategist", salary: "£28k-£55k", why: "Planning and creating content that engages audiences." },
      { title: "UX Designer", salary: "£30k-£65k", why: "Designing experiences that are both beautiful and functional." },
      { title: "Marketing Manager", salary: "£30k-£60k", why: "Creative campaigns combined with strategic thinking." },
      { title: "Copywriter", salary: "£25k-£50k", why: "Turning ideas into compelling words that persuade and engage." },
      { title: "Brand Strategist", salary: "£35k-£65k", why: "Shaping how companies present themselves to the world." },
    ],
    traits: ["creative", "communication"],
  },
  {
    archetype: "The Builder",
    description: "You are entrepreneurial and technical. You want to create systems, products, or businesses. You think in terms of what could exist, not just what does.",
    careers: [
      { title: "Product Manager", salary: "£40k-£85k", why: "Defining what gets built and why, combining vision with execution." },
      { title: "Software Developer", salary: "£30k-£75k", why: "Building tools and systems that solve real problems." },
      { title: "Startup Founder", salary: "Variable", why: "Your drive to build something from nothing is rare and valuable." },
      { title: "Solutions Architect", salary: "£50k-£90k", why: "Designing systems that solve complex business challenges." },
      { title: "Technical Project Manager", salary: "£40k-£75k", why: "Where technical understanding meets organisational execution." },
    ],
    traits: ["technical", "entrepreneurial"],
  },
  {
    archetype: "The Leader",
    description: "You are a natural at rallying people, driving results, and taking charge. You see the big picture and know how to motivate teams to get there.",
    careers: [
      { title: "Management Consultant", salary: "£35k-£100k", why: "Strategic thinking and persuasion are your core tools." },
      { title: "Business Development Manager", salary: "£28k-£80k+", why: "Winning new business through relationships and commercial acumen." },
      { title: "Operations Manager", salary: "£35k-£70k", why: "Running teams and processes efficiently towards clear goals." },
      { title: "Sales Director", salary: "£50k-£120k+", why: "Leading revenue-generating teams with vision and energy." },
      { title: "Programme Manager", salary: "£50k-£90k", why: "Overseeing multiple projects and driving organisational change." },
    ],
    traits: ["leadership", "sales"],
  },
  {
    archetype: "The Organiser",
    description: "You are the calm in the storm. You bring structure, reliability, and efficiency to everything you touch. Teams run better with you in them.",
    careers: [
      { title: "Project Manager", salary: "£32k-£70k", why: "Planning, timelines, and stakeholder coordination are your element." },
      { title: "Operations Manager", salary: "£35k-£70k", why: "Keeping complex operations running smoothly." },
      { title: "Executive Assistant", salary: "£28k-£50k", why: "Strategic coordination and keeping senior leaders on track." },
      { title: "Facilities Manager", salary: "£30k-£55k", why: "Managing buildings, contractors, and operational logistics." },
      { title: "Supply Chain Manager", salary: "£30k-£60k", why: "Coordinating the flow of goods and logistics with precision." },
    ],
    traits: ["organised", "operational"],
  },
];

function getResult(traitCounts: Record<string, number>): CareerResult {
  let bestScore = -1;
  let bestArchetype = ARCHETYPES[0];

  for (const arch of ARCHETYPES) {
    const score = arch.traits.reduce((sum, t) => sum + (traitCounts[t] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      bestArchetype = arch;
    }
  }
  return bestArchetype;
}

/* ─── Component ─── */
export default function QuizPage() {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const progress = ((currentQ) / QUESTIONS.length) * 100;

  function handleSelect(optionIndex: number) {
    setSelectedOption(optionIndex);

    setTimeout(() => {
      const newAnswers = [...answers, optionIndex];
      setAnswers(newAnswers);
      setSelectedOption(null);

      if (currentQ + 1 >= QUESTIONS.length) {
        setShowResult(true);
      } else {
        setCurrentQ(currentQ + 1);
      }
    }, 300);
  }

  function restart() {
    setCurrentQ(0);
    setAnswers([]);
    setShowResult(false);
    setSelectedOption(null);
  }

  // Calculate result
  const traitCounts: Record<string, number> = {};
  answers.forEach((optIdx, qIdx) => {
    const traits = QUESTIONS[qIdx]?.options[optIdx]?.traits || [];
    traits.forEach((t) => {
      traitCounts[t] = (traitCounts[t] || 0) + 1;
    });
  });

  const result = showResult ? getResult(traitCounts) : null;

  return (
    <>
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
                name: "What career suits me?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "The best career for you depends on your natural preferences, skills, and work style. Take our free career quiz to discover which career archetype matches your personality, then explore specific job matches based on your results.",
                },
              },
              {
                "@type": "Question",
                name: "How accurate are career quizzes?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Career quizzes provide useful starting points by identifying broad patterns in your preferences and strengths. For the most accurate career matching, combine quiz results with AI-powered CV analysis that maps your specific experience to real job opportunities.",
                },
              },
              {
                "@type": "Question",
                name: "Is it too late to change careers?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "It is never too late. Research shows that the average person changes careers 5-7 times in their lifetime. People in their 30s, 40s, and 50s successfully switch careers every day by leveraging their transferable skills.",
                },
              },
            ],
          }),
        }}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Header */}
        {!showResult && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                What Career Suits Me?
              </h1>
              <p className="text-lg text-gray-500">
                Answer 10 quick questions and discover which career path matches your personality, skills, and work style.
              </p>
              <p className="text-sm text-gray-400 mt-2">Free. No sign-up required. Takes 2 minutes.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Question {currentQ + 1} of {QUESTIONS.length}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {QUESTIONS[currentQ].question}
              </h2>
              <div className="space-y-3">
                {QUESTIONS[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedOption === i
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-100 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-medium text-gray-400 mr-3">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-gray-800">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Results */}
        {showResult && result && (
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
                Quiz Complete
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                You are: {result.archetype}
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                {result.description}
              </p>
            </div>

            {/* Career Matches */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Top Career Matches
              </h2>
              <div className="space-y-4">
                {result.careers.map((career, i) => (
                  <div key={career.title} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs text-gray-400 mr-2">#{i + 1}</span>
                        <span className="font-semibold text-gray-900">{career.title}</span>
                      </div>
                      <span className="text-sm font-bold text-green-600 flex-shrink-0 ml-4">{career.salary}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{career.why}</p>
                    <Link
                      href={`/jobs?q=${encodeURIComponent(career.title)}`}
                      className="inline-block text-xs text-indigo-600 font-medium hover:text-indigo-700"
                    >
                      Search {career.title} jobs
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <div className="bg-indigo-50 rounded-xl p-6 sm:p-8 text-center mb-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Want more accurate, personalised results?
              </h2>
              <p className="text-gray-500 mb-6 max-w-lg mx-auto">
                This quiz reveals your broad career archetype. For results specific to YOUR experience, upload your CV and let our AI match your exact skills to real opportunities.
              </p>
              <Link
                href="/discover"
                className="inline-flex items-center justify-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Upload My CV for AI-Powered Matching
              </Link>
            </div>

            {/* Dark CTA */}
            <div className="bg-gray-900 text-white rounded-xl p-6 text-center mb-10">
              <h3 className="text-lg font-semibold mb-2">88% of CVs are rejected by ATS filters</h3>
              <p className="text-gray-300 text-sm mb-4">Our AI finds the hidden transferable skills in your CV that job boards miss entirely.</p>
              <Link href="/discover" className="inline-flex items-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Analyse My Skills Free
              </Link>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <button
                onClick={restart}
                className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Retake the Quiz
              </button>
              <Link
                href="/careers-for"
                className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Browse by Profession
              </Link>
            </div>

            {/* FAQ */}
            <section className="border-t border-gray-100 pt-10">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">How accurate is this career quiz?</h3>
                  <p className="text-sm text-gray-600">This quiz identifies your broad career archetype based on preferences and work style. It is a great starting point, but for the most accurate results, our AI-powered CV analysis maps your specific experience to real opportunities. Think of this quiz as the compass, and the CV analysis as the GPS.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Do I need to create an account?</h3>
                  <p className="text-sm text-gray-600">No. The quiz is completely free with no sign-up required. If you want to upload your CV for AI-powered matching, you can create a free account to save your results.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">What career suits me if I am an introvert?</h3>
                  <p className="text-sm text-gray-600">Many high-paying careers suit introverts, including data analysis, software development, UX research, technical writing, and compliance roles. See our full guide to <Link href="/jobs-for-introverts" className="text-indigo-600 hover:text-indigo-700">jobs for introverts</Link>.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Can I change careers at 30, 40, or 50?</h3>
                  <p className="text-sm text-gray-600">Absolutely. The average person changes careers 5-7 times in their lifetime. Your accumulated transferable skills actually make you more competitive, not less. Read our guide on <Link href="/career-change-at-30" className="text-indigo-600 hover:text-indigo-700">changing careers at 30</Link>.</p>
                </div>
              </div>
            </section>

            {/* Related */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Related Pages</h3>
              <div className="flex flex-wrap gap-2">
                <Link href="/careers-for" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change by Profession</Link>
                <span className="text-gray-300">|</span>
                <Link href="/what-jobs" className="text-sm text-indigo-600 hover:text-indigo-700">What Jobs Can I Get</Link>
                <span className="text-gray-300">|</span>
                <Link href="/jobs-for-introverts" className="text-sm text-indigo-600 hover:text-indigo-700">Jobs for Introverts</Link>
                <span className="text-gray-300">|</span>
                <Link href="/career-change-at-30" className="text-sm text-indigo-600 hover:text-indigo-700">Career Change at 30</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
