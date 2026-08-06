import type { MouseEventHandler, ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  variant?: 'plain' | 'outline';
  size?: 'sm' | 'md';
}

export function IconButton({ icon, label, onClick, variant = 'plain', size = 'md' }: IconButtonProps) {
  const dim = size === 'sm' ? 32 : 40;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bl-icon-button"
      style={{
        width: dim,
        height: dim,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: variant === 'outline' ? '1px solid var(--border-default)' : 'none',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: size === 'sm' ? 16 : 20,
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}
