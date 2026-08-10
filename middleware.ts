import { rewrite } from '@vercel/functions';

// Meridian's React app renders the same single page for every path under
// meridiangtn.com (App.tsx's Routes() branches on hostname, not on path),
// so link previews need meridian.html's meta tags on any URL someone might
// share, not just "/". Matcher excludes /api (serverless functions) and
// anything with a file extension (built JS/CSS, images under /meridian/
// and /products/, favicon.png, etc.) so those keep being served as-is.
export const config = {
  matcher: '/((?!api/|.*\\..*).*)',
};

export default function middleware(request: Request) {
  const host = request.headers.get('host') ?? '';
  if (host.includes('meridiangtn.com')) {
    return rewrite(new URL('/meridian.html', request.url));
  }
}
