import { useEffect, useState } from 'react';
import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';
import { Card } from '../components/Card';
import { PolyhedronGlobe } from '../components/PolyhedronGlobe';
import { ChatIntake } from '../components/ChatIntake';
import { Link } from '../router';
import { meridianSystems } from './MeridianSystems';

const traits = [
  { title: 'Client-owned', body: 'Every account, repo, and server lives in infrastructure you control from day one.' },
  { title: 'Scoped per project', body: 'No fixed packages. Pricing follows the actual shape of the build.' },
  { title: 'Built around the operation', body: 'We start with how the business actually works, then design the digital layer around it.' },
  { title: 'A Bhavé’s Lab company', body: 'The same team and standards behind the Lab’s own product line.' },
];

const buildKinds = [
  { eyebrow: 'DIGITAL INFRASTRUCTURE', title: 'Operation before interface', body: 'We identify what the business needs to do before deciding what the screen should look like.' },
  { eyebrow: 'CUSTOMER EXPERIENCE', title: 'One owned path', body: 'Discovery, booking, communication and service brought into one coherent experience.' },
  { eyebrow: 'OPERATOR SYSTEMS', title: 'The other side of the screen', body: 'Dashboards, workflow and internal tools that support the public experience.' },
];

const processSteps = [
  { num: '01', label: 'Observe', desc: 'We look at the real operation and find where the business is stronger than the digital layer around it.' },
  { num: '02', label: 'Scope', desc: 'We define the smallest useful system that closes that gap without forcing the business into a package.' },
  { num: '03', label: 'Build in the open', desc: 'You see working versions early — not a status deck, the actual thing running.' },
  { num: '04', label: 'Hand you the keys', desc: 'The accounts, infrastructure and repository are yours. We build it. You own it.' },
];

export function Meridian() {
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    document.title = 'Meridian — GTN';
  }, []);

  return (
    <div style={{ position: 'relative', background: 'var(--surface-void)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', minHeight: '100vh', overflowX: 'hidden' }}>
      <FieldBackground particleDensity="moderate" />

      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-5) var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/meridian/meridian-logo.png" alt="Meridian" style={{ height: 28, width: 'auto' }} />
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, letterSpacing: '0.01em' }}>MERIDIAN</div>
        </div>
        <button onClick={() => setChatOpen(true)} className="bl-pill-link" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--text-primary)', background: 'var(--gold-500)', border: 'none', borderRadius: 24, padding: '10px 22px', cursor: 'pointer' }}>
          Start a conversation
        </button>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        <section style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', alignItems: 'center', padding: '0 var(--space-6)', gap: 'var(--space-6)' }}>
          <div style={{ maxWidth: 680 }}>
            <Eyebrow tick>Digital infrastructure · business systems</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-body)', fontWeight: 800 as unknown as number, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1, letterSpacing: 'var(--tracking-tight)', margin: 'var(--space-4) 0 var(--space-5)' }}>
              When the business is stronger than its digital expression, <span style={{ color: 'var(--text-gold)' }}>we close the gap.</span>
            </h1>
            <p style={{ fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)', color: 'var(--text-secondary)', margin: '0 0 var(--space-5)', maxWidth: 600 }}>
              Meridian designs and builds the systems businesses use to be discovered, booked, operated and experienced — from the customer-facing layer to the infrastructure underneath it.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
              <Link to="/systems" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-on-gold)', background: 'var(--gold-500)', borderRadius: 24, padding: '14px 28px', textDecoration: 'none' }}>
                Explore systems
              </Link>
              <a href="#what-we-build" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
                How we build ↓
              </a>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PolyhedronGlobe size={380} />
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-6)' }}>
          {traits.map((t) => (
            <div key={t.title}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700 as unknown as number, marginBottom: 6 }}>{t.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{t.body}</div>
            </div>
          ))}
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--pad-section) var(--space-6)' }}>
          <Eyebrow tick>Systems in the Lab</Eyebrow>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'end', flexWrap: 'wrap', margin: 'var(--space-4) 0 var(--space-6)' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 760, margin: 0 }}>See your kind of business inside a working system.</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)', maxWidth: 720, marginTop: 16 }}>
                These are concept systems, not fixed templates. They show how an operation can look when its digital layer finally matches the business behind it.
              </p>
            </div>
            <Link to="/systems" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', color: 'var(--text-gold)' }}>View all systems →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-5)' }}>
            {meridianSystems.map((system) => (
              <Link key={system.kind} to={`/systems/${system.kind}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card>
                  <Eyebrow muted>{system.eyebrow}</Eyebrow>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-2)', margin: '14px 0 10px' }}>{system.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', minHeight: 88 }}>{system.summary}</p>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', marginTop: 20 }}>Open prototype →</div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section id="what-we-build" style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: 'var(--pad-section) var(--space-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
          {buildKinds.map((item) => (
            <Card key={item.eyebrow}>
              <Eyebrow muted>{item.eyebrow}</Eyebrow>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: 'var(--space-3) 0' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>{item.body}</p>
            </Card>
          ))}
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Eyebrow tick>How it goes</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 680, margin: 'var(--space-4) 0 var(--space-6)' }}>
            We start with the operation, not a package.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            {processSteps.map((step) => (
              <div key={step.num}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-gold)', fontSize: 'var(--text-eyebrow)' }}>{step.num}</div>
                <div style={{ fontWeight: 700 as unknown as number, margin: '8px 0 6px', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)', fontSize: 'var(--text-sm)' }}>{step.label}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-normal)' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-prose)', margin: '0 auto', padding: 'var(--pad-section) var(--space-6)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 'var(--weight-light)' as unknown as number, fontSize: 'var(--text-display-3)', margin: '0 0 var(--space-4)' }}>Show us how the business works now.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', margin: '0 0 var(--space-5)', lineHeight: 'var(--leading-relaxed)' }}>
            We’ll identify where the digital layer is getting in the way, what should stay simple, and what is worth building.
          </p>
          <button onClick={() => setChatOpen(true)} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase', color: 'var(--text-on-gold)', background: 'var(--gold-500)', border: 'none', borderRadius: 24, padding: '14px 28px', cursor: 'pointer' }}>
            Start a conversation
          </button>
        </section>
      </main>

      <footer style={{ position: 'relative', zIndex: 10, borderTop: '1px solid var(--border-subtle)', padding: 'var(--space-7) var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', textAlign: 'center' }}>
        <img src="/meridian/meridian-logo.png" alt="Meridian" style={{ height: 40, width: 'auto' }} />
        <a href="mailto:info@meridiangtn.com" style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>info@meridiangtn.com</a>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-faint)' }}>Meridian is <a href="https://bhaveslab.com" style={{ color: 'var(--text-faint)' }}>a Bhavé’s Lab</a> company</div>
      </footer>

      <ChatIntake open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
