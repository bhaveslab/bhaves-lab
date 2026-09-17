import { useEffect, useRef, useState } from 'react';

interface Screen {
  src: string;
  image: string;
  aspect: string;
  width: number;
  label?: string;
  phase: number;
}

interface BuildEntry {
  key: string;
  title: string;
  description: string;
  steps: { label: string; detail: string }[];
  screens: Screen[];
}

const BUILDS: BuildEntry[] = [
  {
    key: 'taxi',
    title: 'Taxi Directo',
    description:
      'A complete driver-and-passenger system that keeps the relationship direct while giving the operator a clearer digital layer.',
    steps: [
      { label: 'Driver goes online', detail: 'Availability updates on the driver side.' },
      { label: 'Passenger books direct', detail: 'The request moves directly to the operator instead of a faceless marketplace.' },
      { label: 'Ride and payment stay direct', detail: 'The system supports the relationship instead of replacing it.' },
    ],
    screens: [
      {
        src: 'https://meridian-taxi.vercel.app/driver.html',
        image: '/images/builds/taxi-driver.png',
        aspect: '660 / 1311',
        width: 190,
        label: 'Driver',
        phase: 0,
      },
      {
        src: 'https://meridian-taxi.vercel.app/passenger.html',
        image: '/images/builds/taxi-passenger.png',
        aspect: '655 / 1309',
        width: 190,
        label: 'Passenger',
        phase: Math.PI,
      },
    ],
  },
];

const CONCEPTS = [
  {
    href: '/systems/restaurant',
    eyebrow: 'RESTAURANT',
    title: 'Direct Guest Experience',
    body: 'Menu, reservations, events, private dining, WhatsApp and the identity of the room in one owned experience.',
  },
  {
    href: '/systems/cleaning',
    eyebrow: 'CLEANING / FIELD SERVICE',
    title: 'Service Operations System',
    body: 'Scheduling, bookings, job progress, customer messaging, recurring service and payment-ready flows.',
  },
  {
    href: '/systems/tours',
    eyebrow: 'TOURS / EXCURSIONS',
    title: 'Direct Booking Experience',
    body: 'Tours, availability, pickup details, custom itineraries, multilingual content and WhatsApp handoff.',
  },
  {
    href: '/systems/transport',
    eyebrow: 'TAXI / TRANSPORTATION',
    title: 'Dispatch + Ride System',
    body: 'Ride requests, driver status, scheduled transfers, dispatch and trip history built around the local operator.',
  },
];

