import { Card } from '../../components/Card';

export function GumroadPanel() {
  return (
    <section
      style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 460,
        margin: '0 auto',
        padding: '0 var(--space-6) var(--space-9)',
      }}
    >
      <Card>
        <div style={{ textAlign: 'center' }}>
          <div className="bl-eyebrow" style={{ marginBottom: 'var(--space-3)' }}>
            More to explore
          </div>
          <div
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--leading-normal)',
            }}
          >
            The digital catalog — books and study material — lives on its own storefront.
          </div>
          <a
            href="https://bhaveslab.gumroad.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bl-pill-link"
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: '1px solid var(--border-gold)',
              borderRadius: 24,
              padding: '12px 24px',
            }}
          >
            Visit the Gumroad store ↗
          </a>
        </div>
      </Card>
    </section>
  );
}
