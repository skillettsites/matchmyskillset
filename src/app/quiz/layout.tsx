import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What Career Suits Me? Free Career Quiz | MatchMySkillset",
  description:
    "Take our free career quiz to discover which career path matches your personality, skills, and work style. 10 questions, 2 minutes, no sign-up required. Find careers you never knew existed.",
  keywords: [
    "what career suits me",
    "career quiz",
    "what job should I do",
    "career test free",
    "career personality test",
    "job quiz UK",
  ],
  openGraph: {
    title: "What Career Suits Me? Free Career Quiz",
    description:
      "10 quick questions to discover which career path matches your personality and skills. Free, no sign-up required.",
    type: "website",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
