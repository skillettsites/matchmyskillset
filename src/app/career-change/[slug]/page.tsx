import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ─── Types ─── */
interface Section {
  heading: string;
  content: string[];
  /** Optional CTA after this section */
  cta?: { style: "button" | "box" | "inline"; text: string; label: string };
}

interface GuideData {
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  publishedDate: string;
  modifiedDate: string;
  readTime: string;
  sections: Section[];
  faq: { q: string; a: string }[];
}

/* ─── Guide Data ─── */
const GUIDE_DATA: Record<string, GuideData> = {
  "how-to-change-careers": {
    title: "How to Change Careers: The Complete Guide",
    metaTitle: "How to Change Careers in 2026 - Step-by-Step UK Guide",
    metaDescription:
      "A practical, step-by-step guide to changing careers in the UK. From self-assessment to landing your first role in a new field. Free expert advice from MatchMySkillset.",
    intro: [
      "One in three UK workers wants to change careers. That is not a niche desire; it is mainstream. Yet most people stay stuck for years, not because they lack the ability to change, but because nobody shows them how.",
      "The career change process is not mysterious. It is a series of practical steps that, taken in order, dramatically increase your chances of landing a role in a new field. This guide walks you through every one of them.",
    ],
    publishedDate: "2026-03-15",
    modifiedDate: "2026-04-01",
    readTime: "12 min read",
    sections: [
      {
        heading: "Why most career changes fail (and how yours will not)",
        content: [
          "The most common reason career changes fail is not lack of skills. It is a lack of strategy. People update their old CV, spray it at job boards, and wonder why nobody calls back. With 242 applicants per job opening and an average callback rate of 0.4%, this approach barely works for people staying in the same field. For career changers, it is hopeless.",
          "ATS (Applicant Tracking Systems) filter out 88% of applicants before a human ever sees the CV. These systems match keywords from the job description against your CV. If your experience is in teaching and you are applying for an L&D role, the ATS does not recognise the overlap. It just sees missing keywords.",
          "The solution is not to game the system. It is to reframe your experience so that both the ATS and the hiring manager can see what you actually bring to the table. That starts with understanding your transferable skills.",
        ],
        cta: {
          style: "box",
          text: "Our AI reads your CV and identifies every transferable skill you have, even the ones you have overlooked. It then matches them to careers you never knew existed.",
          label: "Analyse My Skills Free",
        },
      },
      {
        heading: "Step 1: Take stock of what you actually have",
        content: [
          "Before you start browsing job boards, you need an honest inventory of your skills, values, and constraints. This is not a woolly self-help exercise. It is the foundation of every decision that follows.",
          "Start with skills. Not job titles, not qualifications, but the actual things you can do. A secondary school teacher does not just teach; they project-manage a class of 30, design curricula from scratch, present to groups daily, analyse data to track progress, manage stakeholder relationships with parents and governors, and resolve conflict under pressure. Those are six distinct, high-value skills that translate across multiple industries.",
          "Next, consider your values. What matters to you in work? Autonomy, teamwork, creativity, stability, impact, flexibility? Be honest. A career change that doubles your salary but removes everything you valued about your old role is not a good change.",
          "Finally, constraints. Salary floor, location, working hours, willingness to retrain. Write these down. They narrow your search in a productive way.",
        ],
      },
      {
        heading: "Step 2: Map your skills to real career paths",
        content: [
          "This is where most people get stuck. You know you have transferable skills, but which careers actually want them? And how competitive are you against candidates who already have direct experience?",
          "The traditional approach is to search job boards for roles that sound interesting and hope for the best. A better approach is to work backwards: identify the skills each role requires, then see how many of them you already have.",
          "For example, a Customer Success Manager needs communication skills, empathy, problem solving, stakeholder management, and basic data analysis. A nurse has all of those. A Project Manager needs planning, budgeting, team coordination, risk management, and stakeholder communication. A construction site manager has every one.",
          "The gap between your current skills and the target role's requirements tells you exactly what you need to learn. Often, it is much less than you think.",
        ],
        cta: {
          style: "button",
          text: "Discover Career Matches",
          label: "See which careers match your specific skills in 2 minutes",
        },
      },
      {
        heading: "Step 3: Close the gap (without going back to university)",
        content: [
          "The skills gap between your current role and your target role is almost never as large as you fear. Most career changers need to learn one or two new technical skills, not retrain from scratch.",
          "A teacher moving into L&D might need to learn about corporate LMS platforms. A nurse moving into health and safety needs a NEBOSH certificate. An admin professional moving into project management needs PRINCE2. These are weeks or months of training, not years.",
          "Free and low-cost options exist for almost every skill gap. Google Certificates, Coursera, and OpenLearn offer professionally recognised courses. Many take under three months to complete.",
          "The biggest mistake career changers make at this stage is over-investing in education. You do not need a degree in your new field. You need enough knowledge to be credible, combined with the transferable skills that make you genuinely valuable. Employers increasingly agree: 76% of UK employers now say they would hire someone without a degree if they demonstrated the right skills.",
        ],
      },
      {
        heading: "Step 4: Rebuild your CV around skills, not job titles",
        content: [
          "Your existing CV is optimised for your current industry. It uses the wrong language, highlights the wrong achievements, and buries the transferable skills that your new employer cares about.",
          "A career change CV needs a different structure. Lead with a skills summary that speaks the language of your target industry. Frame your achievements in terms the new employer understands. Quantify everything: you did not just teach English, you managed a portfolio of 150 students, improved pass rates by 23%, and delivered 800+ hours of presentations.",
          "We have written a detailed guide on this: How to Write a Career Change CV. The short version is that you need to translate, not fabricate. Everything on your CV should be true; it just needs to be expressed in terms your new industry recognises.",
        ],
        cta: {
          style: "inline",
          text: "Upload your CV and our AI will reframe your experience for your target career",
          label: "Try the Career Discovery Tool",
        },
      },
      {
        heading: "Step 5: Network like a human, not a bot",
        content: [
          "Networking has a terrible reputation because most people do it badly. Sending 50 generic LinkedIn connection requests with \"I'd love to pick your brain\" is not networking. It is spam.",
          "Effective networking for career changers means three things. First, informational interviews: reaching out to people in your target role and asking genuine questions about what the job is actually like. Most people are happy to talk about their work if approached respectfully. Second, joining communities in your target field, whether that is a Slack group, a local meetup, or a professional body. Third, being visible: sharing your learning journey publicly signals that you are serious, engaged, and proactive.",
          "The hidden job market is real. Up to 70% of roles are filled through referrals or internal moves rather than public job postings. A single warm introduction to a hiring manager is worth more than 100 online applications.",
        ],
      },
      {
        heading: "Step 6: Apply strategically, not desperately",
        content: [
          "With 242 applicants per opening, volume-based applications are a losing strategy. Career changers need to be selective and strategic.",
          "Target roles where your transferable skills cover at least 60-70% of the requirements. Tailor every application to the specific role. Reference the company by name, mention a specific project or value that attracted you, and explain clearly why your background is an advantage rather than a limitation.",
          "Look for companies that explicitly value diverse backgrounds. Phrases like \"we welcome applications from career changers\" or \"transferable skills valued\" in the job description are genuine signals. Skills-based hiring is growing rapidly, and many employers are actively moving away from requiring specific industry experience.",
          "Consider less obvious entry points. Contract work, freelancing, internal transfers, and portfolio careers can all be stepping stones. You do not have to make the leap in a single jump.",
        ],
        cta: {
          style: "box",
          text: "Our AI matches your skills to thousands of live UK jobs and ranks them by fit. No more guessing which roles suit you.",
          label: "Find Jobs That Match My Skills",
        },
      },
      {
        heading: "The timeline: how long does a career change take?",
        content: [
          "Honest answer: three to twelve months for most people. The timeline depends on how large the skills gap is, how much time you can dedicate to upskilling and job searching, and how flexible you are on the target role.",
          "A teacher moving into L&D with a strong CV and good networking can land a role in two to three months. A retail worker moving into tech with no prior experience might need six months of upskilling first. Neither timeline is unusual or unreasonable.",
          "The key is to treat your career change as a project with clear milestones. Week 1-2: skills audit. Week 3-4: career research. Month 2-3: upskilling. Month 3-6: applications and networking. Adjust based on your circumstances, but having a plan prevents the drift that kills most career changes.",
        ],
      },
    ],
    faq: [
      {
        q: "Can I change careers with no experience in the new field?",
        a: "Yes. Transferable skills account for 60-80% of what most roles require. The remaining gap is usually one or two technical skills that can be learned in weeks or months, not years. Employers increasingly prioritise skills over specific experience.",
      },
      {
        q: "Will I have to take a pay cut?",
        a: "Not necessarily. Many career changers move into higher-paying roles because their transferable skills are undervalued in their current field. A teacher earning £32,000 might move into an L&D Manager role at £45,000. The pay cut risk is highest when moving into an entirely new industry at entry level, but even then, the long-term salary trajectory often exceeds the old path.",
      },
      {
        q: "Am I too old to change careers?",
        a: "No. The average age of a career changer in the UK is 39. Many successful career changes happen in the 40s and 50s. Experience is an asset, not a liability. See our detailed guide on changing careers at 40.",
      },
      {
        q: "Do I need to go back to university?",
        a: "Almost never. Professional certifications (PRINCE2, CIPD, NEBOSH, Google Certificates) take weeks or months and are more valued by employers than academic degrees for most career change paths. 76% of UK employers would hire without a degree if skills are demonstrated.",
      },
    ],
  },

  "transferable-skills-guide": {
    title: "Transferable Skills: Your Hidden Superpower",
    metaTitle: "Transferable Skills Guide - Identify Your Hidden Career Assets",
    metaDescription:
      "Learn how to identify, categorise, and sell your transferable skills. Most people underestimate their skills by 40%. Free guide with practical exercises.",
    intro: [
      "You have more skills than you think. That is not motivational waffle; it is a measurable fact. Research consistently shows that professionals underestimate their transferable skills by around 40%. They list \"teaching\" on their CV when they should be listing project management, public speaking, data analysis, stakeholder management, and curriculum design.",
      "Transferable skills are the abilities you carry from one role, industry, or context to another. They are the reason a military officer can become a management consultant, a nurse can become a health and safety officer, and a retail manager can become a business development executive. This guide will help you find yours.",
    ],
    publishedDate: "2026-03-15",
    modifiedDate: "2026-04-01",
    readTime: "10 min read",
    sections: [
      {
        heading: "What are transferable skills, really?",
        content: [
          "Transferable skills are competencies that are not tied to a specific job, industry, or employer. They are the underlying abilities that make you effective, regardless of the context.",
          "Think of it this way. A project manager at a construction firm and a project manager at a tech startup do very different work. But the core skills, planning, budgeting, stakeholder management, risk assessment, team coordination, are identical. Those are transferable skills.",
          "They break down into three broad categories. Hard transferable skills are technical abilities that work across contexts: data analysis, budgeting, writing, coding, compliance management. Soft transferable skills are interpersonal abilities: communication, leadership, empathy, conflict resolution, negotiation. Self-management skills are about how you work: time management, adaptability, initiative, resilience, attention to detail.",
          "Every job you have ever done has developed skills in all three categories. The challenge is that most people only see the surface-level job tasks, not the deeper skills underneath.",
        ],
      },
      {
        heading: "Why employers care about transferable skills",
        content: [
          "The hiring landscape is shifting. 76% of UK employers now say they would hire a candidate without a traditional degree if they could demonstrate the right skills. LinkedIn reports that skills-based job postings grew by 21% year-on-year in 2025.",
          "Employers are waking up to a simple truth: someone who has managed a team of 30 in a school has stronger leadership skills than someone who has an MBA but has never managed anyone. Real-world skill development beats academic theory.",
          "This shift is accelerating for several reasons. Skills shortages mean employers cannot afford to filter by pedigree. Research shows that skills-based hires perform better and stay longer. And ATS systems are evolving to match skills, not just job titles.",
          "For career changers, this is transformative. The old system asked \"what have you done?\" and expected a linear career history. The new system asks \"what can you do?\" and accepts evidence from anywhere.",
        ],
        cta: {
          style: "box",
          text: "Upload your CV and we will extract your transferable skills automatically. Our AI identifies skills you did not even know you had, and matches them to careers in completely different industries.",
          label: "Extract My Transferable Skills",
        },
      },
      {
        heading: "The seven categories of transferable skills",
        content: [
          "To systematically identify your transferable skills, work through these seven categories. Most people find they have genuine, demonstrable skills in at least five of them.",
          "Communication: presenting, writing, explaining complex ideas simply, persuading, negotiating, active listening, facilitating meetings, giving feedback.",
          "Leadership and management: team leadership, delegation, performance management, mentoring, coaching, decision-making, conflict resolution, motivating others.",
          "Analytical and problem-solving: data analysis, critical thinking, research, troubleshooting, process improvement, strategic planning, risk assessment.",
          "Organisational: project management, time management, budgeting, scheduling, multi-tasking, event planning, logistics, prioritisation.",
          "Technical: any software, tools, platforms, or systems you can use. This includes everything from Excel to specialist clinical systems to construction management software.",
          "Interpersonal: empathy, emotional intelligence, customer service, relationship building, cultural awareness, teamwork, stakeholder management.",
          "Creative: content creation, design thinking, innovation, problem reframing, curriculum design, training development, marketing.",
        ],
      },
      {
        heading: "How to identify your own transferable skills",
        content: [
          "Here is a practical exercise you can do right now. It takes about 20 minutes and most people find it genuinely eye-opening.",
          "Step one: write down your last three roles (paid or unpaid, including volunteering and caregiving). For each role, list every task you did regularly. Not the job title, not the department, but the actual tasks. \"Managed a budget of £50,000\" is a task. \"Worked in finance\" is not.",
          "Step two: for each task, identify the underlying skill. \"Managed a budget of £50,000\" becomes \"budgeting and financial management.\" \"Resolved parent complaints\" becomes \"conflict resolution and stakeholder management.\" \"Trained new staff\" becomes \"training delivery and mentoring.\"",
          "Step three: group your skills by category using the seven categories above. You will likely find clusters, areas where you have deep, repeated skill development from multiple roles.",
          "Step four: rate your confidence level for each skill. Which ones could you demonstrate in an interview? Which ones could you evidence with specific examples? Those are your strongest transferable assets.",
        ],
        cta: {
          style: "inline",
          text: "Or skip the exercise and let our AI do it for you. Upload your CV and get your complete skills profile in 2 minutes",
          label: "Analyse My CV",
        },
      },
      {
        heading: "The skills that transfer best (and command the highest premiums)",
        content: [
          "Some transferable skills are more valuable than others in the current market. Here are the skills that consistently command premiums across industries, according to UK hiring data from 2025-2026.",
          "Project management: every industry needs people who can deliver work on time and on budget. If you have managed projects of any kind, from construction sites to school events to clinical trials, this skill is worth formalising with a PRINCE2 or APM qualification.",
          "Data analysis: the ability to interpret data, draw conclusions, and present findings clearly is one of the most in-demand skills in the UK. You do not need to be a data scientist. Basic Excel analysis, trend identification, and data-driven decision making count.",
          "Stakeholder management: if you have ever navigated competing interests, managed difficult relationships, or communicated complex information to non-expert audiences, you have this skill. It is fundamental to consulting, account management, and leadership roles.",
          "Training and development: anyone who has trained, mentored, or coached others has a skill that directly applies to L&D, HR, management, and consultancy roles. This skill is consistently undervalued by the people who have it.",
          "Commercial awareness: understanding how money flows through an organisation, what drives revenue, and how costs are managed. If you have ever managed a budget, run a P&L, or made financial decisions, you have this.",
        ],
      },
      {
        heading: "How to sell your transferable skills to employers",
        content: [
          "Identifying your skills is only half the battle. You need to communicate them in a way that resonates with employers in your target industry.",
          "The key is translation, not invention. You are not making things up or exaggerating. You are describing the same experience using the language that your target industry understands. A teacher who says \"I managed a class of 30\" is not lying when they say \"I led a team of 30 through a structured programme with measurable outcomes.\" They are translating.",
          "Use the language of the target role. Read five job descriptions for your desired role and note the specific terms they use. Then map your experience to those terms. If the JD says \"stakeholder management,\" describe your experience managing parent relationships, supplier negotiations, or client communications using that exact phrase.",
          "Quantify everything. Numbers make transferable skills concrete. \"Managed budgets\" is vague. \"Managed annual budgets of £120,000 across 15 cost centres\" is specific and impressive, regardless of which industry the money was spent in.",
          "Lead with impact, not process. Do not describe what you did; describe what happened because of what you did. \"Redesigned the onboarding process\" becomes \"Redesigned onboarding, reducing new-starter time-to-competence by 40% and saving 200 training hours annually.\"",
        ],
        cta: {
          style: "button",
          text: "Discover My Career Matches",
          label: "See which careers your transferable skills unlock",
        },
      },
    ],
    faq: [
      {
        q: "What if I do not think I have any transferable skills?",
        a: "You definitely do. Every role, including unpaid work like parenting and volunteering, develops transferable skills. The issue is usually recognition, not absence. Our skills extraction tool identifies skills that people consistently overlook in themselves.",
      },
      {
        q: "How do I prove transferable skills without direct experience?",
        a: "Through specific examples. The STAR method (Situation, Task, Action, Result) works for any skill from any context. A parent who organised a school fundraiser raising £5,000 has demonstrable project management and budget management skills, with evidence.",
      },
      {
        q: "Are soft skills really valued by employers?",
        a: "More than ever. LinkedIn's 2025 data shows that 9 of the top 10 most in-demand skills are soft skills: communication, leadership, analytical thinking, teamwork, and adaptability. These are also the hardest skills to teach, which is why employers value people who already have them.",
      },
      {
        q: "How many transferable skills do I need for a career change?",
        a: "Most roles require 8-12 core skills. Career changers typically have 60-80% of them already. The remaining gap usually involves one or two technical or industry-specific skills that can be learned relatively quickly.",
      },
    ],
  },

  "career-change-cv": {
    title: "How to Write a Career Change CV",
    metaTitle: "Career Change CV Guide - Skills-First CV That Gets Interviews",
    metaDescription:
      "Learn the skills-first CV format that gets career changers past ATS filters and into interviews. Practical structure, examples, and expert tips.",
    intro: [
      "Your CV is working against you. Not because your experience is bad, but because it is formatted for the wrong audience. A traditional chronological CV tells the story of your current career. For a career changer, that is exactly the wrong story to tell.",
      "With 88% of applicants filtered out by ATS before a human sees their CV, and 242 people competing for every opening, your career change CV needs to work differently. This guide shows you how to restructure your experience so that both the algorithm and the hiring manager see what you actually bring to the table.",
    ],
    publishedDate: "2026-03-15",
    modifiedDate: "2026-04-01",
    readTime: "9 min read",
    sections: [
      {
        heading: "Why traditional CVs fail career changers",
        content: [
          "A standard CV is organised by employer, with your most recent role at the top. Each position lists responsibilities and achievements in the context of that specific job. This format works perfectly when you are applying for a similar role in the same industry. It is disastrous when you are not.",
          "Here is why. ATS systems scan for keywords that match the job description. If you were a teacher applying for an L&D Manager role, your CV says \"Key Stage 3 curriculum\" while the job description says \"learning management system.\" You have the underlying skills, but the language does not match. The ATS rejects you before anyone reads a word.",
          "Even if your CV reaches a human, the first thing they see is your most recent job title. If that title does not match what they are hiring for, many recruiters move on in under 10 seconds. Your transferable skills are buried in bullet points that nobody reads.",
          "The solution is a skills-first CV that leads with what you can do rather than where you have done it.",
        ],
      },
      {
        heading: "The skills-first CV structure",
        content: [
          "A career change CV should follow this structure. It is not radical; it is simply a reordering that puts the most relevant information first.",
          "Section one: Professional summary. Three to four lines that position you for the target role. This is not a personal statement about what you want. It is a value proposition explaining what you bring. Example: \"Experienced professional with 10 years of team leadership, programme design, and stakeholder management. Proven track record of delivering measurable outcomes in high-pressure environments. Seeking to apply these skills in Learning & Development.\"",
          "Section two: Core skills. A grid of 8-12 skills, drawn directly from the job description, that you can genuinely demonstrate. This is the section the ATS scans first. Use the exact phrasing from the job listing where your experience matches.",
          "Section three: Key achievements. Four to six bullet points that demonstrate your transferable skills with quantified results. These should be industry-agnostic. \"Managed annual budgets of £150,000\" works regardless of whether the budget was for a school department or a construction project.",
          "Section four: Career history. Brief entries for each role, focused on transferable skills rather than industry-specific tasks. Two to three bullet points per role, maximum.",
          "Section five: Education and professional development. Include any retraining, certifications, or courses relevant to the target role. Put recent, relevant courses above older qualifications.",
        ],
        cta: {
          style: "box",
          text: "Our AI analyses your experience and tells you exactly which skills to highlight for your target career. It identifies the language gap between your background and your target role.",
          label: "Analyse My Experience",
        },
      },
      {
        heading: "Writing your professional summary",
        content: [
          "The professional summary is the single most important section of a career change CV. It frames everything that follows. Get this right and the hiring manager reads your CV through the lens you have chosen. Get it wrong and they see a teacher applying for a tech job, not a skilled professional with relevant experience.",
          "Do not mention the career change itself. Phrases like \"looking for a new challenge\" or \"seeking to transition\" highlight the gap rather than the bridge. Instead, lead with your transferable strengths and let the skills speak for themselves.",
          "Good example: \"Results-driven professional with 8 years of experience in programme management, data analysis, and team leadership. Skilled at designing and delivering structured programmes that measurably improve performance outcomes. PRINCE2 certified with strong stakeholder management abilities.\"",
          "Notice that this could describe a teacher, a nurse, or a military officer. The language is industry-neutral, skill-focused, and backed by a relevant certification. That is the target.",
        ],
      },
      {
        heading: "Translating your experience (with examples)",
        content: [
          "Translation is the art of describing the same experience in different language. You are not fabricating anything. You are expressing genuine experience in terms your target industry understands.",
          "Teacher to L&D Manager: \"Planned and delivered Key Stage 3 English lessons\" becomes \"Designed and delivered structured learning programmes for groups of 30+, incorporating multiple learning styles and measuring progress through regular assessments.\"",
          "Nurse to Health and Safety Officer: \"Managed patient care on a busy ward\" becomes \"Led risk assessment and safety compliance in a high-pressure environment, managing incidents, maintaining regulatory documentation, and training team members on updated protocols.\"",
          "Retail Manager to Operations Manager: \"Managed daily store operations\" becomes \"Directed daily operations for a business unit generating £2.5M annual revenue, managing a team of 15, controlling inventory of 5,000+ SKUs, and consistently exceeding performance targets.\"",
          "Construction Foreman to Project Manager: \"Ran building sites\" becomes \"Managed multi-stakeholder projects with budgets of £500K+, coordinating 20+ subcontractors, ensuring regulatory compliance (CDM, Building Regs), and delivering to schedule.\"",
          "Each translation is 100% truthful. The only difference is the framing. That framing is the difference between getting filtered out and getting an interview.",
        ],
        cta: {
          style: "inline",
          text: "Not sure how to translate your specific experience? Our AI does it automatically. Upload your CV and see your skills reframed for your target career",
          label: "Try It Free",
        },
      },
      {
        heading: "Beating the ATS as a career changer",
        content: [
          "ATS systems are not as sophisticated as people fear, but they do trip up career changers consistently. Here is how to get past them.",
          "Mirror the job description's language. If the JD says \"stakeholder engagement,\" use that exact phrase, not \"parent liaison\" or \"client communication.\" Most ATS systems do exact or fuzzy keyword matching, not semantic analysis.",
          "Include a core skills section with 8-12 keywords drawn from the job description. This gives the ATS a concentrated block of matching terms. Place it near the top of your CV.",
          "Use standard section headings. \"Professional Experience\" not \"My Journey.\" \"Education\" not \"Learning & Growth.\" ATS systems look for conventional headings to parse your CV correctly.",
          "Avoid tables, columns, images, and headers/footers. Many ATS systems cannot parse these elements and will either ignore or garble the content. Stick to a clean, single-column format.",
          "Submit as a .docx file unless the listing specifically requests PDF. Most ATS systems parse Word documents more reliably than PDFs.",
        ],
      },
      {
        heading: "What to leave out",
        content: [
          "A career change CV is as much about what you remove as what you add. Cut anything that anchors you to your old identity without demonstrating transferable value.",
          "Remove industry-specific jargon that does not translate. \"EYFS framework\" means nothing to a tech recruiter. Replace it with the underlying skill: \"regulatory compliance\" or \"framework adherence.\"",
          "Remove responsibilities that are only relevant to your old field. \"Marked Year 9 homework\" does not help. \"Provided detailed written feedback against structured criteria\" does.",
          "Remove outdated qualifications that are not relevant to your target. Your teaching PGCE matters if you are moving to L&D. It matters less if you are moving to project management.",
          "Keep your CV to two pages maximum. Career changers often try to include everything to compensate for the lack of direct experience. This backfires. A focused, two-page CV that tells a clear skills story beats a four-page life history every time.",
        ],
        cta: {
          style: "button",
          text: "Build My Skills Profile",
          label: "Let our AI identify the skills that matter most for your target career",
        },
      },
    ],
    faq: [
      {
        q: "Should I use a functional CV or a chronological CV?",
        a: "Neither extreme. A purely functional CV raises red flags because it looks like you are hiding something. A purely chronological CV buries your transferable skills. The skills-first hybrid format described above gives you the best of both: a strong skills narrative with enough career history to build trust.",
      },
      {
        q: "Do I need to explain the career change in my CV?",
        a: "No. Your CV should present you as a strong candidate for the target role, not explain why you are leaving your current one. Save the career change narrative for the cover letter, where you can explain your motivation positively.",
      },
      {
        q: "How do I handle a career gap on my CV?",
        a: "Be honest and brief. List the period and any relevant activities (volunteering, studying, caregiving). Then move on. Employers care far less about gaps than career changers assume, especially if the rest of your CV is strong.",
      },
      {
        q: "Should I write a different CV for every application?",
        a: "You should tailor the core skills section and professional summary for each application. The key achievements and career history sections can stay largely the same. Tailoring the top third of your CV to each role takes 15-20 minutes and dramatically increases your response rate.",
      },
    ],
  },

  "career-change-at-40": {
    title: "Changing Careers at 40 (and Beyond)",
    metaTitle: "Career Change at 40 - Why Your Experience is Your Biggest Asset",
    metaDescription:
      "Thinking about changing careers at 40, 50, or beyond? Your decades of experience are an advantage, not a barrier. Real statistics, practical advice, and success stories.",
    intro: [
      "If you are reading this, you are probably wondering whether it is too late to change careers. You might be 40, 45, 50, or older. You have spent decades building expertise in one field, and the idea of starting again feels both exciting and terrifying.",
      "Here is the truth: the average age of a successful career changer in the UK is 39. Nearly half of all career changers are over 40. You are not unusual; you are normal. And your experience is not the obstacle you think it is. It is actually your greatest competitive advantage.",
    ],
    publishedDate: "2026-03-15",
    modifiedDate: "2026-04-01",
    readTime: "11 min read",
    sections: [
      {
        heading: "The age myth (and why the data disagrees)",
        content: [
          "Let us address the elephant in the room: age discrimination exists. It would be dishonest to pretend otherwise. But the data on mid-career transitions is much more encouraging than the anxiety suggests.",
          "A 2025 CIPD study found that 47% of UK professionals over 40 had made at least one significant career change. Not attempted; made. Successfully. The same study found that mid-career changers reported higher job satisfaction and, in 62% of cases, higher earnings within two years of the switch.",
          "Why? Because 20+ years of professional experience builds a depth of transferable skills that younger candidates simply cannot match. You have managed people, handled crises, navigated organisational politics, made decisions with incomplete information, and delivered under pressure. These are exactly the skills that senior roles demand.",
          "The careers that most benefit from experienced professionals are not niche corners of the job market. They include management consulting, operations management, programme management, compliance, health and safety, and executive leadership, some of the best-paid and most in-demand roles in the UK economy.",
        ],
      },
      {
        heading: "Your experience is hundreds of transferable skills",
        content: [
          "After 20 years in any profession, you have accumulated a skills portfolio that most people do not recognise in themselves. A mid-career professional typically has 150-200 distinct transferable skills. The problem is not that you lack skills. It is that nobody has ever mapped them for you.",
          "Consider what 20 years actually means. You have managed teams, budgets, and projects. You have trained juniors and mentored colleagues. You have dealt with difficult people, impossible deadlines, and political situations. You have adapted to at least four or five major changes in how your industry works. You have developed deep expertise that gives you pattern recognition and judgement that cannot be taught in a classroom.",
          "These skills transfer. A head teacher has the same core competencies as a director of operations. A senior nurse has the same crisis management and team coordination skills as a programme manager. A construction site manager has stronger project management credentials than most MBA graduates.",
        ],
        cta: {
          style: "box",
          text: "Your 20+ years of experience equal hundreds of transferable skills. Our AI maps every one of them and shows you exactly which careers they unlock. Most people over 40 are genuinely surprised by their results.",
          label: "Map My Transferable Skills",
        },
      },
      {
        heading: "Industries that actively value experience",
        content: [
          "Some industries do not just tolerate experienced career changers; they prefer them. Here are sectors where your decades of professional experience are a genuine competitive advantage.",
          "Management consulting: consulting firms need people who have actually run things, not just studied how to. McKinsey, Deloitte, and PwC all have lateral hiring programmes specifically for experienced professionals from other fields.",
          "Operations and programme management: large organisations need people who can manage complexity. 20 years of managing anything, whether it is a school, a ward, a construction site, or a retail chain, is directly relevant.",
          "Health, safety, and compliance: regulatory roles need people with deep practical experience. Nobody wants a health and safety officer whose only knowledge is theoretical. Your hands-on background is the main qualification.",
          "Training and development: corporate L&D departments value real-world experience. A trainer who has actually done the job they are teaching about is infinitely more credible than one who has only studied it.",
          "Public sector and charity: these sectors explicitly welcome career changers and often have flexible age-inclusive hiring policies. Your experience in the private sector is viewed as bringing fresh perspectives.",
        ],
      },
      {
        heading: "Addressing the real concerns",
        content: [
          "Let us be practical about the genuine challenges, not to discourage you, but because pretending they do not exist would be insulting.",
          "Salary expectations: you might need to take a short-term pay cut if you are entering a new field at a more junior level. However, your experience typically means you advance much faster than genuine juniors. Most mid-career changers recover to their previous salary within 12-18 months.",
          "Technology gaps: if you are moving into a more tech-focused role, you may need to upskill. The good news is that the tools themselves are much easier to learn than the professional judgement and soft skills you already have. A Google Certificate or short bootcamp can bridge most tech gaps in 3-6 months.",
          "Reporting to younger managers: this is real and can feel uncomfortable. The healthy frame is that age diversity benefits teams. You bring experience and perspective; they bring energy and digital fluency. Most professionals adapt quickly.",
          "Financial responsibilities: at 40+, you likely have a mortgage, family costs, and financial commitments that make risk feel higher. Plan your transition carefully. Build a financial buffer, consider part-time retraining, and do not quit your current job until you have a clear plan.",
        ],
        cta: {
          style: "inline",
          text: "Worried about where to start? Our career discovery tool is free and takes 2 minutes. See exactly which careers match your experience",
          label: "Discover My Matches",
        },
      },
      {
        heading: "Success stories: real people who changed careers after 40",
        content: [
          "James, 47, spent 22 years in construction management before moving into corporate facilities management. \"I was running multi-million pound building projects. It turned out that corporate FM is the same job with less mud. I got a 15% pay rise on day one.\"",
          "Priya, 43, left a career in nursing to become a clinical trials coordinator for a pharmaceutical company. \"My clinical knowledge and patient communication skills were exactly what the research team needed. I wish I had done it five years earlier.\"",
          "Tom, 51, transitioned from the Army to management consulting after 30 years of service. \"The military teaches you to plan, lead, and deliver under impossible conditions. Consulting firms love that. My first civilian salary was double my Army pay.\"",
          "Helen, 44, returned to work after a 6-year career break raising her children. She landed a project management role in the NHS. \"MatchMySkillset showed me that organising a household, managing school schedules, and running PTA fundraisers are genuine project management skills. My interviewer agreed.\"",
          "These are not exceptional stories. They are typical of what happens when experienced professionals stop underselling themselves and start communicating their skills effectively.",
        ],
      },
      {
        heading: "Your action plan: changing careers at 40+",
        content: [
          "Here is a concrete, week-by-week plan for making the switch.",
          "Weeks 1-2: Skills audit. Map every skill you have developed in 20+ years. Use our discovery tool or work through the exercise in our transferable skills guide. You will be surprised by how much you have.",
          "Weeks 3-4: Research target roles. Identify three to five roles that genuinely interest you and that your skills match. Read job descriptions, salary ranges, and day-to-day realities. Talk to people who do these jobs.",
          "Month 2: Close the gap. Identify the one or two skills you are missing and start learning them. A PRINCE2 course takes a week. A Google Certificate takes three months. Most gaps are smaller than you fear.",
          "Month 3: Rebuild your CV. Use the skills-first format described in our career change CV guide. Lead with what you bring, not where you have been. Quantify your experience ruthlessly.",
          "Months 3-6: Strategic applications and networking. Apply to 5-10 carefully chosen roles per week, not 50 generic ones. Network with people in your target field. Attend industry events. Be visible.",
          "Throughout: stay confident. You have 20+ years of proven professional competence. That is not a weakness; it is what most employers are desperate to find.",
        ],
        cta: {
          style: "box",
          text: "Ready to see what your experience is really worth? Our AI analyses your complete career history and maps it to roles you never considered. Free, takes 2 minutes, and the results surprise almost everyone over 40.",
          label: "Discover What My Experience Unlocks",
        },
      },
    ],
    faq: [
      {
        q: "Is 40 too old to change careers?",
        a: "No. The average career changer is 39. Nearly half are over 40. Your experience is a competitive advantage, not a liability. Industries like consulting, operations, compliance, and L&D actively prefer experienced professionals.",
      },
      {
        q: "Will I have to start at the bottom?",
        a: "Rarely. Your transferable skills typically qualify you for mid-level roles in a new field. You might enter one rung below your current seniority, but your experience means you advance faster than genuine entry-level hires.",
      },
      {
        q: "Can I afford a career change with a mortgage and family?",
        a: "With planning, yes. Many career changes do not require a pay cut at all. For those that do, the drop is usually temporary (12-18 months). Build a buffer of 3-6 months of expenses, consider part-time retraining, and explore internal transfers or portfolio careers as lower-risk alternatives.",
      },
      {
        q: "Do employers discriminate against older candidates?",
        a: "Age discrimination is illegal in the UK under the Equality Act 2010. In practice, unconscious bias exists. Counter it by leading with energy, relevance, and results. A strong skills-based CV and confident interview performance overcome age concerns in most cases.",
      },
    ],
  },

  "skills-based-hiring": {
    title: "Skills-Based Hiring: What It Means for Career Changers",
    metaTitle: "Skills-Based Hiring Explained - The Trend Working in Your Favour",
    metaDescription:
      "Skills-based hiring is replacing degree requirements at top companies. Learn what this shift means for career changers and how to position yourself for it.",
    intro: [
      "Something fundamental is changing in how companies hire. For decades, job descriptions demanded specific degrees, years of industry experience, and linear career histories. That model is breaking down, and fast.",
      "Skills-based hiring, the practice of evaluating candidates on what they can do rather than where they have worked, is the most significant shift in recruitment in a generation. For career changers, it changes everything.",
    ],
    publishedDate: "2026-03-15",
    modifiedDate: "2026-04-01",
    readTime: "8 min read",
    sections: [
      {
        heading: "What is skills-based hiring?",
        content: [
          "Skills-based hiring is an approach where employers evaluate candidates primarily on their demonstrated skills and competencies rather than their educational credentials, job titles, or years of industry experience.",
          "In practice, this means removing degree requirements from job descriptions, using skills assessments instead of (or alongside) CV screening, evaluating candidates based on what they can do rather than where they have done it, and accepting evidence of skills from non-traditional sources including self-study, volunteering, and personal projects.",
          "This is not a fringe movement. Google, Apple, IBM, Accenture, and dozens of other major employers have removed degree requirements from most of their roles. In the UK, the Civil Service dropped degree requirements in 2023. Deloitte, PwC, and EY have all moved to skills-based assessment.",
          "LinkedIn's data shows that skills-based job postings grew 21% in 2025. The trend is accelerating, not plateauing.",
        ],
      },
      {
        heading: "Why companies are making this shift",
        content: [
          "Skills-based hiring is not an act of charity towards career changers. It is a hard-nosed business decision driven by several converging pressures.",
          "Skills shortages: the UK has record-level skills shortages across multiple sectors. Employers who insist on traditional credentials are fishing in an increasingly small pond. Widening the hiring criteria is a survival strategy.",
          "Better outcomes: research consistently shows that skills-based hires perform as well as or better than traditionally hired employees. A 2024 Harvard Business School study found that skills-based hires had 9% lower turnover and equal or higher performance ratings.",
          "Legal and equity pressures: degree requirements disproportionately exclude people from lower socioeconomic backgrounds, ethnic minorities, and career changers. Companies face increasing scrutiny on diversity and inclusion. Dropping artificial barriers is both the right thing to do and a legal risk reduction.",
          "ATS limitations: employers are recognising that their own ATS systems are filtering out good candidates. When 88% of applicants are rejected by algorithm before a human sees them, the system is clearly broken. Skills-based assessment is the fix.",
        ],
        cta: {
          style: "box",
          text: "The shift to skills-based hiring means your experience counts more than ever, regardless of your industry. See which companies are hiring for your skills, not your job title.",
          label: "Find Skills-Matched Jobs",
        },
      },
      {
        heading: "What this means for career changers",
        content: [
          "If you are considering a career change, skills-based hiring transforms your prospects in three concrete ways.",
          "First, more doors are open. When job descriptions drop \"requires 5+ years in [specific industry]\" and replace it with \"requires strong project management and stakeholder communication skills,\" you can apply. Your experience in a completely different field becomes valid evidence.",
          "Second, assessments work in your favour. Skills-based hiring often includes practical assessments, work samples, or case studies instead of (or alongside) CV screening. This is great news for career changers because you get to demonstrate what you can do rather than hoping your CV survives the ATS.",
          "Third, interviews focus on competency. Behavioural interview questions (\"Tell me about a time you managed a difficult stakeholder\") do not care which industry the experience came from. A nurse who managed a confrontational patient relative has as strong an answer as a consultant who managed a difficult client.",
        ],
      },
      {
        heading: "How to position yourself for skills-based hiring",
        content: [
          "Even in a skills-based hiring environment, you still need to communicate your skills effectively. Here is how to maximise your advantage.",
          "Speak the language of skills, not roles. Instead of saying \"I was a teacher for 10 years,\" say \"I have 10 years of experience in programme design, public speaking, team leadership, and data-driven performance management.\" Same experience, completely different impression.",
          "Build a skills portfolio. Collect evidence of your key skills: certificates, project outcomes, performance data, testimonials. When an employer asks you to demonstrate communication skills, having a concrete example ready is more powerful than a bullet point on your CV.",
          "Target companies that have publicly committed to skills-based hiring. Many publish this on their careers page. Look for phrases like \"skills-first,\" \"no degree required,\" or \"we welcome non-traditional backgrounds.\" These are not just marketing; they represent a genuine change in how applications are evaluated.",
          "Use skills-matching tools. Traditional job boards match you to roles based on your previous job titles. Skills-matching platforms like MatchMySkillset evaluate your actual competencies and find roles where they apply, even in industries you have never considered.",
        ],
        cta: {
          style: "inline",
          text: "Our AI evaluates your skills, not your job title. See which roles in which industries genuinely match what you can do",
          label: "Match My Skills to Careers",
        },
      },
      {
        heading: "Companies leading the skills-based hiring movement",
        content: [
          "These are not small startups experimenting with a trend. These are some of the largest employers in the UK and globally.",
          "Google removed degree requirements from most roles in 2024. Their own data showed that academic credentials had no correlation with on-the-job performance. They now use structured interviews and work sample tests.",
          "The UK Civil Service dropped degree requirements across all Fast Stream roles in 2023. Candidates are assessed entirely on competency, and applications from career changers increased by 34% in the first year.",
          "PwC, Deloitte, and EY have moved to strength-based and skills-based assessment. PwC explicitly states that they do not require a degree from any specific discipline.",
          "Unilever replaced CV screening with AI-powered games and video assessments that evaluate skills directly. They reported a 16% increase in workforce diversity and no decrease in performance.",
          "Amazon, Apple, and IBM have all made similar moves. IBM's CEO has publicly stated that skills, not degrees, are the future of hiring.",
          "This is not a temporary trend. It is a structural shift in how the labour market works, and it is overwhelmingly good news for career changers.",
        ],
      },
      {
        heading: "The skills that matter most in a skills-first world",
        content: [
          "In a skills-based hiring world, some competencies consistently command premiums across every industry. If you have these, you are already ahead.",
          "Problem-solving and critical thinking: the ability to break down complex situations, identify root causes, and develop practical solutions. This is developed through years of real-world experience, not academic study.",
          "Communication: written and verbal communication, presenting complex ideas clearly, adapting your message to different audiences. If you have managed stakeholders, presented to groups, or written reports, you have this.",
          "Adaptability: the ability to learn new things quickly, adjust to changing circumstances, and remain effective when plans change. Anyone who has worked through the past decade of disruption has this skill in abundance.",
          "Collaboration: working effectively with diverse teams, managing different personalities, building consensus. Team sport, not solo performance. Developed through years of working with real people.",
          "Leadership: not just managing; inspiring, mentoring, decision-making, and taking responsibility. This is one of the hardest skills to develop and one of the most valued. If you have led people in any context, you have it.",
        ],
        cta: {
          style: "button",
          text: "Discover My Career Matches",
          label: "See which skills-first employers want what you have",
        },
      },
    ],
    faq: [
      {
        q: "Does skills-based hiring mean degrees are worthless?",
        a: "No. Degrees still have value for specific professions (medicine, law, engineering) and can be a useful signal of ability. But for the majority of roles, demonstrated skills are becoming more important than academic credentials. The shift is away from degrees as a mandatory filter, not away from education itself.",
      },
      {
        q: "How do I know if a company uses skills-based hiring?",
        a: "Look at their job descriptions. If they list specific skills rather than requiring X years of experience in Y industry, they are likely using a skills-based approach. Many companies also mention it on their careers page or in their diversity and inclusion statements.",
      },
      {
        q: "Will ATS systems adapt to skills-based hiring?",
        a: "They already are. Modern ATS platforms like Lever and Greenhouse now include skills-matching features. The technology is catching up to the philosophy. In the meantime, using skills language in your CV helps you work with both traditional and modern systems.",
      },
      {
        q: "Is this trend here to stay?",
        a: "All indicators suggest yes. Skills shortages are structural, not cyclical. The data showing better outcomes from skills-based hires is robust. And major employers are investing heavily in skills assessment infrastructure. This is not a fad; it is the future of hiring.",
      },
    ],
  },
};

