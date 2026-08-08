import { useEffect, useMemo } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Eyebrow } from '../../components/Eyebrow';
import { FieldBackground } from '../../components/FieldBackground';
import { useRouter } from '../../router';
import { CART_KEY } from './products';

export function Confirmation() {
  const { navigate } = useRouter();
  const status = useMemo(() => new URLSearchParams(window.location.search).get('status'), []);
  const success = status === 'success';

  useEffect(() => {
    document.title = success ? "Order confirmed — Bhavé's Lab" : "Checkout — Bhavé's Lab";
    if (success) {
      try {
        localStorage.removeItem(CART_KEY);
      } catch {
        // localStorage unavailable — nothing to clear
      }
    }
  }, [success]);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-void)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
    >
      <FieldBackground particleDensity="moderate" />
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 480, width: '100%' }}>
        <Card>
          <Eyebrow tick>{success ? 'Order confirmed' : 'Checkout canceled'}</Eyebrow>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-title-2)',
              marginTop: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {success ? 'Thank you for your order' : 'No charge was made'}
          </div>
          <div
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-normal)',
              marginBottom: 'var(--space-6)',
            }}
          >
            {success
              ? "We've received your payment and will follow up by email with shipping details."
              : 'Your cart is still saved — head back to the shop whenever you’re ready to try again.'}
          </div>
          <Button fullWidth onClick={() => navigate('/shop')}>
            Back to shop
          </Button>
        </Card>
      </div>
    </div>
  );
}
