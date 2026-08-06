import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import type { CartItem } from './types';

interface CartDrawerProps {
  open: boolean;
  items: CartItem[];
  subtotal: number;
  onClose: () => void;
  onRemove: (key: string) => void;
  onCheckout: () => void;
}

export function CartDrawer({ open, items, subtotal, onClose, onRemove, onCheckout }: CartDrawerProps) {
  if (!open) return null;
  const empty = items.length === 0;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 30, background: 'rgba(6,6,10,0.6)' }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 31,
          width: 'min(420px, 100vw)',
          background: 'var(--surface-base)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'bl-slide-in 220ms var(--ease-out)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)' }}>Cart</div>
          <IconButton icon={<i className="ph-light ph-x" />} label="Close cart" variant="plain" size="sm" onClick={onClose} />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-5) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {empty && (
            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
              Your cart is empty.
            </div>
          )}
          {items.map((item) => (
            <div key={item.key} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 8,
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.name}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {item.size ? `Size ${item.size} · ` : ''}Qty {item.qty}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-gold)' }}>
                ${(item.price * item.qty).toFixed(2)}
              </div>
              <IconButton
                icon={<i className="ph-light ph-trash" />}
                label="Remove"
                variant="plain"
                size="sm"
                onClick={() => onRemove(item.key)}
              />
            </div>
          ))}
        </div>

        <div style={{ padding: 'var(--space-5) var(--space-6)', borderTop: '1px solid var(--border-subtle)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-body)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span style={{ color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
          </div>
          <Button fullWidth disabled={empty} onClick={onCheckout}>
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}
