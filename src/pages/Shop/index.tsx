import { useEffect, useMemo, useState } from 'react';
import { FieldBackground } from '../../components/FieldBackground';
import { IconButton } from '../../components/IconButton';
import { Link } from '../../router';
import { CartDrawer } from './CartDrawer';
import { CheckoutOverlay } from './CheckoutOverlay';
import { GumroadPanel } from './GumroadPanel';
import { ProductSection } from './ProductSection';
import { CART_KEY, PRODUCTS, type Product } from './products';
import type { CartItem, Shipping } from './types';
import { useProductFocus } from './useProductFocus';

interface Selection {
  size: string | null;
  qty: number;
}

const CATEGORIES = ['All', ...Array.from(new Set(PRODUCTS.map((p) => p.category)))];

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function Shop() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Selection>>({});
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [shipping, setShipping] = useState<Shipping>({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    document.title = "Shop — Bhavé's Lab";
  }, []);

  const visibleProducts = useMemo(
    () => (activeCategory ? PRODUCTS.filter((p) => p.category === activeCategory) : PRODUCTS),
    [activeCategory]
  );
  const visibleIds = useMemo(() => visibleProducts.map((p) => p.id), [visibleProducts]);
  const { setRef, focus, measure } = useProductFocus(visibleIds);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      // localStorage unavailable — cart just won't persist across reloads
    }
  }, [cart]);

  const getSelection = (id: string): Selection => selections[id] || { size: null, qty: 1 };
  const setSelection = (id: string, patch: Partial<Selection>) => {
    setSelections((prev) => ({ ...prev, [id]: { ...getSelection(id), ...patch } }));
  };

  const jumpToCategory = (cat: string) => {
    const next = cat === 'All' ? null : activeCategory === cat ? null : cat;
    setActiveCategory(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(measure, 350);
  };

  const addToCart = (product: Product) => {
    const sel = getSelection(product.id);
    const hasSize = product.type === 'tee';
    if (hasSize && !sel.size) return;
    const key = product.id + (hasSize ? `-${sel.size}` : '');
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + sel.qty } : c));
      return [
        ...prev,
        { key, id: product.id, name: product.name, price: product.price, size: hasSize ? sel.size : null, qty: sel.qty },
      ];
    });
    setCartOpen(true);
  };

  const removeItem = (key: string) => setCart((prev) => prev.filter((c) => c.key !== key));

  const cartCount = cart.reduce((a, c) => a + c.qty, 0);
  const subtotal = cart.reduce((a, c) => a + c.qty * c.price, 0);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-void)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
      }}
    >
      <FieldBackground particleDensity="moderate" />

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-5) var(--space-6)',
          background: 'rgba(6,6,10,0.7)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-primary)' }}>
          Bhavé&rsquo;s Lab
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat || (cat === 'All' && !activeCategory);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => jumpToCategory(cat)}
                  aria-pressed={active}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    letterSpacing: 'var(--tracking-label)',
                    textTransform: 'uppercase',
                    background: 'transparent',
                    borderRadius: 20,
                    padding: '6px 14px',
                    cursor: 'pointer',
                    border: `1px solid ${active ? 'var(--border-gold)' : 'var(--border-subtle)'}`,
                    color: active ? 'var(--text-gold)' : 'var(--text-muted)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div style={{ position: 'relative' }}>
            <IconButton
              icon={<i className="ph-light ph-shopping-bag" />}
              label="Cart"
              variant="outline"
              onClick={() => setCartOpen(true)}
            />
            {cartCount > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  minWidth: 18,
                  height: 18,
                  borderRadius: 9,
                  background: 'var(--gold-500)',
                  color: 'var(--text-on-gold)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
                {cartCount}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10, padding: 'var(--space-8) var(--space-6)' }}>
        {visibleProducts.map((product) => {
          const sel = getSelection(product.id);
          return (
            <ProductSection
              key={product.id}
              product={product}
              focus={focus[product.id] ?? 0.3}
              size={sel.size}
              qty={sel.qty}
              onSelectSize={(size) => setSelection(product.id, { size })}
              onIncQty={() => setSelection(product.id, { qty: Math.min(sel.qty + 1, 10) })}
              onDecQty={() => setSelection(product.id, { qty: Math.max(sel.qty - 1, 1) })}
              onAddToCart={() => addToCart(product)}
              setSectionRef={setRef(product.id)}
            />
          );
        })}
      </main>

      <GumroadPanel />

      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-7) var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textAlign: 'center',
        }}
      >
        <a href="mailto:info@bhaveslab.com" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
          info@bhaveslab.com
        </a>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
          Bhavé&rsquo;s Lab LLC
        </div>
      </footer>

      <CartDrawer
        open={cartOpen}
        items={cart}
        subtotal={subtotal}
        onClose={() => setCartOpen(false)}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
          setCheckoutStep(0);
        }}
      />

      <CheckoutOverlay
        open={checkoutOpen}
        step={checkoutStep}
        items={cart}
        subtotal={subtotal}
        shipping={shipping}
        onShippingChange={(field, value) => setShipping((prev) => ({ ...prev, [field]: value }))}
        onClose={() => setCheckoutOpen(false)}
        onGoReview={() => setCheckoutStep(1)}
        onGoPayment={() => setCheckoutStep(2)}
      />
    </div>
  );
}
