import { useEffect, useState } from 'react';
import { FieldBackground } from '../components/FieldBackground';
import { Eyebrow } from '../components/Eyebrow';
import { Card } from '../components/Card';
import { PolyhedronGlobe } from '../components/PolyhedronGlobe';
import { ChatIntake } from '../components/ChatIntake';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { meridianCopy } from '../i18n/meridianCopy';

function MeridianContent() {
  const [chatOpen, setChatOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();
  const copy = meridianCopy[lang];

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

      <style>{`
        .bl-meridian-header { padding: var(--space-5) var(--space-6); }
        .bl-meridian-logo { height: 32px; width: auto; }
        .bl-meridian-wordmark { font-size: 18px; }
        .bl-meridian-hero { grid-template-columns: 1.1fr 0.9fr; padding: 0 var(--space-6); }
        .bl-meridian-globe-wrap { transform: translateX(48px); }

        @media (max-width: 768px) {
          .bl-meridian-header { padding: var(--space-4) var(--space-5); }
          .bl-meridian-logo { height: 26px; }
          .bl-meridian-wordmark { font-size: 15px; }
          .bl-meridian-hero { grid-template-columns: 1fr; padding: 112px var(--space-5) var(--space-6); }
          .bl-meridian-globe-wrap { transform: none; margin: var(--space-5) auto 0; justify-self: center; }
          .bl-meridian-globe-inner {
            width: 260px;
            height: 260px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .bl-meridian-globe-inner > div { transform: scale(0.5); }
        }
      `}</style>

      <header
        className="bl-meridian-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/meridian/meridian-logo.png" alt="Meridian" className="bl-meridian-logo" />
           <div className="bl-meridian-wordmark" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.01em' }}>
  MERIDIAN <span style={{ color: 'var(--text-gold)' }}>GLOBAL</span>
</div>



        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleLang}
            aria-label="Toggle language"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              letterSpacing: 'var(--tracking-label)',
              color: 'var(--text-primary)',
              background: 'transparent',
              border: '1px solid var(--border-gold)',
              borderRadius: 24,
              padding: '9px 14px',
              cursor: 'pointer',
            }}
          >
            <span style={{ color: lang === 'en' ? 'var(--text-gold)' : 'var(--text-faint)' }}>EN</span>
            <span style={{ color: 'var(--text-faint)' }}>/</span>
            <span style={{ color: lang === 'es' ? 'var(--text-gold)' : 'var(--text-faint)' }}>ES</span>
          </button>
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
            {copy.header.chatButton}
          </button>
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 10 }}>
        <section
          className="bl-meridian-hero"
          style={{
            minHeight: '100vh',
            display: 'grid',
            alignItems: 'center',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ maxWidth: 640 }}>
            <Eyebrow tick>{copy.hero.eyebrow}</Eyebrow>
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
              {copy.hero.h1Part1}{' '}
              <span style={{ color: 'var(--text-gold)' }}>{copy.hero.h1Part2}</span>
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
              {copy.hero.paragraph}
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
                {copy.hero.ctaButton}
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
                {copy.hero.seeMore}
              </a>
            </div>
          </div>

        <div className="bl-meridian-globe-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div className="bl-meridian-globe-inner">
    <PolyhedronGlobe size={520} />
  </div>
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
          {copy.traits.map((t) => (
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
          {copy.buildKinds.map((item) => (
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
          <Eyebrow tick>{copy.servicesHeading.eyebrow}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 640, margin: 'var(--space-4) 0 var(--space-6)' }}>
            {copy.servicesHeading.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
            {copy.services.map((s) => (
              <Card key={s.title}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-3)' }}>
                  {s.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>{s.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Eyebrow tick>{copy.processHeading.eyebrow}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 640, margin: 'var(--space-4) 0 var(--space-6)' }}>
            {copy.processHeading.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-6)' }}>
            {copy.processSteps.map((step) => (
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

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Eyebrow tick>{copy.buildsHeading.eyebrow}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 640, margin: 'var(--space-4) 0 var(--space-3)' }}>
            {copy.buildsHeading.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', lineHeight: 'var(--leading-relaxed)', maxWidth: 560, margin: '0 0 var(--space-6)' }}>
            {copy.buildsHeading.intro}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-5)' }}>
            {copy.exampleBuilds.map((b) => (
              <Card key={b.title}>
                {b.statusKind === 'delivered' ? <Eyebrow>{b.status}</Eyebrow> : <Eyebrow muted>{b.status}</Eyebrow>}
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: 'var(--space-3) 0' }}>
                  {b.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>{b.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 var(--space-6) var(--pad-section)' }}>
          <Eyebrow tick>{copy.pricingHeading.eyebrow}</Eyebrow>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display-3)', maxWidth: 640, margin: 'var(--space-4) 0 var(--space-6)' }}>
            {copy.pricingHeading.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-5)' }}>
            {copy.pricingTiers.map((tier) => (
              <Card key={tier.title}>
                <Eyebrow muted>{tier.eyebrow}</Eyebrow>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: 'var(--space-3) 0' }}>
                  {tier.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-body)', margin: 0 }}>{tier.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: 'var(--container-prose)', margin: '0 auto', padding: 'var(--pad-section) var(--space-6)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 'var(--weight-light)' as unknown as number, fontSize: 'var(--text-display-3)', margin: '0 0 var(--space-4)' }}>
            {copy.closing.title}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lead)', margin: '0 0 var(--space-5)' }}>
            {copy.closing.paragraph}
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
            {copy.closing.button}
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
          {copy.footer.tagline} <a href="https://bhaveslab.com" style={{ color: 'var(--text-faint)' }}>Bhavé’s Lab</a>{copy.footer.suffix}
        </div>
      </footer>

      <ChatIntake open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

export function Meridian() {
  return (
    <LanguageProvider>
      <MeridianContent />
    </LanguageProvider>
  );
}
