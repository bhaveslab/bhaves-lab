interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
      <div className="bl-rule" style={{ flex: 1 }} />
      {label && (
        <div className="bl-eyebrow" style={{ whiteSpace: 'nowrap' }}>
          {label}
        </div>
      )}
      <div className="bl-rule" style={{ flex: 1 }} />
    </div>
  );
}
