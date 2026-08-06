interface ProductImageProps {
  src?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
}

export function ProductImage({ src, alt, width = 'min(320px, 78vw)', height = 420 }: ProductImageProps) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 14,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
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
