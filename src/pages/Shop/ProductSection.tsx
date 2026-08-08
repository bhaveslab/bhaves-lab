import type { CSSProperties } from 'react';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { ProductImage } from '../../components/ProductImage';
import { SIZES, type Product } from './products';

// Deterministic per-product stagger so the same product always gets the same
// glow timing (no re-randomizing on every render), and different products
// never share a phase.
function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

interface ProductSectionProps {
  product: Product;
  focus: number;
  size: string | null;
  qty: number;
  onSelectSize: (size: string) => void;
  onIncQty: () => void;
  onDecQty: () => void;
  onAddToCart: () => void;
  setSectionRef: (el: HTMLElement | null) => void;
}

export function ProductSection({
  product,
  focus,
  size,
  qty,
  onSelectSize,
  onIncQty,
  onDecQty,
  onAddToCart,
  setSectionRef,
}: ProductSectionProps) {
  const hasSize = product.type === 'tee';
  const scale = 0.82 + 0.18 * focus;
  const opacity = 0.32 + 0.68 * focus;
  const blur = (1 - focus) * 6;
  const bright = 0.55 + 0.45 * focus;
  const addDisabled = hasSize && !size;
  const seed = hashSeed(product.id);
  const glowDelay = (seed % 1100) / 100; // 0–11s, so peaks never line up
  const glowDuration = 13 + ((seed >>> 4) % 900) / 100; // 13–22s, slow drift

  const style: CSSProperties = {
    minHeight: '82vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    transition: 'transform 120ms linear, opacity 120ms linear, filter 120ms linear',
    willChange: 'transform, opacity, filter',
    transform: `scale(${scale})`,
    opacity,
    filter: `blur(${blur}px) brightness(${bright})`,
  };

  return (
    <section ref={setSectionRef} data-product-id={product.id} style={style}>
      <ProductImage src={product.image} alt={product.name} glow glowDelay={glowDelay} glowDuration={glowDuration} />
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: 'var(--tracking-label)',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginTop: 'var(--space-5)',
        }}
      >
        {product.category}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 'var(--weight-regular)' as unknown as number,
          fontSize: 'var(--text-title-1)',
          color: 'var(--text-primary)',
          margin: 'var(--space-2) 0',
        }}
      >
        {product.name}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body)', color: 'var(--text-gold)' }}>
        ${product.price.toFixed(2)}
      </div>

      {hasSize && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-5)',
          }}
        >
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSelectSize(s)}
              aria-pressed={s === size}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                cursor: 'pointer',
                background: s === size ? 'var(--gold-500)' : 'var(--surface-input)',
                color: s === size ? 'var(--text-on-gold)' : 'var(--text-primary)',
                border: `1px solid ${s === size ? 'var(--gold-500)' : 'var(--border-subtle)'}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
        <IconButton
          icon={<i className="ph-light ph-minus" />}
          label="Decrease quantity"
          variant="outline"
          size="sm"
          onClick={onDecQty}
        />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-body)', minWidth: 20, textAlign: 'center' }}>
          {qty}
        </div>
        <IconButton
          icon={<i className="ph-light ph-plus" />}
          label="Increase quantity"
          variant="outline"
          size="sm"
          onClick={onIncQty}
        />
      </div>

      <div style={{ marginTop: 'var(--space-5)', width: 'min(260px, 80vw)' }}>
        <Button fullWidth disabled={addDisabled} onClick={onAddToCart}>
          Add to cart
        </Button>
      </div>
    </section>
  );
}
