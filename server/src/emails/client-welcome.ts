function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type ClientWelcomeEmailInput = {
  clientName: string;
  clientEmail: string;
  company?: string | null;
  password: string;
  loginUrl: string;
  invitedByName?: string | null;
};

export function buildClientWelcomeEmail(input: ClientWelcomeEmailInput) {
  const clientName = escapeHtml(input.clientName);
  const company = input.company ? escapeHtml(input.company) : null;
  const loginUrl = escapeHtml(input.loginUrl);
  const invitedBy = input.invitedByName ? escapeHtml(input.invitedByName) : null;

  const subject = 'Welcome to ClientSpace — your portal is ready';

  const intro = invitedBy
    ? `${invitedBy} invited you to ClientSpace${company ? ` for ${company}` : ''}.`
    : `You've been invited to ClientSpace${company ? ` for ${company}` : ''}.`;

  const text = [
    `Hi ${input.clientName},`,
    '',
    intro,
    '',
    'Use the credentials below to sign in and view your projects, tasks, and shared files.',
    '',
    `Sign in: ${input.loginUrl}`,
    `Email: ${input.clientEmail}`,
    `Password: ${input.password}`,
    '',
    'We recommend changing your password after your first sign-in.',
    '',
    '— ClientSpace',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#191c1e;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 20px;background-color:#0f172a;color:#ffffff;">
                <p style="margin:0;font-family:Hanken Grotesk,Segoe UI,sans-serif;font-size:22px;font-weight:600;line-height:1.2;">ClientSpace</p>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#cbd5e1;">Customer portal access</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${clientName},</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#45464d;">${escapeHtml(intro)}</p>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#45464d;">
                  Sign in to review project progress, download deliverables, and leave comments on tasks.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background-color:#f2f4f6;border:1px solid #e2e8f0;border-radius:8px;">
                  <tr>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 10px;font-size:12px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;color:#45464d;">Your sign-in details</p>
                      <p style="margin:0 0 8px;font-size:14px;line-height:1.5;"><strong style="color:#191c1e;">Email</strong><br /><span style="color:#45464d;">${escapeHtml(input.clientEmail)}</span></p>
                      <p style="margin:0;font-size:14px;line-height:1.5;"><strong style="color:#191c1e;">Password</strong><br /><span style="font-family:JetBrains Mono,Consolas,monospace;color:#45464d;">${escapeHtml(input.password)}</span></p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:6px;background-color:#0f172a;">
                      <a href="${loginUrl}" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">Sign in to ClientSpace</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#45464d;">
                  Or open <a href="${loginUrl}" style="color:#2563eb;text-decoration:none;">${loginUrl}</a> in your browser.
                </p>
                <p style="margin:20px 0 0;font-size:12px;line-height:1.6;color:#76777d;">
                  For security, change your password after your first sign-in.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #e2e8f0;background-color:#f7f9fb;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#76777d;">Sent by ClientSpace</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
