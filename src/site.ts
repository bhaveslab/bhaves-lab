export type Site = 'lab' | 'meridian';

const MERIDIAN_HOSTNAME_MATCH = 'meridiangtn';

export function getSite(): Site {
  if (typeof window === 'undefined') return 'lab';
  const host = window.location.hostname;
  if (host.includes(MERIDIAN_HOSTNAME_MATCH)) return 'meridian';
  if (host === 'localhost' || host === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    if (params.get('site') === 'meridian') return 'meridian';
  }
  return 'lab';
}

// Per-site tab title + favicon. `lab` points at public/favicon.png, which
// doesn't exist in the repo yet — Bhavé's Lab has no dedicated icon asset to
// crop from (unlike Meridian's logo). The href is still wired up so dropping
// a real file in later is a one-file swap; until then the browser just gets
// a 404 on that request and shows no custom icon, which doesn't break
// anything.
const SITE_CHROME: Record<Site, { title: string; favicon: string }> = {
  lab: { title: "Bhavé's Lab", favicon: '/favicon.png' },
  meridian: { title: 'Meridian — Global Technology Network', favicon: '/meridian/favicon.png' },
};

// Sets the base tab title and favicon for the current hostname. Call once,
// synchronously, before React renders (see App.tsx) — NOT from a React
// effect. Page components set their own more specific document.title from
// their own useEffect, which always runs after React has mounted, so
// calling this beforehand means those per-page titles still win; effects
// actually fire child-before-parent on mount, so a useEffect living in App
// would run *after* a page's own title effect and clobber it.
export function applySiteChrome(): void {
  if (typeof document === 'undefined') return;
  const chrome = SITE_CHROME[getSite()];
  document.title = chrome.title;

  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = chrome.favicon;
}
