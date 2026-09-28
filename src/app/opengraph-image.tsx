import { ImageResponse } from "next/og";

// Default share image for every page that does not set its own, in the v3
// look: white, a soft colour wash, the gradient mark and one bold line.
export const alt = "MatchMySkillset: upload your CV and see live UK jobs scored against your skills";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1d1d1f";
const MUTE = "#6e6e73";

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
          padding: "64px 72px",
          color: INK,
          backgroundColor: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at 88% 8%, rgba(125,76,219,0.22), rgba(255,255,255,0) 42%), radial-gradient(circle at 70% 0%, rgba(10,124,255,0.22), rgba(255,255,255,0) 45%), radial-gradient(circle at 100% 60%, rgba(18,181,164,0.18), rgba(255,255,255,0) 40%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#12b5a4" />
                <stop offset="0.5" stopColor="#0a7cff" />
                <stop offset="1" stopColor="#7d4cdb" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#g)" />
            <circle cx="15.5" cy="20" r="7.4" fill="none" stroke="#fff" strokeOpacity="0.72" strokeWidth="3.4" />
            <circle cx="24.5" cy="20" r="7.4" fill="none" stroke="#fff" strokeWidth="3.4" />
          </svg>
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>MatchMySkillset</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4 }}>Your CV.</div>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1.02, letterSpacing: -4, color: "#0071e3" }}>
            Matched to real jobs.
          </div>
          <div style={{ marginTop: 28, fontSize: 32, color: MUTE, lineHeight: 1.35, maxWidth: 920 }}>
            Live UK jobs scored against your skills, plus the careers that fit you and what they pay.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: MUTE }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#30d158" }} />
          <div>matchmyskillset.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
