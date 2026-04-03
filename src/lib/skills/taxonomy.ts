import { SKILLS, type Skill, type SkillCategory } from "@/data/skills-taxonomy";

// Group skills by category
export function getSkillsByCategory(): Record<SkillCategory, Skill[]> {
  const grouped = {} as Record<SkillCategory, Skill[]>;
  for (const skill of SKILLS) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category].push(skill);
  }
  return grouped;
}

// Get category display name
export function getCategoryLabel(category: SkillCategory): string {
  const labels: Record<SkillCategory, string> = {
    communication: "Communication",
    analytical: "Analytical",
    technical: "Technical & IT",
    management: "Management & Leadership",
    interpersonal: "Interpersonal",
    creative: "Creative",
    physical: "Physical & Trades",
    financial: "Financial",
    digital: "Digital",
    scientific: "Scientific",
    legal: "Legal",
    education: "Education & Training",
    healthcare: "Healthcare",
    life: "Life Experience",
  };
  return labels[category] || category;
}

// Get category colour for UI
export function getCategoryColour(category: SkillCategory): string {
  const colours: Record<SkillCategory, string> = {
    communication: "bg-blue-100 text-blue-700",
    analytical: "bg-purple-100 text-purple-700",
    technical: "bg-cyan-100 text-cyan-700",
    management: "bg-orange-100 text-orange-700",
    interpersonal: "bg-green-100 text-green-700",
    creative: "bg-pink-100 text-pink-700",
    physical: "bg-amber-100 text-amber-700",
    financial: "bg-emerald-100 text-emerald-700",
    digital: "bg-indigo-100 text-indigo-700",
    scientific: "bg-teal-100 text-teal-700",
    legal: "bg-slate-100 text-slate-700",
    education: "bg-yellow-100 text-yellow-700",
    healthcare: "bg-red-100 text-red-700",
    life: "bg-amber-100 text-amber-800",
  };
  return colours[category] || "bg-gray-100 text-gray-700";
}
