import { useEffect, useRef, useState } from 'react';
import type { FieldSceneHandle, FieldSceneOptions } from '../three/fieldScene';
import { buildStaticStarsShadow } from '../three/staticField';

interface FieldBackgroundProps {
  particleDensity?: FieldSceneOptions['particleDensity'];
  forceReducedMotion?: boolean;
  showPolyhedronMark?: boolean;
}

export function FieldBackground({
  particleDensity = 'moderate',
  forceReducedMotion = false,
  showPolyhedronMark = true,
}: FieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef<FieldSceneHandle | null>(null);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const starsShadow = useRef(buildStaticStarsShadow()).current;

  useEffect(() => {
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const reduced = forceReducedMotion || prefersReduced;
    setReducedMotion(reduced);

    if (reduced) return;

    let cancelled = false;
    (async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const mod = await import('../three/fieldScene');
      if (cancelled) return;
      fieldRef.current = await mod.mountField(canvas, { particleDensity, showPolyhedronMark });
    })();

    return () => {
      cancelled = true;
      fieldRef.current?.dispose();
      fieldRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceReducedMotion, particleDensity, showPolyhedronMark]);

  const showStaticField = reducedMotion !== false;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'var(--surface-void)' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: reducedMotion ? 'none' : 'block' }}
      />
      {showStaticField && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              boxShadow: starsShadow,
              opacity: 0.55,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              width: 480,
              height: 480,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,169,106,0.14) 0%, rgba(201,169,106,0) 70%)',
            }}
          />
        </>
      )}
    </div>
  );
}
