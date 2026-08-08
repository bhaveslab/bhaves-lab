import { useEffect } from 'react';
import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';
import { Card } from '../components/Card';
import { Divider } from '../components/Divider';

const buildItems = [
  {
    eyebrow: 'SOFTWARE',
    title: 'Infrastructure, then interface',
    body: 'The systems behind it, built before what you see.',
  },
  {
    eyebrow: 'PHYSICAL ANCHORS',
    title: 'Containers that hold a system in place',
    body: 'Physical pieces the software interacts with.',
  },
  {
    eyebrow: 'COHERENCE',
    title: 'One system',
    body: 'Front face and underneath, wired the same way.',
  },
];

const processSteps = [
  { num: '01', label: 'State / Baseline', desc: 'Starting point, isolated and read plainly.' },
  { num: '02', label: 'Operator Alignment', desc: 'The build lines up with how we actually operate.' },
  { num: '03', label: 'Structural Mapping', desc: "The system's real shape, mapped before anything is built." },
  { num: '04', label: 'Documentation & Architecture', desc: 'Written down, then structured.' },
  { num: '05', label: 'Functional Expression', desc: 'Shipped as software and physical form.' },
];

export function Meridian() {
  useEffect(() => {
    document.title = 'Meridian — GTN';
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-void)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        overflowX: 'hidden',
      }}
    >
      <FieldBackground particleDensity="moderate" />

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-5) var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>
            Meridian
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            GTN — Global Technology Network
          </div>
        </div>
        <a
          href="https://bhaveslab.com"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}
        >
          Bhavé&rsquo;s Lab ↗
        </a>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        <section
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '0 var(--space-6)',
          }}
        >
          <Eyebrow tick>Meridian — A Bhavé&rsquo;s Lab Company</Eyebrow>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 'var(--weight-light)' as unknown as number,
              fontSize: 'clamp(40px, 7vw, var(--text-display-1))',
              lineHeight: 'var(--leading-tight)',
              letterSpacing: 'var(--tracking-tight)',
              color: 'var(--text-primary)',
              maxWidth: 900,
              margin: 'var(--space-5) 0 var(--space-5)',
            }}
          >
            Custom builds, entered through one door.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lead)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--text-secondary)',
              maxWidth: 560,
              margin: 0,
            }}
          >
            The B2B front end for Bhavé&rsquo;s Lab — software and physical anchors, built end to end and delivered
            as one coherent system.
          </p>
        </section>

        <section
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: 'var(--pad-section) var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-5)',
          }}
        >
          {buildItems.map((item) => (
            <Card key={item.eyebrow}>
              <Eyebrow muted>{item.eyebrow}</Eyebrow>
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 'var(--weight-regular)' as unknown as number,
                  fontSize: 'var(--text-title-3)',
                  color: 'var(--text-primary)',
                  margin: 'var(--space-3) 0 var(--space-3)',
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-body)',
                  lineHeight: 'var(--leading-normal)',
                  color: 'var(--text-secondary)',
                  margin: 0,
                }}
              >
                {item.body}
              </p>
            </Card>
          ))}
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Divider label="How We Work" />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)', marginTop: 'var(--space-6)' }}>
            {processSteps.map((step) => (
              <div key={step.num} style={{ flex: '1 1 180px', minWidth: 160 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-eyebrow)',
                    letterSpacing: 'var(--tracking-label)',
                    color: 'var(--text-gold)',
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 'var(--weight-medium)' as unknown as number,
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    margin: 'var(--space-2) 0 var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wide)',
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    lineHeight: 'var(--leading-normal)',
                  }}
                >
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          style={{
            maxWidth: 'var(--container-prose)',
            margin: '0 auto',
            padding: 'var(--pad-section) var(--space-6)',
            textAlign: 'center',
          }}
        >
          <Eyebrow tick>Full Builds</Eyebrow>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 'var(--weight-light)' as unknown as number,
              fontSize: 'var(--text-display-3)',
              color: 'var(--text-primary)',
              margin: 'var(--space-5) 0',
            }}
          >
            Full Builds
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lead)',
              lineHeight: 'var(--leading-relaxed)',
              color: 'var(--text-secondary)',
              margin: '0 0 var(--space-4)',
            }}
          >
            Pricing is scoped per project.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--text-muted)', margin: '0 0 var(--space-4)' }}>
            Every build lives in infrastructure the client owns from day one — never under Lab- or
            Meridian-controlled accounts.
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-body)', color: 'var(--text-muted)', margin: 0 }}>
            If it&rsquo;s a fit, get in touch — details below.
          </p>
        </section>

        <section
          style={{
            maxWidth: 'var(--container-prose)',
            margin: '0 auto',
            padding: '0 var(--space-6) var(--pad-section)',
            textAlign: 'center',
          }}
        >
          <Eyebrow muted>Meridian</Eyebrow>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 'var(--weight-regular)' as unknown as number,
              fontSize: 'var(--text-title-2)',
              fontStyle: 'italic',
              color: 'var(--text-gold)',
              lineHeight: 'var(--leading-snug)',
              margin: 'var(--space-5) 0 0',
            }}
          >
            We build from the same state outward on every project. The software, the object, the document — all of
            it comes from the same place. That&rsquo;s why it holds together.
          </p>
        </section>
      </main>

      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          borderTop: '1px solid var(--border-subtle)',
          padding: 'var(--space-7) var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-5)',
          textAlign: 'center',
        }}
      >
        <a
          href="mailto:info@bhaveslab.com"
          style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)' }}
        >
          info@bhaveslab.com
        </a>
        <a
          href="https://calendly.com/bhaveslab-info/30min"
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
          What are we building?
        </a>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
          Meridian — a DBA of Bhavé&rsquo;s Lab LLC
        </div>
      </footer>
    </div>
  );
}
