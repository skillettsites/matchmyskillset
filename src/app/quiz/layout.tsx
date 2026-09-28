import type { Metadata } from "next";
import { guideMetadata } from "@/components/guides/meta";

export const metadata: Metadata = guideMetadata({
  path: "/quiz",
  title: "Free career quiz: what job suits me? | MatchMySkillset",
  description:
    "Ten quick questions about how you like to work, then UK careers that fit, with ONS pay. Free, no sign-up, about two minutes.",
  ogType: "website",
});

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
