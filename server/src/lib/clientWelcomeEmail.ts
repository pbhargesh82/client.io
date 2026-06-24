import { buildClientWelcomeEmail } from '../emails/client-welcome.js';
import { getAppUrl, sendEmail } from './email.js';

export async function sendClientWelcomeEmail(input: {
  clientName: string;
  clientEmail: string;
  company?: string | null;
  password: string;
  invitedByName?: string | null;
}): Promise<void> {
  const loginUrl = `${getAppUrl()}/login`;
  const { subject, html, text } = buildClientWelcomeEmail({
    ...input,
    loginUrl,
  });

  await sendEmail({
    to: input.clientEmail,
    subject,
    html,
    text,
  });
}
