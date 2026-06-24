type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? 'ClientSpace <onboarding@resend.dev>';
}

export function getAppUrl(): string {
  const configured = process.env.APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const corsOrigin = process.env.CORS_ORIGIN?.split(',')[0]?.trim();
  if (corsOrigin) return corsOrigin.replace(/\/$/, '');

  return 'http://localhost:5173';
}

export async function sendEmail({ to, subject, html, text }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    console.info('[email] RESEND_API_KEY not set — logging email instead of sending');
    console.info(`[email] To: ${to}`);
    console.info(`[email] Subject: ${subject}`);
    console.info(`[email] Body:\n${text}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email send failed (${response.status}): ${body}`);
  }
}