/* ─── Static Params ─── */
export function generateStaticParams() {
  return Object.keys(GUIDE_DATA).map((slug) => ({ slug }));
}

/* ─── Metadata ─── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = GUIDE_DATA[slug];
  if (!data) return { title: "Not Found" };

  return {
    title: data.metaTitle,
    description: data.metaDescription,
    alternates: {
      canonical: `https://matchmyskillset.com/career-change/${slug}`,
    },
  };
}

/* ─── Page ─── */
export default async function CareerChangeGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = GUIDE_DATA[slug];

  if (!data) notFound();

  const siteUrl = "https://matchmyskillset.com";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.metaDescription,
    url: `${siteUrl}/career-change/${slug}`,
    datePublished: data.publishedDate,
    dateModified: data.modifiedDate,
    author: {
      "@type": "Organization",
      name: "MatchMySkillset",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "MatchMySkillset",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/career-change/${slug}`,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/career-change" className="hover:text-indigo-600">
          Career Change Guides
        </Link>
        {" / "}
        <span className="text-gray-600">{data.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          {data.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{data.readTime}</span>
          <span>Updated {formatDate(data.modifiedDate)}</span>
        </div>
      </header>

      {/* Intro */}
      <div className="mb-10">
        {data.intro.map((p, i) => (
          <p key={i} className="text-lg text-gray-600 leading-relaxed mb-4">
            {p}
          </p>
        ))}
      </div>

      {/* Table of Contents */}
      <nav className="mb-12 bg-gray-50 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          In this guide
        </h2>
        <ul className="space-y-2">
          {data.sections.map((s, i) => (
            <li key={i}>
              <a
                href={`#section-${i}`}
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                {s.heading}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#faq"
              className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Frequently asked questions
            </a>
          </li>
        </ul>
      </nav>

      {/* Sections */}
      {data.sections.map((section, i) => (
        <section key={i} id={`section-${i}`} className="mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
            {section.heading}
          </h2>
          {section.content.map((p, j) => (
            <p key={j} className="text-gray-600 leading-relaxed mb-4">
              {p}
            </p>
          ))}

          {/* Inline CTA */}
          {section.cta && <InlineCTA cta={section.cta} />}
        </section>
      ))}

      {/* FAQ */}
      <section id="faq" className="mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
          Frequently asked questions
        </h2>
        <div className="space-y-6">
          {data.faq.map((item, i) => (
            <div
              key={i}
              className="border-b border-gray-100 pb-6 last:border-0"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                {item.q}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center bg-indigo-50 rounded-xl p-8 mb-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          Ready to find your next career?
        </h2>
        <p className="text-gray-500 mb-6">
          Our AI analyses your skills and experience to find careers you never
          knew existed. Free. 2 minutes.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Discover My Career Matches
        </Link>
      </section>

      {/* Related */}
      <footer className="border-t border-gray-100 pt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Related guides
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {Object.entries(GUIDE_DATA)
            .filter(([s]) => s !== slug)
            .map(([s, g]) => (
              <Link
                key={s}
                href={`/career-change/${s}`}
                className="text-sm text-indigo-600 hover:text-indigo-800 bg-gray-50 rounded-lg p-3 transition-colors"
              >
                {g.title}
              </Link>
            ))}
        </div>
        <div className="mt-6">
          <Link
            href="/careers-for"
            className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
          >
            Career change ideas by profession &rarr;
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* ─── CTA Component ─── */
function InlineCTA({
  cta,
}: {
  cta: { style: "button" | "box" | "inline"; text: string; label: string };
}) {
  if (cta.style === "button") {
    return (
      <div className="my-8 text-center">
        <p className="text-sm text-gray-500 mb-3">{cta.label}</p>
        <Link
          href="/discover"
          className="inline-flex items-center bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          {cta.text}
        </Link>
      </div>
    );
  }

  if (cta.style === "box") {
    return (
      <div className="my-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
        <p className="text-sm text-gray-700 mb-4">{cta.text}</p>
        <Link
          href="/discover"
          className="inline-flex items-center text-indigo-600 font-semibold text-sm hover:text-indigo-800 transition-colors"
        >
          {cta.label} &rarr;
        </Link>
      </div>
    );
  }

  // inline
  return (
    <p className="my-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-4 border-l-4 border-indigo-400">
      {cta.text}.{" "}
      <Link
        href="/discover"
        className="text-indigo-600 font-semibold hover:text-indigo-800 underline"
      >
        {cta.label}
      </Link>
    </p>
  );
}

/* ─── Helpers ─── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
