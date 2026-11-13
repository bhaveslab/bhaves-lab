import { useEffect, useState } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";
import "../styles/completion.css";

type ConfirmationState = "preview" | "checking" | "processing" | "confirmed" | "unverified" | "unavailable";

export function ResearchConfirmation() {
  const [state, setState] = useState<ConfirmationState>("checking");

  useEffect(() => {
    document.title = "Research Contribution — BHAVÉ’S LAB";
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      // A direct visit is a page preview, not evidence of a failed payment.
      setState("preview");
      return;
    }
    if (!/^cs_live_[A-Za-z0-9]+$/.test(sessionId)) {
      setState("unverified");
      return;
    }

    let active = true;
    let retry: ReturnType<typeof setTimeout>;
    let attempts = 0;

    async function verify() {
      try {
        const response = await fetch(
          "/api/research/confirm?session_id=" + encodeURIComponent(sessionId!),
          { cache: "no-store" },
        );
        const data = await response.json();
        if (!active) return;

        if (response.ok && data.state === "confirmed") {
          setState("confirmed");
          return;
        }
        if (response.ok && data.state === "processing") {
          setState("processing");
          if (++attempts < 5) retry = setTimeout(() => void verify(), 3000);
          return;
        }
        setState(response.status === 503 ? "unavailable" : "unverified");
      } catch {
        if (active) setState("unavailable");
      }
    }
    void verify();

    return () => {
      active = false;
      clearTimeout(retry);
    };
  }, []);

  const confirmed = state === "confirmed";

  return (
    <div className="observatory library-world">
      <a className="lab-skip" href="#main">Skip to confirmation</a>
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/">← The Observatory</Link>
      </header>
      <main id="main" className="library-main completion-main">
        <div className="completion-panel" aria-live="polite">
          <p className="lab-kicker">BHAVÉ’S LAB / CONSCIOUSNESS RESEARCH</p>
          <div className="completion-orbit" aria-hidden="true">◌</div>
          {confirmed ? (
            <>
              <h1>Thank you for <em>contributing.</em></h1>
              <p className="completion-lede">
                Your contribution to ongoing research has been confirmed.
              </p>
              <p className="completion-detail">
                Bhavé’s Lab explores consciousness, awareness, perception, and
                lived experience. Your contribution supports this independent
                inquiry. No publication, report, or particular outcome is promised.
              </p>
              <p className="completion-small">
                Stripe provides your payment record. This was a one-time, voluntary
                contribution, not a tax-deductible charitable donation.
              </p>
            </>
          ) : state === "preview" ? (
            <>
              <h1>Thank you for <em>being here.</em></h1>
              <p className="completion-lede">
                Bhavé’s Lab continues its independent exploration of consciousness,
                awareness, perception, and lived experience.
              </p>
              <p className="completion-detail">
                New research contributions are currently paused.
              </p>
              <p className="completion-small">
                For a previous contribution, refer to your Stripe receipt.
              </p>
            </>
          ) : (
            <>
              <h1>{state === "checking" || state === "processing"
                ? <>Confirming your <em>contribution.</em></>
                : <>Contribution <em>confirmation.</em></>}</h1>
              <p className="completion-lede">
                {state === "checking" ? "Checking the Stripe payment status…" :
                  state === "processing" ? "Your payment confirmation is still processing. Please check your Stripe receipt." :
                  state === "unavailable" ? "We cannot check the payment status right now. Your Stripe receipt is the record of any completed payment." :
                  "This visit could not be matched to a completed contribution."}
              </p>
              {(state === "unverified" || state === "unavailable") && (
                <p className="completion-detail">
                  If you completed a payment, check your Stripe receipt or contact
                  <a href="mailto:info@bhaveslab.com"> info@bhaveslab.com</a>.
                </p>
              )}
            </>
          )}
          <div className="completion-actions">
            <Link className="completion-primary" to="/">Return to the Observatory <span aria-hidden="true">↗</span></Link>
            <Link className="completion-secondary" to="/sessions">Explore Possibility Sessions</Link>
          </div>
          <p className="completion-signature">Life is already in motion.</p>
        </div>
      </main>
    </div>
  );
}
