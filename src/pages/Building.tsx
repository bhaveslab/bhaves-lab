import { useEffect } from 'react';
import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';

export function Building() {
  useEffect(() => {
    document.title = "Bhavé's Lab — Building";
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        background: 'var(--surface-void)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-body)',
        minHeight: '100vh',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FieldBackground particleDensity="moderate" />

      <style>{`
        .bl-beam {
          position: absolute;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,106,0.55) 20%, rgba(216,190,132,0.85) 50%, rgba(201,169,106,0.55) 80%, transparent);
          filter: blur(0.5px);
          opacity: 0;
          pointer-events: none;
          z-index: 5;
        }
        .bl-beam-a { animation: bl-beam-sweep-a 9s var(--ease-inout) infinite; }
        .bl-beam-b { animation: bl-beam-sweep-b 13s var(--ease-inout) infinite 3.2s; }
        @keyframes bl-beam-sweep-a {
          0% { top: -2%; opacity: 0; }
          8% { opacity: 0.9; }
          50% { opacity: 0.35; }
          92% { opacity: 0.9; }
          100% { top: 102%; opacity: 0; }
        }
        @keyframes bl-beam-sweep-b {
          0% { top: 102%; opacity: 0; }
          10% { opacity: 0.7; }
          50% { opacity: 0.25; }
          90% { opacity: 0.7; }
          100% { top: -2%; opacity: 0; }
        }
        .bl-cursor {
          display: inline-block;
          width: 7px;
          height: 12px;
          background: var(--text-gold);
          margin-left: 2px;
          vertical-align: -1px;
          animation: bl-blink 1.1s steps(1) infinite;
        }
        @keyframes bl-blink { 50% { opacity: 0; } }
        .bl-tick {
          animation: bl-tick-pulse 2.4s var(--ease-inout) infinite;
        }
        @keyframes bl-tick-pulse {
          0%, 100% { opacity: 0.4; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bl-beam-a, .bl-beam-b, .bl-tick, .bl-cursor { animation: none; }
        }
      `}</style>

      <div className="bl-beam bl-beam-a" />
      <div className="bl-beam bl-beam-b" />

      <div
        style={{
          position: 'fixed',
          top: 24,
          left: 28,
          zIndex: 10,
          fontFamily: 'var(--font-serif)',
          fontSize: 17,
          color: 'var(--text-primary)',
          opacity: 0.9,
        }}
      >
        Bhavé&rsquo;s Lab
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: 'min(680px, 88vw)',
          padding: 'clamp(36px, 6vw, 64px) clamp(28px, 5vw, 56px)',
          textAlign: 'center',
        }}
      >
        {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
          <span
            key={corner}
            style={{
              position: 'absolute',
              width: 22,
              height: 22,
              opacity: 0.8,
              borderColor: 'var(--border-gold)',
              top: corner.startsWith('t') ? 0 : undefined,
              bottom: corner.startsWith('b') ? 0 : undefined,
              left: corner.endsWith('l') ? 0 : undefined,
              right: corner.endsWith('r') ? 0 : undefined,
              borderTop: corner.startsWith('t') ? '1.5px solid' : undefined,
              borderBottom: corner.startsWith('b') ? '1.5px solid' : undefined,
              borderLeft: corner.endsWith('l') ? '1.5px solid' : undefined,
              borderRight: corner.endsWith('r') ? '1.5px solid' : undefined,
            }}
          />
        ))}

        <Eyebrow tick>Bhavé&rsquo;s Lab</Eyebrow>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 'var(--weight-light)' as unknown as number,
            fontSize: 'clamp(34px, 6vw, 54px)',
            lineHeight: 'var(--leading-tight)',
            letterSpacing: 'var(--tracking-tight)',
            color: 'var(--text-primary)',
            margin: 'var(--space-6) 0 0',
          }}
        >
          Under construction.
          <br />
          On purpose.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-secondary)',
            maxWidth: 480,
            margin: 'var(--space-4) auto 0',
          }}
        >
          The next system is in production — hardware first, then everything built around it. What&rsquo;s live now is
          scaffolding, not the build.
        </p>

        <div
          style={{
            margin: 'var(--space-6) auto 0',
            display: 'inline-block',
            textAlign: 'left',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            lineHeight: 2,
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
            borderTop: '1px solid var(--border-subtle)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '14px 0',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 108 }}>STATUS</span>
            <span style={{ color: 'var(--text-gold)' }}>
              BUILDING
              <span className="bl-cursor" />
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 108 }}>FOCUS</span>
            <span style={{ color: 'var(--text-primary)' }}>HARDWARE IN PRODUCTION</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'inline-block', width: 108 }}>COMPLETION</span>
            <span style={{ color: 'var(--text-primary)' }}>WHEN IT&rsquo;S OBVIOUS</span>
          </div>
        </div>

        <p
          style={{
            marginTop: 'var(--space-5)',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          No forcing. No countdown. Check back.
        </p>
      </div>

      <footer
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '22px 28px',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.08em',
        }}
      >
        <a href="mailto:info@bhaveslab.com" style={{ color: 'var(--text-muted)' }}>
          info@bhaveslab.com
        </a>
        <a href="/shop" style={{ color: 'var(--text-muted)' }}>
          Shop &rarr;
        </a>
      </footer>
    </div>
  );
}
