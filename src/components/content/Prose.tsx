import type { ReactNode } from "react";

/** Props for {@link Prose}. */
export interface ProseProps {
  /** Plain HTML content: p, h2, h3, ul, ol, blockquote, a, strong, hr. */
  children: ReactNode;
  /** Element to render. Defaults to "div". */
  as?: "div" | "article" | "section";
  /** Remove the reading-width cap (for pages with their own column). */
  fullWidth?: boolean;
  /** Extra classes. */
  className?: string;
}

/**
 * Long-form text wrapper. Styles plain elements (bold display h2 and h3,
 * blue links, blue-ruled quotes) at a comfortable reading width, so content
 * pages can write semantic HTML without utility classes on every tag.
 */
export function Prose({ children, as: Tag = "div", fullWidth = false, className = "" }: ProseProps) {
  return <Tag className={`prose-mms ${fullWidth ? "max-w-none" : ""} ${className}`}>{children}</Tag>;
}