function usePhoneFloat<T extends HTMLElement>(phase: number) {
  const ref = useRef<T>(null);
  const angleRef = useRef(phase);

  useEffect(() => {
    let frame: number;
    const tick = () => {
      angleRef.current += 0.0045;
      if (ref.current) {
        const bob = Math.sin(angleRef.current * 2) * 7;
        const tilt = Math.sin(angleRef.current * 0.6) * 1.4;
        ref.current.style.transform = `translateY(${bob}px) rotate(${tilt}deg)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return ref;
}

function BuildPhoneScreen({ screen, title }: { screen: Screen; title: string }) {
  const floatRef = usePhoneFloat<HTMLAnchorElement>(screen.phase);
  const [failed, setFailed] = useState(false);

  return (
    <div className="bl-build-phone-col">
      <a
        ref={floatRef}
        className="bl-build-phone"
        style={{ aspectRatio: screen.aspect, ['--phone-w' as string]: `${screen.width}px` } as React.CSSProperties}
        href={screen.src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title} live`}
      >
        {!failed ? (
          <img
            src={screen.image}
            alt={`${title}${screen.label ? ` — ${screen.label}` : ''} mockup`}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="bl-build-fallback"><span>Open live site</span></div>
        )}
        <div className="bl-build-phone-hint">Tap to try it live</div>
      </a>
      {screen.label && <div className="bl-build-screen-label">{screen.label}</div>}
    </div>
  );
}

function BuildGroup({ build }: { build: BuildEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bl-build-wrap">
      <div className="bl-build-phones">
        {build.screens.map((screen) => <BuildPhoneScreen key={screen.src} screen={screen} title={build.title} />)}
      </div>
      <div className="bl-build-meta">
        <h3>{build.title}</h3>
        <p>{build.description}</p>
        <button className={`bl-build-toggle${open ? ' is-open' : ''}`} onClick={() => setOpen((o) => !o)}>
          <span>How it works</span><span className="bl-build-chevron">▾</span>
        </button>
        <div className={`bl-build-panel${open ? ' is-open' : ''}`}>
          <div className="bl-build-panel-inner">
            {build.steps.map((step, i) => (
              <div className="bl-build-step" key={step.label}>
                <div className="bl-build-step-n">{i + 1}</div>
                <p><strong>{step.label}</strong> — {step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BuildsShowcase() {
  return (
    <section className="bl-builds-section">
      <div className="bl-builds-head">
        <div className="bl-builds-eyebrow">Meridian Systems</div>
        <h2>See Your Business Inside the System</h2>
        <p>One live build, plus working concept systems for the kinds of operators we serve.</p>
      </div>

      <div className="bl-builds-live">
        {BUILDS.map((build) => <BuildGroup key={build.key} build={build} />)}
      </div>

      <div className="bl-system-grid">
        {CONCEPTS.map((concept) => (
          <a className="bl-system-card" key={concept.href} href={concept.href}>
            <div className="bl-system-eyebrow">{concept.eyebrow}</div>
            <h3>{concept.title}</h3>
            <p>{concept.body}</p>
            <span>Open prototype →</span>
          </a>
        ))}
      </div>

      <div className="bl-systems-all"><a href="/systems">Explore all systems →</a></div>

      <style>{`
        .bl-builds-section { position: relative; z-index: 1; padding: var(--space-7, 80px) var(--space-4, 24px); max-width: 1100px; margin: 0 auto; }
        .bl-builds-head { text-align: center; margin-bottom: var(--space-6, 56px); }
        .bl-builds-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold-soft, #E3C868); margin-bottom: 10px; }
        .bl-builds-head h2 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .bl-builds-head p { color: var(--text-dim, rgba(243,237,221,0.6)); font-size: 14.5px; }
        .bl-builds-live { display: flex; justify-content: center; margin-bottom: 64px; }
        .bl-build-wrap { display: flex; flex-direction: column; align-items: center; }
        .bl-build-phones { display: flex; align-items: flex-start; gap: 28px; }
        .bl-build-phone-col { display: flex; flex-direction: column; align-items: center; }
        .bl-build-phone { position: relative; display: block; width: min(var(--phone-w), 78vw); border-radius: 12px; overflow: visible; text-decoration: none; will-change: transform; }
        .bl-build-phone img { width: 100%; height: 100%; object-fit: contain; display: block; }
        .bl-build-fallback { width: 100%; aspect-ratio: 9 / 18.5; display: flex; align-items: center; justify-content: center; background: rgba(243,237,221,0.04); border-radius: 24px; }
        .bl-build-fallback span { color: var(--gold-soft, #E3C868); font-size: 12px; }
        .bl-build-phone-hint { position: absolute; inset: auto 6% 6% 6%; padding: 8px 0; text-align: center; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; color: var(--text, #F3EDDD); text-transform: uppercase; background: linear-gradient(to top, rgba(10,10,12,0.85), rgba(10,10,12,0)); opacity: 0; transition: opacity 0.25s ease; border-radius: 0 0 20px 20px; }
        .bl-build-phone:hover .bl-build-phone-hint, .bl-build-phone:focus-visible .bl-build-phone-hint { opacity: 1; }
        .bl-build-screen-label { margin-top: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dim, rgba(243,237,221,0.5)); }
        .bl-build-meta { margin-top: 22px; text-align: center; max-width: 420px; }
        .bl-build-meta h3 { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; margin-bottom: 6px; }
        .bl-build-meta p { font-size: 12px; color: var(--text-dim, rgba(243,237,221,0.6)); line-height: 1.5; }
        .bl-build-toggle { margin-top: 14px; background: none; border: none; color: var(--gold-soft, #E3C868); font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; padding: 4px 0; }
        .bl-build-chevron { transition: transform 0.25s; display: inline-block; }
        .bl-build-toggle.is-open .bl-build-chevron { transform: rotate(180deg); }
        .bl-build-panel { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; text-align: left; }
        .bl-build-panel.is-open { max-height: 400px; }
        .bl-build-panel-inner { padding: 14px 4px 4px; display: flex; flex-direction: column; gap: 10px; }
        .bl-build-step { display: flex; gap: 9px; align-items: flex-start; }
        .bl-build-step-n { flex: 0 0 auto; width: 18px; height: 18px; border-radius: 999px; border: 1px solid var(--gold, #C9A227); color: var(--gold-soft, #E3C868); font-size: 9.5px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
        .bl-build-step p { font-size: 11.5px; color: var(--text-dim, rgba(243,237,221,0.6)); line-height: 1.4; }
        .bl-build-step strong { color: var(--text, #F3EDDD); }
        .bl-system-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
        .bl-system-card { display: block; padding: 24px; border: 1px solid var(--border-subtle); border-radius: 18px; color: inherit; text-decoration: none; background: rgba(255,255,255,.018); transition: transform .2s ease, border-color .2s ease, background .2s ease; }
        .bl-system-card:hover { transform: translateY(-3px); border-color: var(--border-gold); background: rgba(255,255,255,.03); }
        .bl-system-eyebrow { font-size: 10px; font-weight: 700; letter-spacing: .14em; color: var(--gold-soft, #E3C868); margin-bottom: 12px; }
        .bl-system-card h3 { font-family: 'Fraunces', serif; font-size: 20px; margin: 0 0 10px; }
        .bl-system-card p { font-size: 13px; line-height: 1.55; color: var(--text-dim, rgba(243,237,221,.6)); min-height: 82px; }
        .bl-system-card span { font-size: 11px; font-weight: 600; color: var(--gold-soft, #E3C868); }
        .bl-systems-all { text-align: center; margin-top: 28px; }
        .bl-systems-all a { color: var(--gold-soft, #E3C868); font-size: 12px; }
        @media (max-width: 768px) { .bl-build-phone { width: min(var(--phone-w), 62vw); } .bl-build-phones { gap: 18px; } .bl-system-card p { min-height: auto; } }
      `}</style>
    </section>
  );
}
