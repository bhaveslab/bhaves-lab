import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';
import { Card } from '../components/Card';
import { Link } from '../router';

export type MeridianSystemKind = 'restaurant' | 'transport' | 'cleaning' | 'tours';

type SystemDefinition = {
  kind: MeridianSystemKind;
  eyebrow: string;
  title: string;
  summary: string;
  audience: string;
  accent: string;
  modules: string[];
  metrics: { label: string; value: string }[];
  actions: string[];
};

export const meridianSystems: SystemDefinition[] = [
  {
    kind: 'restaurant',
    eyebrow: 'RESTAURANT / HOSPITALITY',
    title: 'Direct Guest Experience',
    summary: 'One owned destination for menu, reservations, events, location, WhatsApp and the story of the room.',
    audience: 'Built so a restaurant that has outgrown Linktree and social can see the next version of itself.',
    accent: 'Tonight · 7:30 PM',
    modules: ['Bilingual menu', 'Reservations', 'Events + private dining', 'WhatsApp fallback', 'Guest CRM', 'Analytics'],
    metrics: [
      { label: 'Reservations', value: '42' },
      { label: 'Direct inquiries', value: '18' },
      { label: 'Private events', value: '6' },
    ],
    actions: ['Reserve a table', 'View tonight’s menu', 'Plan a private dinner'],
  },
  {
    kind: 'transport',
    eyebrow: 'TAXI / TRANSPORTATION',
    title: 'Dispatch + Ride System',
    summary: 'A mobile-first booking and dispatch layer for independent taxi fleets, transfers and private drivers.',
    audience: 'Built so a local operator can see bookings, drivers and riders living in one system instead of scattered messages.',
    accent: '3 drivers available',
    modules: ['Ride request', 'Live dispatch', 'Driver status', 'Airport + hotel transfers', 'Fare estimates', 'Trip history'],
    metrics: [
      { label: 'Active rides', value: '7' },
      { label: 'Drivers online', value: '12' },
      { label: 'Today’s bookings', value: '31' },
    ],
    actions: ['Book a ride', 'Schedule airport transfer', 'Dispatch nearest driver'],
  },
  {
    kind: 'cleaning',
    eyebrow: 'CLEANING / FIELD SERVICE',
    title: 'Service Operations System',
    summary: 'Website, scheduling, bookings, job progress, messaging and payment-ready flows in one customer experience.',
    audience: 'Built so a cleaning company can look at the screen and immediately recognize how its day-to-day operation could run digitally.',
    accent: 'Next opening · 10:30 AM',
    modules: ['Service catalog', 'Scheduling', 'Job status', 'Customer messages', 'Recurring service', 'Payment-ready UI'],
    metrics: [
      { label: 'Jobs today', value: '14' },
      { label: 'In progress', value: '5' },
      { label: 'Recurring clients', value: '63' },
    ],
    actions: ['Schedule service', 'Track my cleaning', 'Message the team'],
  },
  {
    kind: 'tours',
    eyebrow: 'TOURS / EXCURSIONS',
    title: 'Direct Booking Experience',
    summary: 'Tours, availability, pickup details, custom itinerary requests and direct booking without losing the personal operator relationship.',
    audience: 'Built so a tour company can keep WhatsApp where it helps while owning the actual discovery and booking journey.',
    accent: 'Tomorrow · 4 departures',
    modules: ['Tour catalog', 'Availability', 'Pickup zones', 'Custom itineraries', 'Multilingual content', 'WhatsApp handoff'],
    metrics: [
      { label: 'Open departures', value: '9' },
      { label: 'Direct bookings', value: '24' },
      { label: 'Custom requests', value: '11' },
    ],
    actions: ['Choose an excursion', 'Build a private itinerary', 'Confirm pickup'],
  },
];

const shell: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  background: 'var(--surface-void)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-body)',
};

const topLink: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-xs)',
  letterSpacing: 'var(--tracking-label)',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  textDecoration: 'none',
};

