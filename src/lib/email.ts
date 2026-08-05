import { config } from "@/lib/config";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
};

function getResendClient() {
  const apiKey = config.resend.apiKey;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  return new Resend(apiKey);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Send an email via Resend. */
export async function sendEmail(input: SendEmailInput) {
  const resend = getResendClient();
  const from = input.from?.trim() || config.resend.fromEmail;

  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    replyTo: input.replyTo,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }

  return data;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  name?: string | null;
}) {
  const greeting = input.name?.trim()
    ? `Hi ${input.name.trim()},`
    : "Hi,";

  const text = [
    greeting,
    "",
    "We received a request to reset your MenuPilot password.",
    "Open this link to choose a new password:",
    input.resetUrl,
    "",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #1f1c18;">
      <p>${greeting}</p>
      <p>We received a request to reset your MenuPilot password.</p>
      <p>
        <a href="${input.resetUrl}" style="display: inline-block; padding: 10px 16px; background: #c45c26; color: #fff; text-decoration: none; border-radius: 8px;">
          Reset password
        </a>
      </p>
      <p style="font-size: 14px; color: #666;">
        Or copy this link:<br />
        <a href="${input.resetUrl}">${input.resetUrl}</a>
      </p>
      <p style="font-size: 14px; color: #666;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;

  return sendEmail({
    to: input.to,
    subject: "Reset your MenuPilot password",
    html,
    text,
  });
}

export async function sendTableRequestEmail(input: {
  to: string;
  restaurantName: string;
  guestName: string;
  guestEmail: string;
  message: string;
}) {
  const restaurantName = input.restaurantName.trim() || "your restaurant";
  const guestName = input.guestName.trim();
  const guestEmail = input.guestEmail.trim();
  const message = input.message.trim();

  const text = [
    `New table request for ${restaurantName}`,
    "",
    `Name: ${guestName}`,
    `Email: ${guestEmail}`,
    "",
    "Request details:",
    message,
  ].join("\n");

  const html = `
    <div style="font-family: sans-serif; line-height: 1.5; color: #1f1c18;">
      <p>New table request for <strong>${escapeHtml(restaurantName)}</strong></p>
      <p>
        <strong>Name:</strong> ${escapeHtml(guestName)}<br />
        <strong>Email:</strong>
        <a href="mailto:${escapeHtml(guestEmail)}">${escapeHtml(guestEmail)}</a>
      </p>
      <p><strong>Request details:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
    </div>
  `;

  return sendEmail({
    to: input.to,
    replyTo: guestEmail,
    subject: `Table request from ${guestName}`,
    html,
    text,
  });
}
