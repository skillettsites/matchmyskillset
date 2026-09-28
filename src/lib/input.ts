// Small helpers for validating untrusted request input in route handlers.

/** Replaces control characters, collapses whitespace, trims and caps the length. */
export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  let out = "";
  for (const ch of value.slice(0, maxLength * 2)) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 0x20 || (code >= 0x7f && code < 0xa0) ? " " : ch;
  }
  return out
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

/** Returns the URL string if it is an absolute http(s) URL within maxLength, else null. */
export function cleanHttpUrl(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || value.length === 0 || value.length > maxLength) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
