import { useEffect, useRef } from 'react';

/**
 * Meridian globe mark — slow self-rotation with a gentle float.
 *
 * Previously wrapped in a rotating wireframe octahedron cage. Dropped: the
 * cage's own edges periodically foreshorten toward the camera as it turns,
 * bunching into a converging starburst that visually crosses the globe.
 * That's inherent to a rotating wireframe shape, not fixable while the cage
 * exists, so the cage is gone and the globe stands on its own.
 */

export function PolyhedronGlobe({ size = 340 }: { size?: number }) {
  const spinRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      angleRef.current += 0.0045;
      if (spinRef.current) {
        const spin = angleRef.current * (180 / Math.PI) * 0.4;
        const bob = Math.sin(angleRef.current * 2) * 6;
        spinRef.current.style.transform = `translateY(${bob}px) rotate(${spin}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
      }}
    >
      <div ref={spinRef} style={{ width: '100%', height: '100%' }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            filter: 'drop-shadow(0 0 28px rgba(255, 200, 110, 0.4))',
          }}
        >
          <img
            src="/meridian/meridian-logo.png"
            alt="Meridian"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'top center',
              // Source image: gold globe/network mark on top, wordmark
              // below. Crop to roughly the globe+orbit-rings portion only.
              clipPath: 'inset(2% 4% 34% 4%)',
              transform: 'scale(2.3) translateY(2%)',
              opacity: 0.95,
            }}
          />
        </div>
      </div>
    </div>
  );
}
