import { ImageResponse } from "next/og";

// Default share image for every page that does not set its own. Brand colours
// come from the tokens in globals.css (paper, ink, accent, highlight).
export const alt = "MatchMySkillset: see where people like you go after leaving a job, and what it pays in the UK";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f3ea";
const INK = "#18201d";
const INK_2 = "#36403b";
const ACCENT = "#1b5e4b";
const ACCENT_SOFT = "#e1ece5";
const HIGHLIGHT = "#e0a030";
const RULE = "#b7ac98";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "64px 72px",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: `6px solid ${ACCENT}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 12, height: 12, borderRadius: 999, background: HIGHLIGHT }} />
          </div>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>MatchMySkillset</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -1.5, maxWidth: 980 }}>
            Leaving your job? See where people like you go.
          </div>
          <div style={{ fontSize: 32, color: INK_2, lineHeight: 1.35, maxWidth: 960 }}>
            UK career-change guides with official ONS pay data, real routes in, and a free CV analysis.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, border: `4px solid ${INK_2}`, background: PAPER }} />
          <div style={{ flex: 1, height: 0, borderTop: `4px dashed ${RULE}` }} />
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: ACCENT,
              boxShadow: `0 0 0 8px ${ACCENT_SOFT}`,
            }}
          />
          <div style={{ fontSize: 26, color: ACCENT, fontWeight: 700, marginLeft: 12 }}>matchmyskillset.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
