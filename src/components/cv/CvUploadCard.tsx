/*
 * PLACEHOLDER, owned by agent B (candidate side).
 * ------------------------------------------------
 * Agent A (design) created this stand-in so the homepage hero builds and can
 * be screenshotted. It posts nowhere: the button is a link to /discover.
 * At merge, agent B's real CvUploadCard (same path, same props) replaces this
 * file entirely.
 */
import Link from "next/link";

export interface CvUploadCardProps {
  variant?: "hero" | "page";
}

export function CvUploadCard({ variant = "page" }: CvUploadCardProps) {
  const id = `cv-${variant}`;
  return (
    <div className="card-white p-5 text-left sm:p-7">
      <p className="field-label">Upload your CV</p>
      <label
        htmlFor={`${id}-file`}
        className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-snow px-4 py-5 text-center transition-colors hover:border-blue hover:bg-sky"
      >
        <span className="text-[15px] font-semibold text-ink">Choose a file</span>
        <span className="text-[13px] text-mute">PDF, Word (.docx) or text, up to 5 MB</span>
        <input id={`${id}-file`} type="file" accept=".pdf,.docx,.txt" className="sr-only" />
      </label>

      <label htmlFor={`${id}-text`} className="field-label mt-6">
        Or paste it
      </label>
      <textarea id={`${id}-text`} className="field min-h-[120px] resize-y" placeholder="Paste your CV here" />

      <label htmlFor={`${id}-where`} className="field-label mt-6">
        Where do you want to work?
      </label>
      <input id={`${id}-where`} className="field" placeholder="Town, city or postcode" autoComplete="address-level2" />

      <Link href="/discover" className="btn btn-primary btn-lg mt-7 w-full">
        Match my CV
      </Link>
      <p className="mt-3 text-center text-[13px] text-mute">Free. No account needed.</p>
    </div>
  );
}
export default CvUploadCard;
