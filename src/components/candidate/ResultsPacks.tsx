import Link from "next/link";
import { listResultsPacks } from "@/lib/candidate/packs";

/**
 * Job packs made from this results page, in the results side panel, so
 * someone without an account can find theirs again. Renders nothing when
 * there are none (or before migration 009).
 */
export async function ResultsPacks({ token }: { token: string }) {
  const packs = await listResultsPacks(token);
  if (packs.length === 0) return null;
  return (
    <aside className="card-white p-5 sm:p-6" aria-labelledby="results-packs-title">
      <h3 id="results-packs-title" className="text-[19px] font-semibold tracking-[-0.02em] text-ink">
        Your job packs
      </h3>
      <ul className="mt-3 space-y-2">
        {packs.slice(0, 8).map((p) => (
          <li key={p.token}>
            <Link href={`/packs/${p.token}`} className="text-[15px] font-medium text-link hover:underline">
              {p.title}
            </Link>
            <span className="block text-[13px] text-mute">
              {[p.company, p.approved ? "Approved" : p.status === "ready" ? "Ready to check" : p.status === "failed" ? "Needs attention" : "Being written"].filter(Boolean).join(" · ")}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
