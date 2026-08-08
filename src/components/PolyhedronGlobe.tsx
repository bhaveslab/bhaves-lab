import { useEffect, useRef } from 'react';

/**
 * A rotating wireframe octahedron (CSS 3D transforms) with the Meridian
 * globe mark nested at its center. Pure CSS/DOM — no canvas, no Three.js —
 * so it's predictable and easy to reposition/resize by hand.
 */

const EDGE_COLOR = 'rgba(255, 176, 102, 0.55)';

// 6 vertices of an octahedron (top, bottom, 4 equatorial), edges computed below.
type Vec3 = [number, number, number];

const R = 130; // radius in px, controls overall size

const vertices: Vec3[] = [
  [0, -R, 0], // 0 top
  [0, R, 0], // 1 bottom
  [R, 0, 0], // 2 +x
  [-R, 0, 0], // 3 -x
  [0, 0, R], // 4 +z
  [0, 0, -R], // 5 -z
];

const edges: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 4], [4, 3], [3, 5], [5, 2],
];

function edgeTransform(a: Vec3, b: Vec3) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
  const midX = (a[0] + b[0]) / 2;
  const midY = (a[1] + b[1]) / 2;
  const midZ = (a[2] + b[2]) / 2;

  // Rotation to align a unit X-axis vector with (dx,dy,dz)
  const yaw = Math.atan2(dz, dx) * (180 / Math.PI);
  const horizLen = Math.sqrt(dx * dx + dz * dz);
  const pitch = Math.atan2(-dy, horizLen) * (180 / Math.PI);

  return {
    transform: `translate3d(${midX}px, ${midY}px, ${midZ}px) rotateY(${-yaw}deg) rotateZ(${pitch}deg)`,
    length,
  };
}

export function PolyhedronGlobe({ size = 340 }: { size?: number }) {
  const cageRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      angleRef.current += 0.12;
      if (cageRef.current) {
        cageRef.current.style.transform = `rotateY(${angleRef.current}deg) rotateX(${
          14 + Math.sin(angleRef.current * 0.01) * 10
        }deg)`;
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
        perspective: 900,
      }}
    >
      <div
        ref={cageRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 0,
          height: 0,
          transformStyle: 'preserve-3d',
        }}
      >
        {edges.map(([ai, bi], i) => {
          const { transform, length } = edgeTransform(vertices[ai], vertices[bi]);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: length,
                height: 1.5,
                background: EDGE_COLOR,
                boxShadow: '0 0 6px rgba(255, 176, 102, 0.35)',
                transformOrigin: 'center center',
                transform: `${transform} translateX(-50%)`,
              }}
            />
          );
        })}

        {/* Nested Meridian globe, held at the center of the structure */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size * 0.42,
            height: size * 0.42,
            transform: `translate3d(-50%, -50%, 0)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <img
            src="/meridian/meridian-logo.png"
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              objectPosition: 'top center',
              // The source image includes wordmark below the globe; crop to
              // roughly the globe glyph only.
              clipPath: 'inset(0% 0% 62% 0%)',
              transform: 'scale(2.6) translateY(4%)',
              opacity: 0.95,
              filter: 'drop-shadow(0 0 18px rgba(120, 130, 255, 0.35))',
            }}
          />
        </div>
      </div>
    </div>
  );
}
