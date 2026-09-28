/** Props for {@link JsonLd}. */
export interface JsonLdProps {
  /**
   * A schema.org object (or an array of them). It is serialised with
   * `JSON.stringify` and every `<` is escaped to `<`, as the Next.js
   * JSON-LD guide recommends, so page copy cannot break out of the tag.
   */
  data: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Renders structured data as a native `<script type="application/ld+json">`.
 * Server component; safe to use in layouts, pages and other components.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
