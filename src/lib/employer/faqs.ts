import type { FaqItem } from "@/components/employer/Faq";
import { JOBS_EMAIL, LISTING_DAYS } from "./plans";

export const EMPLOYER_FAQS: FaqItem[] = [
  {
    q: "How does the matching work?",
    a: "When you save a job we read the skills in your title and description against the same list of skills we use to read CVs. Job seekers see your job with a match score based on how many of those skills their CV shows, and so do you. Skills in the job title count double. The score comes from a fixed formula, so the same advert and the same profile always give the same number.",
  },
  {
    q: "Who checks the jobs?",
    a: "A person checks every job before it goes live. We look for a real vacancy, a clear description of the work, a lawful advert and a working way to apply. If something needs changing, we email you the reason and you can edit and resubmit it.",
  },
  {
    q: "How long does a job stay live?",
    a: `${LISTING_DAYS} days from approval. You can renew it from your dashboard for another ${LISTING_DAYS} days, or close it early to free up a listing on your plan.`,
  },
  {
    q: "Where do applications go?",
    a: "By default candidates apply through MatchMySkillset: each application arrives in your dashboard with the CV, the match score and the skills they share with the role, and we email you straight away. If you prefer, send applicants to your own careers page or an email address instead.",
  },
  {
    q: "Can I search for candidates?",
    a: "Yes, on Starter, Growth and Enterprise, but only people who have chosen to be found. You see an anonymous profile: headline, current role, region, years of experience and skills. You can ask to contact them, with a short message. If they accept, we share their name, email address and CV with you. If they decline, you are not told who they are.",
  },
  {
    q: "What is the recruiter shortlist?",
    a: "It comes with Growth and Enterprise. Once your job is live, one of our experienced recruiters reviews the people who applied and the people who asked employers to find them, and sends you the best fits for the role, in order, with a short note on each. We email you when it is ready and it appears in your dashboard. People who applied are shown in full; people who have not applied stay anonymous until they accept your request to contact them. It is a recruiter's judgement to help you decide who to talk to first, not a promise of a hire.",
  },
  {
    q: "What can I not post?",
    a: "Jobs must be real UK vacancies that follow UK employment and equality law. No discriminatory wording, no fees to apply, no recruitment for pyramid schemes, and no adverts that hide commission-only pay. The full list is in our terms.",
  },
  {
    q: "How do payments and cancelling work?",
    a: `Lite, Starter and Growth are monthly subscriptions paid by card through Stripe. There is no minimum term: cancel any time and your plan runs to the end of the month you have paid for. Enterprise and pay per hire are agreed with you directly. Flintstone Associates clients can ask about partner rates: once we have agreed one, it is the monthly price you pay by card. If card payments are not open when you sign up, email ${JOBS_EMAIL} and we will set you up the same day.`,
  },
  {
    q: "Do job seekers pay anything?",
    a: "No. Searching, applying and being found are free for job seekers.",
  },
];
