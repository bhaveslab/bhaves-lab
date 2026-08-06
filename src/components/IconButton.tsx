import type { MouseEventHandler, ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="bl-icon-button"
      style={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        color: 'var(--text-primary)',
        fontSize: 20,
        cursor: 'pointer',
      }}
    >
      {icon}
    </button>
  );
}
