import { useCallback, useEffect, useRef, useState } from 'react';

// Depth-of-field scroll gallery: the product nearest vertical-center of the
// viewport gets focus 1, receding to 0 at `threshold` px away.
export function useProductFocus(ids: string[]) {
  const refs = useRef(new Map<string, HTMLElement>());
  const [focus, setFocus] = useState<Record<string, number>>({});
  const raf = useRef<number | null>(null);

  const setRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) refs.current.set(id, el);
      else refs.current.delete(id);
    },
    []
  );

  const measure = useCallback(() => {
    const vh = window.innerHeight;
    const center = vh / 2;
    const threshold = vh * 0.7;
    const next: Record<string, number> = {};
    ids.forEach((id) => {
      const el = refs.current.get(id);
      if (!el) {
        next[id] = 0.3;
        return;
      }
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const dist = Math.abs(elCenter - center);
      next[id] = Math.max(0, 1 - dist / threshold);
    });
    setFocus(next);
  }, [ids]);

  useEffect(() => {
    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        measure();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const t = setTimeout(measure, 80);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(t);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [measure]);

  return { setRef, focus, measure };
}
