import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  padded?: boolean;
  variant?: 'default' | 'sunken';
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ padded = true, variant = 'default', children, style }: CardProps) {
  const sunken = variant === 'sunken';
  return (
    <div
      style={{
        background: sunken ? 'var(--surface-sunken)' : 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: sunken ? 'inset 0 2px 8px rgba(0,0,0,0.35)' : 'var(--shadow-md), var(--inset-top)',
        padding: padded ? 'var(--pad-card)' : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
