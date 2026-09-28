import Link from "next/link";
import { RouteCard, SourceNote } from "@/components/content";
import type { Licence } from "@/data/careers";
import { ASHE, type ResolvedRoute } from "./routes";

const LICENCE_KIND: Record<Licence["kind"], string> = {
  "statutory registration": "Registration",
  "statutory licence": "Licence",
  "required qualification": "Required qualification",
  "industry card": "Industry card",
};

const KEEP_CASE = ["Ofsted", "Civil Service", "Border Force", "HGV", "IT ", "GP ", "English", "CAD", "UX"];

/** A job title as it reads mid-sentence: "Data analyst" becomes "data analyst", "Ofsted inspector" stays. */
export function inSentence(title: string): string {
  if (KEEP_CASE.some((k) => title.startsWith(k))) return title;
  return title.charAt(0).toLowerCase() + title.slice(1);
}

/** Citation line for one route's ONS pay figure, with the unit-group caveat. */
export function RoutePaySource({ route }: { route: ResolvedRoute }) {
  if (route.median === null) return null;
  const basisText =
    route.basis === "ft"
      ? "Full-time median, UK."
      : "All-employee median including part-time jobs, UK: ONS did not publish a reliable full-time figure.";
  return (
    <SourceNote
      source={ASHE.short}
      href={ASHE.href}
      published={ASHE.published}
      note={
        <>
          {basisText} Covers the whole ONS unit group {route.soc} &quot;{route.socTitle}&quot;, not only{" "}
          {inSentence(route.title)} roles.
          {route.payNote ? ` ${route.payNote}` : null}
        </>
      }
    />
  );
}

/** The "way in" block for a route: apprenticeships, licences, degree, links. */
export function RouteWayIn({ route }: { route: ResolvedRoute }) {
  return (
    <>
      <ul className="space-y-1.5">
        {route.apprenticeships.map((s) => (
          <li key={s.referenceNumber}>
            Apprenticeship:{" "}
            <a href={s.url} className="link" rel="noopener">
              {s.title}
            </a>
            , level {s.level}, typically {s.typicalDurationMonths} months
          </li>
        ))}
        {route.licences.map((l) => (
          <li key={l.id}>
            {LICENCE_KIND[l.kind]}:{" "}
            <a href={l.sources[0].url} className="link" rel="noopener">
              {l.name}
            </a>{" "}
            ({l.body}
            {l.scope ? `, ${l.scope}` : ""})
          </li>
        ))}
        {route.qualifications.length > 0 && (
          <li>Qualifications named by the National Careers Service: {route.qualifications.join(", ")}</li>
        )}
        {route.checks.length > 0 && (
          <li>Checks the National Careers Service lists: {route.checks.join("; ")}.</li>
        )}
        {route.spec.note && <li>{route.spec.note}</li>}
        <li>
          Degree usually needed: <strong className="text-ink">{route.degreeUsuallyRequired ? "Yes" : "No"}</strong>
        </li>
        {route.median === null && (
          <li>Pay: {route.payNote ?? "ONS did not publish a reliable 2025 median for this group."}</li>
        )}
      </ul>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <Link href={route.jobsHref} className="link">
          Live {inSentence(route.title)} jobs
        </Link>
        {route.ncsUrl && (
          <a href={route.ncsUrl} className="link" rel="noopener">
            National Careers Service profile
          </a>
        )}
        {route.aiHref && (
          <a href={route.aiHref} className="link" rel="noopener">
            How exposed is it to AI?
          </a>
        )}
      </p>
    </>
  );
}

export interface HubRouteCardsProps {
  routes: ResolvedRoute[];
  /** The job people are leaving, shown on the route and in the pay chip ("vs secondary teacher"). */
  from: string;
  /** ONS full-time median for the job people are leaving. Leave out when ONS did not publish one. */
  fromPay?: number;
  headingLevel?: 3 | 4;
}

/**
 * One RouteCard per destination, each with ONS pay, the change against the
 * source job (full-time medians only, so the comparison is like for like),
 * why the skills carry over, the way in and useful links.
 */
export function HubRouteCards({ routes, from, fromPay, headingLevel = 3 }: HubRouteCardsProps) {
  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-2">
      {routes.map((r) => (
        <div key={r.id} id={r.anchor} className="scroll-mt-24">
          <RouteCard
            from={from}
            to={r.title}
            headingLevel={headingLevel}
            medianPay={r.median ?? undefined}
            fromPay={r.basis === "ft" ? fromPay : undefined}
            summary={r.spec.why}
            entryRoute={<RouteWayIn route={r} />}
            source={<RoutePaySource route={r} />}
            className="h-full"
          />
        </div>
      ))}
    </div>
  );
}
