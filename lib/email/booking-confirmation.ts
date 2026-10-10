import "server-only";

import type { Booking } from "@/lib/bookings";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SENDER = "Booking Workspace <bookings@notifications.ninondirandderiol.me>";
const BRAND = {
  paleBlue: "#A9D6F5",
  lightBlue: "#F3F9FD",
  navy: "#243B53",
  muted: "#5D7285",
  line: "#D7EAF6",
};

type ConfirmationEmailInput = {
  recipient: string;
  workspaceName: string;
  booking: Booking;
};

export type ConfirmationEmailResult = "sent" | "skipped" | "failed";

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeZone: "Europe/Madrid",
  }).format(date);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

function detailsRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:14px;color:${BRAND.muted};">${escapeHtml(label)}</td>
      <td style="padding:12px 0;border-bottom:1px solid ${BRAND.line};font-size:14px;font-weight:700;color:${BRAND.navy};text-align:right;">${escapeHtml(value)}</td>
    </tr>`;
}

function getMyBookingsUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configuredUrl) return null;
  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.pathname = "/my-bookings";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

function renderHtml({ workspaceName, booking }: Omit<ConfirmationEmailInput, "recipient">) {
  const myBookingsUrl = getMyBookingsUrl();
  const rows = [
    detailsRow("Workspace", workspaceName),
    detailsRow("Date", formatDate(booking.date)),
    detailsRow("Start time", booking.startTime),
    detailsRow("Duration", `${booking.duration} ${booking.duration === 1 ? "hour" : "hours"}`),
    detailsRow("People", String(booking.people)),
    detailsRow("Total price", formatPrice(booking.totalPrice)),
  ].join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking confirmed</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.lightBlue};font-family:Arial,Helvetica,sans-serif;color:${BRAND.navy};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.lightBlue};padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid ${BRAND.line};border-radius:18px;overflow:hidden;box-shadow:0 16px 45px rgba(71,132,170,0.12);">
            <tr>
              <td style="padding:24px 32px;background:${BRAND.paleBlue};">
                <div style="font-size:21px;font-weight:800;letter-spacing:-0.5px;color:${BRAND.navy};">booking<span style="color:#2D719F;">workspace</span></div>
                <div style="margin-top:6px;font-size:12px;font-weight:700;color:#36586F;">Unofficial university concept</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="display:inline-block;padding:7px 11px;border-radius:999px;background:#E9F7EF;color:#17633A;font-size:12px;font-weight:800;">RESERVATION CONFIRMED</div>
                <h1 style="margin:18px 0 8px;font-size:30px;line-height:1.15;letter-spacing:-1px;color:${BRAND.navy};">Your workspace is booked.</h1>
                <p style="margin:0;font-size:15px;line-height:1.65;color:${BRAND.muted};">Your reservation has been saved securely. Here is everything you need for your upcoming workspace booking.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;border-top:1px solid ${BRAND.line};">
                  ${rows}
                </table>

                <div style="margin-top:24px;padding:18px;border-radius:12px;background:${BRAND.lightBlue};border:1px solid ${BRAND.line};">
                  <div style="font-size:12px;font-weight:700;color:${BRAND.muted};">BOOKING REFERENCE</div>
                  <div style="margin-top:6px;font-size:20px;font-weight:800;letter-spacing:0.8px;color:#245F87;">${escapeHtml(booking.reference)}</div>
                </div>

                ${myBookingsUrl ? `<div style="margin-top:26px;"><a href="${escapeHtml(myBookingsUrl)}" style="display:inline-block;padding:13px 20px;border-radius:10px;background:#246B9C;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:800;">View My Bookings</a></div>` : ""}

                <p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:${BRAND.muted};">This is a fictional demonstration reservation for the Booking Workspace university prototype. No real venue or payment provider was contacted.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#EDF8FE;border-top:1px solid ${BRAND.line};font-size:12px;line-height:1.5;color:#48677C;">
                Booking Workspace · Madrid · Professional spaces by the hour
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ workspaceName, booking }: Omit<ConfirmationEmailInput, "recipient">) {
  return [
    "Booking Workspace — reservation confirmed",
    "",
    `Workspace: ${workspaceName}`,
    `Date: ${formatDate(booking.date)}`,
    `Start time: ${booking.startTime}`,
    `Duration: ${booking.duration} ${booking.duration === 1 ? "hour" : "hours"}`,
    `People: ${booking.people}`,
    `Total price: ${formatPrice(booking.totalPrice)}`,
    `Booking reference: ${booking.reference}`,
    "",
    "This is a fictional demonstration reservation for the Booking Workspace university prototype.",
  ].join("\n");
}

export async function sendBookingConfirmationEmail(input: ConfirmationEmailInput): Promise<ConfirmationEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[booking-email] RESEND_API_KEY is not configured; skipped ${input.booking.reference}.`);
    return "skipped";
  }

  const workspaceName = singleLine(input.workspaceName);
  const subject = singleLine(`Booking confirmed — ${workspaceName}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `booking-confirmation/${input.booking.reference}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [input.recipient],
        subject,
        html: renderHtml({ workspaceName, booking: input.booking }),
        text: renderText({ workspaceName, booking: input.booking }),
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`[booking-email] Resend rejected ${input.booking.reference} with status ${response.status}.`);
      return "failed";
    }

    return "sent";
  } catch {
    console.error(`[booking-email] Resend request failed for ${input.booking.reference}.`);
    return "failed";
  } finally {
    clearTimeout(timeout);
  }
}
