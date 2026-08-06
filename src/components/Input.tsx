import type { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  onChange: (value: string) => void;
}

export function Input({ label, value, onChange, required, type = 'text', ...rest }: InputProps) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-2xs)',
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
        {required ? ' *' : ''}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="bl-input"
        style={{
          background: 'var(--surface-input)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-body)',
        }}
        {...rest}
      />
    </label>
  );
}
