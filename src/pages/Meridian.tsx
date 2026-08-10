import { useEffect, useState } from 'react';
import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';
import { Card } from '../components/Card';
import { PolyhedronGlobe } from '../components/PolyhedronGlobe';
import { ChatIntake } from '../components/ChatIntake';

const traits = [
  { title: 'Client-owned', body: 'Every account, repo, and server lives in infrastructure you control from day one.' },
  { title: 'Scoped per project', body: 'No fixed packages. Pricing follows the actual shape of the build.' },
  { title: 'Software + hardware', body: 'One team for the code and the physical system it runs on.' },
  { title: 'A Bhavé’s Lab company', body: 'The same team and standards behind the Lab’s own product line.' },
];

const buildKinds = [
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
  { num: '01', label: 'Scope', desc: 'We turn a rough direction into a scoped build — real constraints, real tradeoffs, no filler discovery decks.' },
  { num: '02', label: 'Architect the system', desc: 'Software, hardware, or both — we make the structural decisions early, so nothing you build later gets stuck rebuilding the foundation.' },
  { num: '03', label: 'Build in the open', desc: 'You see working versions early and often — not a status deck, the actual thing, running.' },
  { num: '04', label: 'Hand you the keys', desc: 'Every account, every server, every repository is yours from the first commit. We build it. You own it. No exceptions.' },
];

export function Meridian() {
  const [chatOpen, setChatOpen] = useState(false);

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
      <FieldBackground particleDensity="moderate" showPolyhedronMark={false} />

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/meridian/meridian-logo.png" alt="Meridian" style={{ height: 28, width: 'auto' }} />
           <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '0.01em' }}>
  MERIDIAN <span style={{ color: 'var(--text-gold)' }}>GLOBAL</span>
</div>



        </div>
        <button
          onClick={() => setChatOpen(true)}
          className="bl-pill-link"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            letterSpacing: 'var(--tracking-label)',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            background: 'var(--gold-500)',
            border: 'none',
            borderRadius: 24,
            padding: '10px 22px',
            cursor: 'pointer',
          }}
        >
          Chat with an expert
        </button>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        <section
          style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            alignItems: 'center',
            padding: '0 var(--space-6)',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <Eyebrow tick>Custom software &amp; hardware builds</Eyebrow>
            <h1
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 800 as unknown as number,
                fontSize: 'clamp(36px, 5vw, 56px)',
                lineHeight: 1.1,
                letterSpacing: 'var(--tracking-tight)',
                margin: 'var(--space-4) 0 var(--space-5)',
              }}
            >
              Every build starts as a line.{' '}
              <span style={{ color: 'var(--text-gold)' }}>We give it structure.</span>
            </h1>
            <p
              style={{
                fontSize: 'var(--text-lead)',
                lineHeight: 'var(--leading-relaxed)',
                color: 'var(--text-secondary)',
                margin: '0 0 var(--space-5)',
                maxWidth: 560,
              }}
            >
              Meridian is the build arm of Bhavé’s Lab — the team that designs and ships the
              software and physical systems ambitious companies can’t buy off the shelf. Same team
              behind the Lab’s own products, now pointed at yours.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
              <button
                onClick={() => setChatOpen(true)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  color: 'var(--text-on-gold)',
                  background: 'var(--gold-500)',
                  border: 'none',
                  borderRadius: 24,
                  padding: '14px 28px',
                  cursor: 'pointer',
                }}
              >
                Chat with an expert
              </button>
              <a
                href="#what-we-build"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  textDecoration: 'underline',
                }}
              >
                See what we build ↓
              </a>
            </div>
          </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateX(48px)' }}>
  <PolyhedronGlobe size={520} />
</div>



           
        </section>

        <section
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '0 var(--space-6) var(--pad-section)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-6)',
          }}
        >
          {traits.map((t) => (
            <div key={t.title}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700 as unknown as number, marginBottom: 6 }}>
                {t.title}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
                {t.body}
              </div>
            </div>
          ))}
        </section>

        <section
          id="what-we-build"
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: 'var(--pad-section) var(--space-6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-5)',
          }}
        >
          {buildKinds.map((item) => (
            <Card key={item.eyebrow}>
              <Eyebrow muted>{item.eyebrow}</Eyebrow>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: 'var(--space-3) 0' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>{item.body}</p>
            </Card>
          ))}
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Eyebrow tick>How it goes</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 640, margin: 'var(--space-4) 0 var(--space-6)' }}>
            From a rough idea to infrastructure that’s actually yours.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            {processSteps.map((step) => (
              <div key={step.num}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-gold)', fontSize: 'var(--text-eyebrow)' }}>
                  {step.num}
                </div>
                <div style={{ fontWeight: 700 as unknown as number, margin: '8px 0 6px', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontSize: 'var(--text-sm)' }}>
                  {step.label}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-prose)', margin: '0 auto', padding: 'var(--pad-section) var(--space-6)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 'var(--weight-light)' as unknown as number, fontSize: 'var(--text-display-3)', margin: '0 0 var(--space-4)' }}>
            Tell us what you’re trying to build.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', margin: '0 0 var(--space-5)' }}>
            Pricing is scoped per project — there’s no package to fit yourself into. Thirty minutes
            tells us if we’re the right build partner.
          </p>
          <button
            onClick={() => setChatOpen(true)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-sm)',
              letterSpacing: 'var(--tracking-wide)',
              textTransform: 'uppercase',
              color: 'var(--text-on-gold)',
              background: 'var(--gold-500)',
              border: 'none',
              borderRadius: 24,
              padding: '14px 28px',
              cursor: 'pointer',
            }}
          >
            Chat with an expert
          </button>
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
          gap: 'var(--space-4)',
          textAlign: 'center',
        }}
      >
        <img src="/meridian/meridian-logo.png" alt="Meridian" style={{ height: 40, width: 'auto' }} />
        <a href="mailto:info@meridiangtn.com" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
          info@meridiangtn.com
        </a>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>
          Meridian is <a href="https://bhaveslab.com" style={{ color: 'var(--text-faint)' }}>a Bhavé’s Lab</a> company
        </div>
      </footer>

      <ChatIntake open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
