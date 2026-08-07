import type { CSSProperties } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  glow?: boolean;
  glowDelay?: number;
  glowDuration?: number;
}

export function ProductImage({
  src,
  alt,
  width = 'min(320px, 78vw)',
  height = 420,
  glow = false,
  glowDelay = 0,
  glowDuration = 14,
}: ProductImageProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: 14,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-subtle)',
  };
  if (glow) {
    (style as Record<string, string>)['--glow-delay'] = `${glowDelay}s`;
    (style as Record<string, string>)['--glow-duration'] = `${glowDuration}s`;
  }

  return (
    <div className={glow ? 'bl-box-breathe' : undefined} style={style}>
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'contain' }} loading="lazy" />
      ) : (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
            textAlign: 'center',
            padding: 'var(--space-4)',
          }}
        >
          {alt}
        </span>
      )}
    </div>
  );
}
