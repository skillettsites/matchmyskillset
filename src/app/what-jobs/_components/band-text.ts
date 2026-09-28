import { formatGBP } from "@/components/content";
import { lcFirst, type SocRow } from "@/components/guides/pay";

/** "train driver (£76,327), railway signaller (£57,088) and ..." for FAQ answers. */
export function listRows(rows: SocRow[], n = 5): string {
  const items = rows.slice(0, n).map((r) => `${lcFirst(r.name)} (${formatGBP(r.median ?? 0)})`);
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function bracketText(bracket: [number, number] | null): string {
  if (!bracket) return "";
  const [a, b] = bracket;
  return `between ${a}% and ${b}%`;
}
