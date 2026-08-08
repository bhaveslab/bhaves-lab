import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { IconButton } from '../../components/IconButton';
import { Input } from '../../components/Input';
import type { CartItem, Shipping } from './types';

interface CheckoutOverlayProps {
  open: boolean;
  step: number;
  items: CartItem[];
  subtotal: number;
  shipping: Shipping;
  onShippingChange: (field: keyof Shipping, value: string) => void;
  onClose: () => void;
  onGoReview: () => void;
  onGoPayment: () => void;
  onPay: () => void;
  paying: boolean;
  payError: string | null;
}

const STEP_LABELS = ['Shipping', 'Review', 'Payment'];

export function CheckoutOverlay({
  open,
  step,
  items,
  subtotal,
  shipping,
  onShippingChange,
  onClose,
  onGoReview,
  onGoPayment,
  onPay,
  paying,
  payError,
}: CheckoutOverlayProps) {
  if (!open) return null;
  const shippingInvalid = !(shipping.name && shipping.email && shipping.address);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--surface-void)', overflowY: 'auto' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'var(--space-7) var(--space-6)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-7)',
          }}
        >
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-2)' }}>Checkout</div>
          <IconButton icon={<i className="ph-light ph-x" />} label="Close checkout" variant="plain" size="sm" onClick={onClose} />
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-7)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
          }}
        >
          {STEP_LABELS.map((label, i) => (
            <div
              key={label}
              style={{ color: i === step ? 'var(--text-gold)' : i < step ? 'var(--text-secondary)' : 'var(--text-faint)' }}
            >
              {i + 1}. {label}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Input label="Full name" value={shipping.name} onChange={(v) => onShippingChange('name', v)} required />
            <Input label="Email" type="email" value={shipping.email} onChange={(v) => onShippingChange('email', v)} required />
            <Input label="Address" value={shipping.address} onChange={(v) => onShippingChange('address', v)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <Input label="City" value={shipping.city} onChange={(v) => onShippingChange('city', v)} />
              <Input label="State" value={shipping.state} onChange={(v) => onShippingChange('state', v)} />
              <Input label="ZIP" value={shipping.zip} onChange={(v) => onShippingChange('zip', v)} />
            </div>
            <Button fullWidth disabled={shippingInvalid} onClick={onGoReview}>
              Continue to review
            </Button>
          </div>
        )}

        {step === 1 && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              {items.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'var(--text-sm)',
                    padding: 'var(--space-2) 0',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  <span>
                    {item.name}{' '}
                    <span style={{ color: 'var(--text-muted)' }}>
                      — {item.size ? `Size ${item.size} · ` : ''}Qty {item.qty}
                    </span>
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-gold)' }}>
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-body)',
                  paddingTop: 'var(--space-3)',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>Total</span>
                <span style={{ color: 'var(--text-primary)' }}>${subtotal.toFixed(2)}</span>
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-5)' }}>
              Shipping to {shipping.name}, {shipping.address}, {shipping.city} {shipping.state} {shipping.zip}
            </div>
            <Button fullWidth onClick={onGoPayment}>
              Continue to payment
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <Card variant="sunken">
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-normal)' }}>
                You&rsquo;ll be redirected to a secure Stripe checkout page to complete payment.
              </div>
            </Card>
            {payError && (
              <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-error, #e0554f)' }}>
                {payError}
              </div>
            )}
            <div style={{ marginTop: 'var(--space-5)' }}>
              <Button fullWidth disabled={paying} onClick={onPay}>
                {paying ? 'Redirecting to Stripe…' : 'Complete order'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
