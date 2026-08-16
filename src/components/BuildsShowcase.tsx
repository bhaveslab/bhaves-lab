import { useEffect, useRef, useState } from 'react';

interface BuildEntry {
  key: string;
  src: string;
  title: string;
  description: string;
  steps: { label: string; detail: string }[];
  phase: number; // stagger offset so phones don't bob in sync
}

const BUILDS: BuildEntry[] = [
  {
    key: 'kitchen',
    src: 'https://order.wholelisticlyfe.com',
    title: "Iyānu's Kitchen",
    description: 'Guest-facing ordering, built and owned by the restaurant — no third-party marketplace.',
    steps: [
      { label: 'Browse the menu', detail: 'Real dishes, real prices, no third-party markup.' },
      { label: 'Order and pay', detail: 'Checkout goes straight to the restaurant.' },
      { label: 'Track status', detail: 'Received, preparing, ready — no guesswork.' },
    ],
    phase: 0,
  },
  {
    key: 'taxi',
    src: 'https://meridian-taxi.vercel.app',
    title: 'Taxi Directo',
    description: 'Direct transit dispatch — no faceless app, no middleman markup.',
    steps: [
      { label: 'Call or message', detail: 'No app download, no account setup.' },
      { label: 'Share your route', detail: 'A driver confirms in minutes.' },
      { label: 'Ride and pay direct', detail: 'No hidden fees, no surge pricing.' },
    ],
    phase: Math.PI, // opposite phase — drifts the other direction
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

function BuildPhone({ build }: { build: BuildEntry }) {
  const floatRef = usePhoneFloat(build.phase);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="bl-build-wrap">
      <div ref={floatRef} className="bl-build-phone">
        {!failed ? (
          <iframe
            src={build.src}
            loading="lazy"
            title={build.title}
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="bl-build-fallback">
            <a href={build.src} target="_blank" rel="noopener noreferrer">
              Open live site
            </a>
          </div>
        )}
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
          <BuildPhone key={build.key} build={build} />
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
          gap: 64px 96px;
        }

        /* No card, no border, no fill — same rule as the globe wrap */
        .bl-build-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 240px;
        }
        .bl-build-wrap:nth-child(1) { transform: translateY(-10px); }
        .bl-build-wrap:nth-child(2) { transform: translateY(18px); }

        .bl-build-phone {
          width: 240px;
          aspect-ratio: 9 / 18.5;
          border-radius: 32px;
          overflow: hidden;
          background: #0A0A0C;
          filter: drop-shadow(0 0 28px rgba(255, 200, 110, 0.28));
          will-change: transform;
        }
        .bl-build-phone iframe { width: 100%; height: 100%; border: none; display: block; }
        .bl-build-fallback {
          width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
          background: rgba(243,237,221,0.04);
        }
        .bl-build-fallback a { color: var(--gold-soft, #E3C868); font-size: 13px; text-decoration: none; }

        .bl-build-meta { margin-top: 22px; text-align: center; }
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
          .bl-build-phone { width: 210px; }
        }
      `}</style>
    </section>
  );
}
