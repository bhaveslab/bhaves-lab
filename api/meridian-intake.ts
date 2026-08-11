import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const TO_EMAIL = 'info@meridiangtn.com';
const MAX_FIELD_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(res: VercelResponse, message: string) {
  res.status(400).json({ error: message });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Intake is not configured' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const name: unknown = body?.name;
  const email: unknown = body?.email;
  const phone: unknown = body?.phone;
  const buildType: unknown = body?.buildType;
  const details: unknown = body?.details;
  const lang: unknown = body?.lang;

  if (typeof name !== 'string' || !name.trim() || name.length > MAX_FIELD_LENGTH) {
    return badRequest(res, 'Name is required');
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email) || email.length > MAX_FIELD_LENGTH) {
    return badRequest(res, 'A valid email is required');
  }
  if (phone !== undefined && (typeof phone !== 'string' || phone.length > MAX_FIELD_LENGTH)) {
    return badRequest(res, 'Phone is too long');
  }
  if (typeof buildType !== 'string' || !buildType.trim() || buildType.length > MAX_FIELD_LENGTH) {
    return badRequest(res, 'Build type is required');
  }
  if (details !== undefined && (typeof details !== 'string' || details.length > MAX_FIELD_LENGTH)) {
    return badRequest(res, 'Details are too long');
  }

  const safeName = name.trim();
  const safePhone = typeof phone === 'string' ? phone.trim() : '';
  const safeDetails = typeof details === 'string' ? details.trim() : '';
  const fromAddress = process.env.MERIDIAN_INTAKE_FROM ?? 'Meridian Intake <intake@meridiangtn.com>';

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: TO_EMAIL,
      replyTo: email,
      subject: `New Meridian intake from ${safeName}: ${buildType}`,
      html: [
        `<p><strong>Name:</strong> ${escapeHtml(safeName)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        safePhone ? `<p><strong>Phone:</strong> ${escapeHtml(safePhone)}</p>` : '',
        `<p><strong>Build type:</strong> ${escapeHtml(buildType)}</p>`,
        `<p><strong>Details:</strong><br>${
          safeDetails ? escapeHtml(safeDetails).replace(/\n/g, '<br>') : '<em>None provided</em>'
        }</p>`,
        lang === 'es' ? '<p><strong>Submitted in:</strong> Spanish</p>' : '',
      ].join('\n'),
    });

    if (error) {
      console.error('Failed to send Meridian intake email', error);
      return res.status(502).json({ error: 'Could not send submission' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Failed to send Meridian intake email', err);
    return res.status(502).json({ error: 'Could not send submission' });
  }
}
