// Environment values in this stack are not always clean. Several production
// values end in a real line feed, and some copies end in a literal "\n" (a
// backslash followed by n). Either one silently breaks an API key.

/**
 * Cleans a raw environment value: strips any trailing literal "\n" / "\r"
 * sequences, real newlines and surrounding whitespace.
 *
 * Use this directly for NEXT_PUBLIC_* values in client components, because
 * Next only inlines `process.env.NEXT_PUBLIC_X` when it is written out in full:
 *   cleanEnv(process.env.NEXT_PUBLIC_GA_ID)
 */
export function cleanEnv(value: string | undefined | null): string {
  return (value ?? "").replace(/(?:\\[nr]|\s)+$/, "").trim();
}

/**
 * Reads and cleans a server-side environment variable by name.
 * Returns "" when it is unset. Server code only: a dynamic process.env lookup
 * is not inlined into client bundles.
 */
export function env(name: string): string {
  return cleanEnv(process.env[name]);
}
