// Turns what a job seeker types as their location (a town, a postcode, an
// outward code or a region) into something the job boards can search around,
// plus the UK region it is in. Server-side only.
//
// Uses postcodes.io (free, no key; ONS Postcode Directory and OS Open Names):
// /postcodes/<pc> for full postcodes, /outcodes/<oc> plus a reverse lookup for
// outward codes, and /places?q= for town names. Checked 28 September 2026:
// "leed" returns Leeds (City, Yorkshire and the Humber) first; its places
// search calls the East of England "Eastern". Results are cached for 30 days.

import { unstable_cache } from "next/cache";
import { UK_REGIONS, regionByName, type UkRegion } from "@/lib/apis/regions";

const API = "https://api.postcodes.io";
const TIMEOUT_MS = 3000;
const CACHE_SECONDS = 30 * 86_400;

export interface PlaceInfo {
  /** What the boards are asked to search around: a postcode, an outward code or a town. */
  query: string;
  /** What we show: "Leeds", "LS1 4AP (Leeds)", "South West". */
  label: string;
  /** Town or district, when known. */
  town: string | null;
  region: UkRegion | null;
  kind: "postcode" | "outcode" | "place" | "region";
}

export interface PlaceSuggestion {
  /** Text to put in the box. */
  value: string;
  /** Second line: county or district, and region. */
  detail: string;
  region: UkRegion | null;
}

const FULL_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i;
const OUTCODE = /^[A-Z]{1,2}\d[A-Z\d]?$/i;

function toRegion(region: string | null | undefined, country: string | null | undefined): UkRegion | null {
  const r = (region ?? "").trim();
  if (r.toLowerCase() === "eastern") return "East of England";
  return regionByName(r) ?? regionByName((country ?? "").trim());
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`postcodes.io HTTP ${res.status}`);
  return (await res.json()) as T;
}

interface PcResult {
  postcode: string;
  region: string | null;
  country: string | null;
  admin_district: string | null;
}

interface PlaceRow {
  name_1?: string;
  name_2?: string | null;
  local_type?: string;
  county_unitary?: string | null;
  district_borough?: string | null;
  region?: string | null;
  country?: string | null;
}

const TIER: Record<string, number> = { City: 0, Town: 1, "Suburban Area": 2, Village: 3, "Other Settlement": 4, Hamlet: 5 };

function placeRank(p: PlaceRow): number {
  return TIER[p.local_type ?? ""] ?? 9;
}

const lookupPostcode = unstable_cache(
  async (pc: string): Promise<PcResult | null> => {
    const data = await getJson<{ result?: PcResult }>(`${API}/postcodes/${encodeURIComponent(pc)}`);
    return data?.result ?? null;
  },
  ["mms-loc-postcode-v1"],
  { revalidate: CACHE_SECONDS }
);

const lookupOutcode = unstable_cache(
  async (oc: string): Promise<{ town: string | null; region: UkRegion | null } | null> => {
    const data = await getJson<{ result?: { admin_district?: string[]; latitude?: number; longitude?: number; country?: string[] } }>(
      `${API}/outcodes/${encodeURIComponent(oc)}`
    );
    const r = data?.result;
    if (!r) return null;
    let region: UkRegion | null = null;
    if (typeof r.latitude === "number" && typeof r.longitude === "number") {
      const near = await getJson<{ result?: PcResult[] | null }>(
        `${API}/postcodes?${new URLSearchParams({ lon: String(r.longitude), lat: String(r.latitude), limit: "1", radius: "2000" })}`
      );
      const first = near?.result?.[0];
      if (first) region = toRegion(first.region, first.country);
    }
    if (!region) region = toRegion(null, r.country?.[0]);
    return { town: r.admin_district?.[0] ?? null, region };
  },
  ["mms-loc-outcode-v1"],
  { revalidate: CACHE_SECONDS }
);

