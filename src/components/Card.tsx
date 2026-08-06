import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
  padded?: boolean;
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ padded = true, children, style }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md), var(--inset-top)',
        padding: padded ? 'var(--pad-card)' : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
