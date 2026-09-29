import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NotSwitchedOnError } from "@/lib/candidate/db";
import { getPack, toView } from "@/lib/candidate/packs";
import type { InterviewPrep, TailoredCv } from "@/lib/candidate/pack-types";
import { PrintButton } from "./PrintButton";

// A print-ready page for an approved pack: the browser's print window saves
// it as a PDF. Site header, footer and cookie banner are hidden when printing.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Print",
  robots: { index: false, follow: false },
};

const PRINT_CSS = `
.doc { font-family: Calibri, "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1d1d1f; font-size: 10.5pt; line-height: 1.4; letter-spacing: 0; }
.doc h1 { font-size: 22pt; line-height: 1.1; margin: 0 0 2pt; letter-spacing: -0.01em; }
.doc .contact { color: #6e6e73; font-size: 9.5pt; margin: 0 0 8pt; }
.doc h2 { font-family: inherit; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.04em; color: #0071e3; border-bottom: 1px solid #d2d2d7; padding-bottom: 2pt; margin: 14pt 0 5pt; }
.doc h3 { font-size: 10.5pt; margin: 8pt 0 0; letter-spacing: 0; }
.doc .meta { color: #6e6e73; font-style: italic; font-size: 9.5pt; margin: 1pt 0 3pt; }
.doc p { margin: 0 0 5pt; }
.doc ul { margin: 2pt 0 4pt; padding-left: 14pt; list-style: disc; }
.doc li { margin: 0 0 2pt; }
.doc .letter p { margin: 0 0 10pt; white-space: pre-line; }
@page { size: A4; margin: 16mm 18mm; }
@media print {
  body > header, body > footer, body > a.skip-link, [aria-label="Cookie choice"], .no-print { display: none !important; }
  body { background: #fff !important; }
  main { overflow: visible !important; }
  .sheet { box-shadow: none !important; border: 0 !important; padding: 0 !important; margin: 0 !important; max-width: none !important; }
  .doc h2, .doc h3 { break-after: avoid; }
  .doc li, .doc p { break-inside: avoid; }
}
`;

function contactLine(cv: TailoredCv): string {
  const c = cv.contact;
  return [c.location, c.phone, c.email, ...c.links].filter(Boolean).join("  |  ");
}

function CvDoc({ cv }: { cv: TailoredCv }) {
  return (
    <div className="doc">
      {cv.contact.name && <h1>{cv.contact.name}</h1>}
      {contactLine(cv) && <p className="contact">{contactLine(cv)}</p>}
      {cv.summary && (
        <>
          <h2>Profile</h2>
          <p>{cv.summary}</p>
        </>
      )}
      {cv.keySkills.length > 0 && (
        <>
          <h2>Key skills</h2>
          <ul>
            {cv.keySkills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {cv.experience.length > 0 && (
        <>
          <h2>Experience</h2>
          {cv.experience.map((r, i) => (
            <div key={i}>
              <h3>
                {r.title || r.employer}
                {r.title && r.employer ? <span style={{ fontWeight: 400 }}>, {r.employer}</span> : null}
              </h3>
              {(r.dates || r.location) && <p className="meta">{[r.dates, r.location].filter(Boolean).join("  |  ")}</p>}
              {r.bullets.length > 0 && (
                <ul>
                  {r.bullets.map((b, k) => (
                    <li key={k}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}
      {cv.education.length > 0 && (
        <>
          <h2>Education</h2>
          {cv.education.map((e, i) => (
            <p key={i}>
              <strong>{e.qualification || e.institution}</strong>
              {e.qualification && e.institution ? `, ${e.institution}` : ""}
              {e.dates ? <span style={{ color: "#6e6e73" }}>{`  |  ${e.dates}`}</span> : null}
            </p>
          ))}
        </>
      )}
      {cv.certifications.length > 0 && (
        <>
          <h2>Certifications</h2>
          <ul>
            {cv.certifications.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </>
      )}
      {cv.otherSections.map((s) => (
        <div key={s.heading}>
          <h2>{s.heading}</h2>
          <ul>
            {s.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function LetterDoc({ cv, letter, title, company }: { cv: TailoredCv | null; letter: string; title: string; company: string }) {
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/London" });
  return (
    <div className="doc">
      {cv?.contact.name && <h1>{cv.contact.name}</h1>}
      {cv && contactLine(cv) && <p className="contact">{contactLine(cv)}</p>}
      <p style={{ margin: "18pt 0 14pt" }}>{date}</p>
      <p style={{ fontWeight: 700, marginBottom: "14pt" }}>
        Application for {title}
        {company ? `, ${company}` : ""}
      </p>
      <div className="letter">
        {letter
          .split(/\n\s*\n/)
          .filter((b) => b.trim())
          .map((b, i) => (
            <p key={i}>{b.trim()}</p>
          ))}
      </div>
    </div>
  );
}

function PrepDoc({ prep, title, company }: { prep: InterviewPrep; title: string; company: string }) {
  return (
    <div className="doc">
      <h1>Interview prep: {title}</h1>
      {company && <p className="contact">{company}</p>}
      <h2>Questions they may ask</h2>
      {prep.questions.map((q, i) => (
        <div key={i}>
          <h3>
            {i + 1}. {q.question}
          </h3>
          {q.whyTheyAsk && <p className="meta">{q.whyTheyAsk}</p>}
          <ul>
            {q.answerPoints.map((a, k) => (
              <li key={k}>{a}</li>
            ))}
          </ul>
        </div>
      ))}
      {prep.questionsToAsk.length > 0 && (
        <>
          <h2>Questions to ask them</h2>
          <ul>
            {prep.questionsToAsk.map((q) => (
              <li key={q}>{q}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default async function PrintPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ doc?: string }> }) {
  const { token } = await params;
  const { doc = "cv" } = await searchParams;
  let row;
  try {
    row = await getPack(token);
  } catch (err) {
    if (err instanceof NotSwitchedOnError) notFound();
    throw err;
  }
  if (!row) notFound();
  const view = toView(row);
  if (!view.approvedAt) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-24 text-center sm:px-6">
        <h1 className="headline">Approve your pack first.</h1>
        <p className="lede mt-4">Open your pack, check every section, then press Approve. Your downloads open after that.</p>
        <a href={`/packs/${token}`} className="btn btn-primary mt-8">
          Back to your pack
        </a>
      </div>
    );
  }
  const body =
    doc === "letter" && view.coverLetter ? (
      <LetterDoc cv={view.tailoredCv} letter={view.coverLetter} title={view.job.title} company={view.job.company} />
    ) : doc === "prep" && view.interviewPrep ? (
      <PrepDoc prep={view.interviewPrep} title={view.job.title} company={view.job.company} />
    ) : view.tailoredCv ? (
      <CvDoc cv={view.tailoredCv} />
    ) : null;
  if (!body) notFound();

  return (
    <div className="bg-cloud px-4 py-8 sm:py-12">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div className="no-print mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3">
        <a href={`/packs/${token}`} className="text-[15px] text-link hover:underline">
          Back to your pack
        </a>
        <PrintButton />
      </div>
      <article className="sheet mx-auto max-w-[210mm] rounded-[6px] bg-white p-[16mm] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)]">{body}</article>
      <p className="no-print mx-auto mt-4 max-w-[210mm] text-center text-[13px] text-mute">In the print window, choose &ldquo;Save as PDF&rdquo; as the printer.</p>
    </div>
  );
}
