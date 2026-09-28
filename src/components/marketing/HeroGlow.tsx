/**
 * The soft colour glow behind heroes and closing calls to action. Put it
 * inside a `relative overflow-hidden` parent, before the content, and give
 * the content `relative` so it sits on top.
 *
 *   <section className="relative overflow-hidden">
 *     <HeroGlow top="-8%" opacity={0.18} />
 *     <div className="relative">...</div>
 *   </section>
 *
 * It is still by default. `drift` adds WBYI's slow 18s drift, which keeps the
 * page repainting and costs mobile Lighthouse speed index, so use it sparingly.
 */
export function HeroGlow({
  top = "-8%",
  opacity = 0.18,
  drift = false,
  className = "",
}: {
  /** CSS top offset, e.g. "-8%" (hero) or "20%" (closing band). */
  top?: string;
  /** 0.12 to 0.28 reads well; the WBYI homepage uses 0.28, forms 0.18. */
  opacity?: number;
  drift?: boolean;
  className?: string;
}) {
  return <div className={`hero-glow ${drift ? "hero-glow-drift" : ""} ${className}`} style={{ top, opacity }} aria-hidden="true" />;
}
