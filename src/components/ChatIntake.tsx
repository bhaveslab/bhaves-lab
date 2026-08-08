import { useState } from 'react';

/**
 * Webstacks-style multi-step qualifying form, dressed as a chat panel.
 * Not a live chat — submits to an owned inbox. Steps: email, what you're
 * building, timeline. Replaces the old Calendly embed entirely.
 */

interface ChatIntakeProps {
  open: boolean;
  onClose: () => void;
}

const TOTAL_STEPS = 3;

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

export function ChatIntake({ open, onClose }: ChatIntakeProps) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [buildType, setBuildType] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');

  if (!open) return null;

  const canContinue = step === 1 ? email.includes('@') : step === 2 ? buildType.length > 0 : true;

  const handleSubmit = async () => {
    setStatus('sending');
    try {
      const response = await fetch('/api/meridian-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, buildType, details }),
      });
      const data = await response.json().catch(() => null);
      setStatus(response.ok && data?.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(8, 10, 22, 0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-5)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--surface-void)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ×
        </button>

        {status === 'idle' || status === 'sending' ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 'var(--space-5)' }}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background: i < step ? 'var(--gold-500)' : 'var(--border-subtle)',
                  }}
                />
              ))}
            </div>

            {step === 1 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-2)' }}>
                  What's your work email?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4)' }}>
                  So we know where to send the next message.
                </p>
                <input
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-body)',
                  }}
                />
              </>
            )}

            {step === 2 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-2)' }}>
                  What are you building?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4)' }}>
                  Rough shape is fine — we'll get specific on the call.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Software', 'Hardware', 'Both / not sure yet'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setBuildType(opt)}
                      style={{
                        textAlign: 'left',
                        padding: '12px 14px',
                        background: buildType === opt ? 'var(--gold-500)' : 'var(--surface-input)',
                        color: buildType === opt ? 'var(--text-on-gold)' : 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-body)',
                        cursor: 'pointer',
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-2)' }}>
                  Anything else worth knowing?
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-4)' }}>
                  Optional — timeline, constraints, what's already built.
                </p>
                <textarea
                  autoFocus
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--surface-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-body)',
                    resize: 'vertical',
                  }}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 'var(--space-5)' }}>
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={status === 'sending'}
                  style={{
                    padding: '10px 18px',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                  }}
                >
                  Back
                </button>
              )}
              <button
                disabled={!canContinue || status === 'sending'}
                onClick={() => (step < TOTAL_STEPS ? setStep(step + 1) : handleSubmit())}
                style={{
                  flex: 1,
                  padding: '10px 18px',
                  background: canContinue ? 'var(--gold-500)' : 'var(--border-subtle)',
                  color: canContinue ? 'var(--text-on-gold)' : 'var(--text-faint)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-sm)',
                  letterSpacing: 'var(--tracking-wide)',
                  textTransform: 'uppercase',
                  cursor: canContinue && status !== 'sending' ? 'pointer' : 'not-allowed',
                }}
              >
                {step < TOTAL_STEPS ? 'Continue' : status === 'sending' ? 'Sending…' : 'Send'}
              </button>
            </div>
          </>
        ) : status === 'success' ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-5) 0' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-2)' }}>
              Got it.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-body)' }}>
              We'll reply from info@meridiangtn.com within a day.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-5) 0' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-title-3)', margin: '0 0 var(--space-2)' }}>
              Couldn't send that.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-body)', margin: '0 0 var(--space-4)' }}>
              Email us directly and we'll pick it up from there.
            </p>
            <a
              href="mailto:info@meridiangtn.com"
              style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                color: 'var(--text-on-gold)',
                background: 'var(--gold-500)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 24px',
                textDecoration: 'none',
              }}
            >
              info@meridiangtn.com
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
