import { formatGBP, isNumber, periodText, type PayPeriod } from "./format";

/** Props for {@link SalaryFigure}. */
export interface SalaryFigureProps {
  /** Amount in pounds. If it is missing or not a finite number, nothing renders. */
  value?: number | null;
  /** Pay period. Defaults to "year". Hourly figures keep pence. */
  period?: PayPeriod;
  /** Show "a year" / "an hour" after the figure. Defaults to true. */
  showPeriod?: boolean;
  /** Prefix with "about" for rounded or estimated figures. */
  approximate?: boolean;
  /** Visual size. `sm` inline in text, `xl` for a headline number. Defaults to `md`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Colour of the number. Defaults to `ink`. `highlight` puts it on a soft green pill. */
  tone?: "ink" | "accent" | "highlight";
  /** Extra classes for the wrapper. */
  className?: string;
}

const SIZE: Record<NonNullable<SalaryFigureProps["size"]>, string> = {
  sm: "text-[1em]",
  md: "text-[21px] tracking-[-0.02em]",
  lg: "text-[30px] tracking-[-0.03em]",
  xl: "text-[48px] tracking-[-0.04em]",
};

const TONE: Record<NonNullable<SalaryFigureProps["tone"]>, string> = {
  ink: "text-ink",
  accent: "text-link",
  highlight: "text-green bg-green-soft px-2 rounded-full",
};

/**
 * A pound figure with tabular, lining numerals so columns of pay line up.
 * Uses `<data value>` so the raw number is machine readable.
 * Never pass a figure you cannot cite: pair it with a {@link SourceNote}.
 */
export function SalaryFigure({
  value,
  period = "year",
  showPeriod = true,
  approximate = false,
  size = "md",
  tone = "ink",
  className = "",
}: SalaryFigureProps) {
  if (!isNumber(value)) return null;
  const weight = size === "sm" ? "font-semibold" : "font-bold";
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 ${className}`}>
      {approximate && <span className="text-mute">about</span>}
      <data
        value={value}
        className={`whitespace-nowrap tabular-nums lining-nums ${weight} ${SIZE[size]} ${TONE[tone]}`}
      >
        {formatGBP(value, period)}
      </data>
      {showPeriod && (
        <span className={size === "sm" ? "" : "text-sm text-mute"}>{periodText(period)}</span>
      )}
    </span>
  );
}