export function MeridianSystemsIndex() {
  return (
    <div style={shell}>
      <FieldBackground particleDensity="moderate" />
      <main style={{ position: 'relative', zIndex: 2, maxWidth: 'var(--container-max)', margin: '0 auto', padding: '48px var(--space-6) 96px' }}>
        <Link to="/" style={topLink}>← Meridian</Link>
        <div style={{ maxWidth: 760, padding: '88px 0 56px' }}>
          <Eyebrow tick>Systems in the Lab</Eyebrow>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 400, margin: '20px 0' }}>
            See the business inside the system.
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)', maxWidth: 680 }}>
            Working concept systems for businesses whose real-world operation is stronger than the digital layer around it.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
          {meridianSystems.map((system) => (
            <Link key={system.kind} to={`/systems/${system.kind}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card>
                <Eyebrow muted>{system.eyebrow}</Eyebrow>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-2)', margin: '16px 0 12px' }}>{system.title}</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)', minHeight: 76 }}>{system.summary}</p>
                <div style={{ marginTop: 24, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>
                  Open prototype →
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

export function MeridianSystemPrototype({ kind }: { kind: MeridianSystemKind }) {
  const system = meridianSystems.find((item) => item.kind === kind) ?? meridianSystems[0];

  return (
    <div style={shell}>
      <FieldBackground particleDensity="moderate" />
      <main style={{ position: 'relative', zIndex: 2, maxWidth: 'var(--container-max)', margin: '0 auto', padding: '48px var(--space-6) 96px' }}>
        <Link to="/systems" style={topLink}>← All systems</Link>

        <section style={{ padding: '72px 0 40px', display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(280px, .85fr)', gap: 'var(--space-7)', alignItems: 'end' }}>
          <div>
            <Eyebrow tick>{system.eyebrow}</Eyebrow>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'clamp(44px, 6vw, 76px)', lineHeight: 1.02, margin: '20px 0' }}>{system.title}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)', maxWidth: 720 }}>{system.summary}</p>
          </div>
          <Card>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-gold)', letterSpacing: 'var(--tracking-wide)', textTransform: 'uppercase' }}>Live state</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-2)', marginTop: 12 }}>{system.accent}</div>
          </Card>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {system.metrics.map((metric) => (
            <Card key={metric.label}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-wide)' }}>{metric.label}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', marginTop: 8 }}>{metric.value}</div>
            </Card>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0, .9fr) minmax(0, 1.1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-7)' }}>
          <Card>
            <Eyebrow muted>Customer side</Eyebrow>
            <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
              {system.actions.map((action, index) => (
                <button key={action} type="button" style={{ textAlign: 'left', padding: '16px 18px', borderRadius: 16, border: '1px solid var(--border-subtle)', background: index === 0 ? 'var(--gold-500)' : 'transparent', color: index === 0 ? 'var(--text-on-gold)' : 'var(--text-primary)', fontFamily: 'var(--font-body)', cursor: 'default' }}>
                  {action}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <Eyebrow muted>Operator side</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 20 }}>
              {system.modules.map((module) => (
                <div key={module} style={{ padding: '18px', border: '1px solid var(--border-subtle)', borderRadius: 16, background: 'rgba(255,255,255,.02)' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 99, background: 'var(--gold-500)', marginBottom: 12 }} />
                  <div style={{ fontWeight: 700 }}>{module}</div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section style={{ maxWidth: 820, padding: '48px 0 16px' }}>
          <Eyebrow tick>Why this exists</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontSize: 'var(--text-display-3)', margin: '16px 0' }}>
            The point is recognition, not a template.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', lineHeight: 'var(--leading-relaxed)' }}>{system.audience}</p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 'var(--leading-relaxed)' }}>
            Meridian scopes each build around the actual operation. These prototypes show the shape of a system, not a package every business is forced into.
          </p>
        </section>
      </main>
    </div>
  );
}
