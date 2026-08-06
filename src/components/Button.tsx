import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  fullWidth?: boolean;
}

export function Button({ fullWidth, disabled, style, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="bl-button"
      style={{
        width: fullWidth ? '100%' : undefined,
        height: 44,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        background: 'var(--gold-500)',
        color: 'var(--text-on-gold)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        ...style,
      }}
      {...rest}
    />
  );
}
