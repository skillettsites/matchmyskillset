import { NextRequest, NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/api-guard";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { SITE_URL } from "@/components/site";
import { getCareerOccupation } from "@/data/careers";
import { isMatchesDoc } from "@/lib/skills/profile";
import { TOKEN_PATTERN, getReportByToken } from "@/lib/apis/reports-db";
import {
  DIGITAL_CONSENT_TEXT,
  REPORT_PRICE_PENCE,
  REPORT_PRODUCT,
  getStripe,
  isStripeConfigError,
} from "@/lib/apis/stripe";

// Guest checkout for the one-off Career Change Report (no account, Stripe
// collects the email). The buyer must first tick the box agreeing to
// immediate supply of digital content; that consent travels in the session
// metadata and is stored with the purchase.

export const runtime = "nodejs";

const UNAVAILABLE =
  "Reports are temporarily unavailable while we sort out our card payments. Your free results are not affected. Please try again later.";

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { allowed, retryAfter } = await checkRateLimit(`checkout:${clientIp(request)}`, 20, 3600);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(retryAfter) } });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse((await request.text()).slice(0, 4000));
    body = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token : "";
  const occupationId = typeof body.occupationId === "string" ? body.occupationId.slice(0, 80) : "";
  if (!TOKEN_PATTERN.test(token) || !occupationId) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (body.consent !== true) {
    return NextResponse.json({ error: "Please tick the box to agree to getting your report straight away." }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    console.error("[checkout] STRIPE_SECRET_KEY is not set");
    return NextResponse.json({ error: UNAVAILABLE, unavailable: true }, { status: 503 });
  }

  let report;
  try {
    report = await getReportByToken(token);
  } catch (err) {
    console.error("[checkout] report lookup failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  if (!report) return NextResponse.json({ error: "These results have expired or the link is wrong." }, { status: 404 });

  const inResults = isMatchesDoc(report.matches) && report.matches.items.some((m) => m.occupationId === occupationId);
  const occupation = getCareerOccupation(occupationId);
  if (!inResults || !occupation) return NextResponse.json({ error: "That career is not in these results." }, { status: 400 });

  // Local testing sends buyers back to localhost; everywhere else uses the canonical site.
  const host = request.nextUrl.hostname;
  const base = host === "localhost" || host === "127.0.0.1" ? request.nextUrl.origin : SITE_URL;
  const consentAt = new Date().toISOString();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: REPORT_PRICE_PENCE,
            product_data: {
              name: `Career Change Report: ${occupation.title}`,
              description:
                "A one-off report on one career: UK pay from ONS, the ways in, a plan for your skill gaps, a 90-day plan and CV wording. Delivered on screen and by email straight after payment.",
            },
          },
        },
      ],
      success_url: `${base}/report/${token}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/results/${token}?checkout=cancelled#match-${occupationId}`,
      metadata: {
        product: REPORT_PRODUCT,
        report_token: token,
        occupation_id: occupationId,
        target_soc: occupation.soc,
        consent_digital_content: "yes",
        consent_at: consentAt,
        consent_text: DIGITAL_CONSENT_TEXT,
      },
      payment_intent_data: { metadata: { product: REPORT_PRODUCT, report_token: token, occupation_id: occupationId } },
      custom_text: {
        submit: {
          message:
            "Your report is delivered straight after payment. You asked for immediate supply, so the 14-day right to cancel ends once delivery starts.",
        },
      },
    });
    if (!session.url) throw new Error("Stripe returned no checkout URL");
    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (isStripeConfigError(err)) {
      console.error("[checkout] Stripe rejected the API key:", err instanceof Error ? err.message : err);
      return NextResponse.json({ error: UNAVAILABLE, unavailable: true }, { status: 503 });
    }
    console.error("[checkout] session create failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "We could not start the payment just now. Please try again in a minute." }, { status: 502 });
  }
}
