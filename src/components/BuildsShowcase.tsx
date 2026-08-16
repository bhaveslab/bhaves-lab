import { useEffect, useRef, useState } from 'react';

interface Screen {
  src: string;
  label: string;
  phase: number; // stagger offset so phones don't bob in sync
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
    key: 'kitchen',
    title: "Iyānu's Kitchen",
    description: 'Guest-facing ordering, built and owned by the restaurant — no third-party marketplace.',
    steps: [
      { label: 'Browse the menu', detail: 'Real dishes, real prices, no third-party markup.' },
      { label: 'Order and pay', detail: 'Checkout goes straight to the restaurant.' },
      { label: 'Track status', detail: 'Received, preparing, ready — no guesswork.' },
    ],
    screens: [{ src: 'https://order.wholelisticlyfe.com', label: 'Storefront', phase: 0 }],
  },
  {
    key: 'taxi',
    title: 'Taxi Directo',
    description:
      'A complete system, not just an app — every driver gets their own personally-branded side, and their own passenger side, working together with no faceless dispatcher and no middleman markup.',
    steps: [
      { label: 'Driver goes online', detail: 'One tap — status shows live on their own QR code.' },
      { label: 'Passenger scans and books', detail: 'Their request goes straight to the driver’s WhatsApp.' },
      { label: 'Ride and get paid direct', detail: 'No hidden fees, no cut taken off the top.' },
    ],
    screens: [
      { src: 'https://meridian-taxi.vercel.app/driver.html', label: 'Driver', phase: 0 },
      { src: 'https://meridian-taxi.vercel.app/passenger.html', label: 'Passenger', phase: Math.PI },
    ],
  },
];

function usePhoneFloat(phase: number) {
  const ref = useRef<HTMLDivElement>(null);
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
  const floatRef = usePhoneFloat(screen.phase);
  const [failed, setFailed] = useState(false);

  return (
    <div className="bl-build-phone-col">
      <div ref={floatRef} className="bl-build-phone">
        {!failed ? (
          <iframe
            src={screen.src}
            loading="lazy"
            title={`${title} — ${screen.label}`}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="bl-build-fallback">
            <a href={screen.src} target="_blank" rel="noopener noreferrer">
              Open live site
            </a>
          </div>
        )}
      </div>
      {screen.label && <div className="bl-build-screen-label">{screen.label}</div>}
    </div>
  );
}

function BuildGroup({ build }: { build: BuildEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bl-build-wrap">
      <div className="bl-build-phones">
        {build.screens.map((screen) => (
          <BuildPhoneScreen key={screen.src} screen={screen} title={build.title} />
        ))}
      </div>

      <div className="bl-build-meta">
        <h3>{build.title}</h3>
        <p>{build.description}</p>
        <button className={`bl-build-toggle${open ? ' is-open' : ''}`} onClick={() => setOpen((o) => !o)}>
          <span>How it works</span>
          <span className="bl-build-chevron">▾</span>
        </button>
        <div className={`bl-build-panel${open ? ' is-open' : ''}`}>
          <div className="bl-build-panel-inner">
            {build.steps.map((step, i) => (
              <div className="bl-build-step" key={step.label}>
                <div className="bl-build-step-n">{i + 1}</div>
                <p>
                  <strong>{step.label}</strong> — {step.detail}
                </p>
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
        <div className="bl-builds-eyebrow">Meridian Builds</div>
        <h2>Our Own Builds</h2>
        <p>What we've built — and what we can build.</p>
      </div>

      <div className="bl-builds-field">
        {BUILDS.map((build) => (
          <BuildGroup key={build.key} build={build} />
        ))}
      </div>

      <style>{`
        .bl-builds-section {
          position: relative;
          z-index: 1;
          padding: var(--space-7, 80px) var(--space-4, 24px);
          max-width: 1100px;
          margin: 0 auto;
        }
        .bl-builds-head { text-align: center; margin-bottom: var(--space-6, 56px); }
        .bl-builds-eyebrow {
          font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--gold-soft, #E3C868); margin-bottom: 10px;
        }
        .bl-builds-head h2 { font-family: 'Fraunces', serif; font-size: 32px; font-weight: 600; margin-bottom: 10px; }
        .bl-builds-head p { color: var(--text-dim, rgba(243,237,221,0.6)); font-size: 14.5px; }

        .bl-builds-field {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: flex-start;
          gap: 72px 104px;
        }

        /* No card, no border, no fill — same rule as the globe wrap */
        .bl-build-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bl-build-wrap:nth-child(1) { transform: translateY(-10px); }
        .bl-build-wrap:nth-child(2) { transform: translateY(18px); }

        .bl-build-phones {
          display: flex;
          align-items: flex-start;
          gap: 28px;
        }

        .bl-build-phone-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .bl-build-phone {
          width: 190px;
          aspect-ratio: 9 / 18.5;
          border-radius: 28px;
          overflow: hidden;
          background: #0A0A0C;
          filter: drop-shadow(0 0 24px rgba(255, 200, 110, 0.26));
          will-change: transform;
        }
        .bl-build-phone iframe { width: 100%; height: 100%; border: none; display: block; }
        .bl-build-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: rgba(243,237,221,0.04);
        }
        .bl-build-fallback a { color: var(--gold-soft, #E3C868); font-size: 12px; text-decoration: none; }

        .bl-build-screen-label {
          margin-top: 10px; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--text-dim, rgba(243,237,221,0.5));
        }

        .bl-build-meta { margin-top: 22px; text-align: center; max-width: 340px; }
        .bl-build-meta h3 { font-family: 'Fraunces', serif; font-size: 18px; font-weight: 600; margin-bottom: 6px; }
        .bl-build-meta p { font-size: 12px; color: var(--text-dim, rgba(243,237,221,0.6)); line-height: 1.5; }

        .bl-build-toggle {
          margin-top: 14px; background: none; border: none; color: var(--gold-soft, #E3C868);
          font-size: 11px; font-weight: 600; letter-spacing: 0.03em; cursor: pointer;
          display: inline-flex; align-items: center; gap: 5px; padding: 4px 0;
        }
        .bl-build-chevron { transition: transform 0.25s; display: inline-block; }
        .bl-build-toggle.is-open .bl-build-chevron { transform: rotate(180deg); }

        .bl-build-panel { max-height: 0; overflow: hidden; transition: max-height 0.35s ease; text-align: left; }
        .bl-build-panel.is-open { max-height: 400px; }
        .bl-build-panel-inner { padding: 14px 4px 4px; display: flex; flex-direction: column; gap: 10px; }
        .bl-build-step { display: flex; gap: 9px; align-items: flex-start; }
        .bl-build-step-n {
          flex: 0 0 auto; width: 18px; height: 18px; border-radius: 999px; border: 1px solid var(--gold, #C9A227);
          color: var(--gold-soft, #E3C868); font-size: 9.5px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; margin-top: 1px;
        }
        .bl-build-step p { font-size: 11.5px; color: var(--text-dim, rgba(243,237,221,0.6)); line-height: 1.4; }
        .bl-build-step strong { color: var(--text, #F3EDDD); }

        @media (max-width: 768px) {
          .bl-build-wrap:nth-child(1),
          .bl-build-wrap:nth-child(2) { transform: none; }
          .bl-build-phone { width: 150px; }
          .bl-build-phones { gap: 18px; }
        }
      `}</style>
    </section>
  );
}