const searchPlaces = unstable_cache(
  async (q: string): Promise<PlaceRow[]> => {
    const data = await getJson<{ result?: PlaceRow[] | null }>(`${API}/places?${new URLSearchParams({ q, limit: "40" })}`);
    return (data?.result ?? []).filter((p) => p.name_1 && (TIER[p.local_type ?? ""] ?? 9) <= 5);
  },
  ["mms-loc-places-v1"],
  { revalidate: CACHE_SECONDS }
);

function tidy(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 80);
}

/**
 * Resolves a typed location. `regionHint` is the region of the suggestion the
 * person picked, if they picked one (it settles towns with the same name in
 * two regions, such as Newport). Returns null for empty input; for input it
 * cannot place it still returns the text as a place with no region, because
 * the boards may understand it even when postcodes.io does not.
 */
export async function resolveLocation(text: unknown, regionHint?: unknown): Promise<PlaceInfo | null> {
  if (typeof text !== "string") return null;
  const raw = tidy(text.replace(/[^\p{L}\p{N} ,.'-]/gu, " "));
  if (raw.length < 2 || /^(uk|united kingdom|anywhere|remote|home)$/i.test(raw)) return null;
  const hint = typeof regionHint === "string" && (UK_REGIONS as readonly string[]).includes(regionHint) ? (regionHint as UkRegion) : null;

  const asRegion = regionByName(raw);
  if (asRegion && asRegion !== "London") return { query: asRegion, label: asRegion, town: null, region: asRegion, kind: "region" };

  try {
    const full = FULL_POSTCODE.exec(raw);
    if (full) {
      const pc = `${full[1]} ${full[2]}`.toUpperCase();
      const r = await lookupPostcode(pc.replace(" ", ""));
      if (r) {
        const town = r.admin_district ?? null;
        return { query: pc, label: town ? `${pc} (${town})` : pc, town, region: toRegion(r.region, r.country), kind: "postcode" };
      }
      return { query: pc, label: pc, town: null, region: hint, kind: "postcode" };
    }
    if (OUTCODE.test(raw)) {
      const oc = raw.toUpperCase();
      const r = await lookupOutcode(oc);
      if (r) return { query: oc, label: r.town ? `${oc} (${r.town})` : oc, town: r.town, region: hint ?? r.region, kind: "outcode" };
    }
    const name = raw.split(",")[0].trim();
    const rows = await searchPlaces(name);
    const exact = rows.filter((p) => [p.name_1, p.name_2].some((n) => n?.toLowerCase() === name.toLowerCase()));
    const pool = (exact.length ? exact : []).sort((a, b) => placeRank(a) - placeRank(b));
    const best = pool[0];
    if (best) {
      const topTier = placeRank(best);
      const regions = new Set(pool.filter((p) => placeRank(p) === topTier).map((p) => toRegion(p.region, p.country)));
      const region = hint ?? (regions.size === 1 ? [...regions][0] : null);
      const town = best.name_1 ?? name;
      return { query: town, label: town, town, region, kind: "place" };
    }
  } catch (err) {
    console.warn("[location] lookup failed:", err instanceof Error ? err.message : err);
  }
  const fallback = raw.split(",")[0].trim();
  return { query: fallback, label: fallback, town: fallback, region: hint, kind: "place" };
}

/** Up to six UK towns and cities starting with what was typed, biggest places first. */
export async function suggestPlaces(q: string): Promise<PlaceSuggestion[]> {
  const text = tidy(q).replace(/[^\p{L} '-]/gu, "");
  if (text.length < 2) return [];
  const rows = await searchPlaces(text.toLowerCase());
  const seen = new Set<string>();
  const out: PlaceSuggestion[] = [];
  for (const p of [...rows].sort((a, b) => placeRank(a) - placeRank(b))) {
    const name = p.name_1!;
    const area = p.county_unitary || p.district_borough || "";
    const region = toRegion(p.region, p.country);
    const key = `${name}|${area}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const detail = [area && area !== name ? area : "", region ?? p.country ?? ""].filter(Boolean).join(", ");
    out.push({ value: name, detail, region });
    if (out.length >= 6) break;
  }
  return out;
}
