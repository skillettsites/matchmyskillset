// Works out which UK region a job advert's location is in, for boards that
// cannot filter by region themselves (Reed). Server-side only.
//
// Uses postcodes.io (free, no key; ONS Postcode Directory and OS Open Names
// data): full postcodes through its bulk lookup, and town names through its
// places search, kept only when every place with that exact name is in the same
// region. Anything it cannot place, or any failure, gives null, and the caller
// drops the advert from a region search rather than risk showing the wrong area.

import { unstable_cache } from "next/cache";
import { UK_REGIONS, regionByName, type UkRegion } from "@/lib/apis/regions";

const API = "https://api.postcodes.io";
const TIMEOUT_MS = 3000;
const MAX_PLACE_LOOKUPS = 30;
const CACHE_SECONDS = 30 * 86_400;

const FULL_POSTCODE = /\b([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})\b/i;

/** postcodes.io gives the English region, or an empty region and the country for Wales, Scotland and Northern Ireland. */
function toRegion(region: string | null | undefined, country: string | null | undefined): UkRegion | null {
  const name = (region ?? "").trim() || (country ?? "").trim();
  if (!name) return null;
  return UK_REGIONS.find((r) => r.toLowerCase() === name.toLowerCase()) ?? null;
}

interface PostcodeResult {
  query: string;
  result: { region: string | null; country: string | null } | null;
}

const postcodeRegions = unstable_cache(
  async (postcodes: string[]): Promise<Record<string, UkRegion | null>> => {
    const res = await fetch(`${API}/postcodes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postcodes }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`postcodes.io HTTP ${res.status}`);
    const data = (await res.json()) as { result?: PostcodeResult[] };
    const out: Record<string, UkRegion | null> = {};
    for (const r of data.result ?? []) out[r.query] = r.result ? toRegion(r.result.region, r.result.country) : null;
    return out;
  },
  ["mms-postcode-region-v1"],
  { revalidate: CACHE_SECONDS }
);

interface PlaceResult {
  name_1?: string;
  name_2?: string | null;
  local_type?: string;
  region?: string | null;
  country?: string | null;
}

const SETTLEMENT_TYPES = new Set(["City", "Town", "Village", "Hamlet", "Suburban Area", "Other Settlement"]);

const placeRegion = unstable_cache(
  async (name: string): Promise<UkRegion | null> => {
    const url = `${API}/places?${new URLSearchParams({ q: name, limit: "50" })}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!res.ok) throw new Error(`postcodes.io HTTP ${res.status}`);
    const data = (await res.json()) as { result?: PlaceResult[] | null };
    const want = name.toLowerCase();
    const regions = new Set<UkRegion | null>();
    for (const p of data.result ?? []) {
      const names = [p.name_1, p.name_2].filter(Boolean).map((n) => n!.toLowerCase());
      if (!names.includes(want) || !SETTLEMENT_TYPES.has(p.local_type ?? "")) continue;
      regions.add(toRegion(p.region, p.country));
    }
    // One region only: a name shared by places in two regions (Newport, Richmond) stays unknown.
    return regions.size === 1 ? [...regions][0] : null;
  },
  ["mms-place-region-v1"],
  { revalidate: CACHE_SECONDS }
);

function normalisePostcode(outward: string, inward: string): string {
  return `${outward} ${inward}`.toUpperCase();
}

/**
 * The region of each location string (keys are the strings passed in).
 * Locations that cannot be placed map to null.
 */
export async function regionsForLocations(locations: string[]): Promise<Map<string, UkRegion | null>> {
  const out = new Map<string, UkRegion | null>();
  const postcodeOf = new Map<string, string>();
  const placeOf = new Map<string, string[]>();

  for (const loc of new Set(locations)) {
    const text = loc.trim();
    if (/\blondon\b/i.test(text)) {
      out.set(loc, "London");
      continue;
    }
    const named = regionByName(text);
    if (named) {
      out.set(loc, named);
      continue;
    }
    const pc = FULL_POSTCODE.exec(text);
    if (pc) {
      postcodeOf.set(loc, normalisePostcode(pc[1], pc[2]));
      continue;
    }
    const parts = text
      .split(",")
      .map((p) => p.trim())
      .filter((p) => /^[A-Za-z][A-Za-z .'-]{1,40}$/.test(p));
    if (parts.length) placeOf.set(loc, parts);
    else out.set(loc, null);
  }

  if (postcodeOf.size) {
    const codes = [...new Set(postcodeOf.values())].sort().slice(0, 100);
    let found: Record<string, UkRegion | null> = {};
    try {
      found = await postcodeRegions(codes);
    } catch (err) {
      console.warn("[jobs] postcode lookup failed:", err instanceof Error ? err.message : err);
    }
    for (const [loc, code] of postcodeOf) out.set(loc, found[code] ?? null);
  }

  if (placeOf.size) {
    const names = [...new Set([...placeOf.values()].flat())].slice(0, MAX_PLACE_LOOKUPS);
    const settled = await Promise.allSettled(names.map((n) => placeRegion(n)));
    const byName = new Map<string, UkRegion | null>();
    names.forEach((n, i) => {
      const r = settled[i];
      byName.set(n, r.status === "fulfilled" ? r.value : null);
      if (r.status === "rejected") console.warn("[jobs] place lookup failed:", r.reason instanceof Error ? r.reason.message : r.reason);
    });
    for (const [loc, parts] of placeOf) {
      const known = parts.map((p) => regionByName(p) ?? byName.get(p) ?? null).filter((r): r is UkRegion => r !== null);
      // Every part that could be placed must agree ("Portbury, Bristol").
      out.set(loc, known.length && known.every((r) => r === known[0]) ? known[0] : null);
    }
  }

  return out;
}
