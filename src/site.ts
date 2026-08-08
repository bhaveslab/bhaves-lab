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
