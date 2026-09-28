"use client";

import { useState } from "react";
import Link from "next/link";
import { SourceNote, formatGBP } from "@/components/content";

/* ─── Types (data comes from the server page) ─── */

export interface QuizCareer {
  id: string;
  title: string;
  why: string;
  /** ONS median in pounds, or null when ONS published none. */
  median: number | null;
  /** "ft" full-time employees, "all" all employee jobs (full-time suppressed), null if neither. */
  basis: "ft" | "all" | null;
  soc: string;
  socTitle: string;
}

export interface QuizArchetype {
  archetype: string;
  description: string;
  traits: string[];
  careers: QuizCareer[];
}

interface Props {
  archetypes: QuizArchetype[];
  paySource: { name: string; href: string; published: string };
}

/* ─── Questions ─── */

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

function getResult(archetypes: QuizArchetype[], traitCounts: Record<string, number>): QuizArchetype {
  let bestScore = -1;
  let best = archetypes[0];
  for (const arch of archetypes) {
    const score = arch.traits.reduce((sum, t) => sum + (traitCounts[t] || 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = arch;
    }
  }
  return best;
}

function payText(c: QuizCareer): { figure: string; label: string } {
  if (c.median === null || c.basis === null) return { figure: "No ONS figure", label: "ONS did not publish a reliable median" };
  return {
    figure: formatGBP(c.median),
    label: c.basis === "ft" ? "ONS median, full-time" : "ONS median, all employees (no reliable full-time figure)",
  };
}

/* ─── Component ─── */
export function QuizClient({ archetypes, paySource }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const progress = (currentQ / QUESTIONS.length) * 100;

  // Calculate result
  const traitCounts: Record<string, number> = {};
  answers.forEach((optIdx, qIdx) => {
    const traits = QUESTIONS[qIdx]?.options[optIdx]?.traits || [];
    traits.forEach((t) => {
      traitCounts[t] = (traitCounts[t] || 0) + 1;
    });
  });

  const result = showResult ? getResult(archetypes, traitCounts) : null;

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

  if (!showResult || !result) {
    return (
      <>
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">What career suits me?</h1>
          <p className="text-lg text-gray-500">
            Answer 10 quick questions to see which broad style of work suits you, then five UK careers that fit it, each with
            its ONS median pay.
          </p>
          <p className="mt-2 text-sm text-gray-400">Free. No sign-up required. Takes about 2 minutes.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>
              Question {currentQ + 1} of {QUESTIONS.length}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div className="h-2 rounded-full bg-indigo-600 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="mb-6 text-xl font-semibold text-gray-900">{QUESTIONS[currentQ].question}</h2>
          <div className="space-y-3">
            {QUESTIONS[currentQ].options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                  selectedOption === i ? "border-indigo-600 bg-indigo-50" : "border-gray-100 hover:border-indigo-300 hover:bg-gray-50"
                }`}
              >
                <span className="mr-3 text-sm font-medium text-gray-400">{String.fromCharCode(65 + i)}</span>
                <span className="text-gray-800">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">Quiz complete</div>
        <h1 className="mb-3 text-3xl font-bold text-gray-900 sm:text-4xl">You are: {result.archetype}</h1>
        <p className="mx-auto max-w-xl text-lg text-gray-600">{result.description}</p>
      </div>

      {/* Career matches */}
      <section className="mb-10" aria-labelledby="quiz-careers-title">
        <h2 id="quiz-careers-title" className="mb-4 text-xl font-semibold text-gray-900">
          Careers that fit this style
        </h2>
        <div className="space-y-4">
          {result.careers.map((career, i) => {
            const pay = payText(career);
            return (
              <div key={career.id} className="rounded-xl border border-gray-100 bg-white p-5">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div>
                    <span className="mr-2 text-xs text-gray-400">#{i + 1}</span>
                    <span className="font-semibold text-gray-900">{career.title}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block text-sm font-bold tabular-nums text-green-600">{pay.figure}</span>
                    <span className="block text-xs text-gray-500">{pay.label}</span>
                  </div>
                </div>
                <p className="mb-2 text-sm text-gray-600">{career.why}</p>
                <p className="mb-2 text-xs text-gray-500">
                  Pay covers the ONS SOC 2020 unit group {career.soc} &ldquo;{career.socTitle}&rdquo;.
                </p>
                <Link href={`/jobs?q=${encodeURIComponent(career.title)}`} className="link inline-block text-sm font-medium">
                  Search {career.title} jobs
                </Link>
              </div>
            );
          })}
        </div>
        <SourceNote
          className="mt-4"
          source={paySource.name}
          href={paySource.href}
          published={paySource.published}
          note="Median gross annual pay, UK. A median covers everyone in the group, including people with years of experience, so starting pay is usually lower."
        />
      </section>

      {/* Next step: the personal check */}
      <div className="mb-10 rounded-xl border border-accent/25 bg-accent-wash p-6 text-center sm:p-8">
        <h2 className="mb-3 text-xl font-semibold text-ink">Turn this into real options</h2>
        <p className="mx-auto mb-6 max-w-lg text-ink-2">
          The quiz shows your broad style of work. For careers matched to your own skills, with ONS pay figures and the ways in,
          start from the job you do now or paste your CV. It is free and needs no account or email.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/discover" className="btn btn-primary btn-lg">
            Start from my job
          </Link>
          <Link href="/discover#cv" className="btn btn-secondary btn-lg">
            Paste my CV
          </Link>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Retake the quiz
        </button>
        <Link
          href="/careers-for"
          className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Browse by profession
        </Link>
      </div>
    </div>
  );
}
