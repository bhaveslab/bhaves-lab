import type { VercelRequest, VercelResponse } from '@vercel/node';

// Unconditional retirement: environment flags cannot reactivate these public APIs.
// Previous entrypoints remain in Git history; provider/service code is retained.
export default function observationOnly(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(410).json({ error: 'This endpoint is no longer available.' });
}
