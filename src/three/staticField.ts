// Deterministic pseudo-random box-shadow star field, used when Three.js is
// skipped entirely (prefers-reduced-motion or forced via prop).
export function buildStaticStarsShadow(): string {
  const parts: string[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 140; i++) {
    parts.push(
      `${Math.round(rand() * 1600)}px ${Math.round(rand() * 1000)}px rgba(201,169,106,${(0.3 + rand() * 0.4).toFixed(2)})`
    );
  }
  return parts.join(', ');
}
