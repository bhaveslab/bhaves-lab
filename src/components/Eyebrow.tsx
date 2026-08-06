import type { ReactNode } from 'react';

interface EyebrowProps {
  tick?: boolean;
  muted?: boolean;
  children: ReactNode;
}

export function Eyebrow({ tick, muted, children }: EyebrowProps) {
  return (
    <div className="bl-eyebrow" style={{ color: muted ? 'var(--text-muted)' : undefined }}>
      {tick && <span style={{ marginRight: '0.6em' }}>—</span>}
      {children}
    </div>
  );
}
