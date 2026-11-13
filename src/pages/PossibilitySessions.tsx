import { useEffect } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/possibility-sessions.css";

const emailUrl = "mailto:info@bhaveslab.com?subject=Possibility%20Session%20Inquiry";

export function PossibilitySessions() {
  useEffect(() => {
    document.title = "Possibility Sessions — BHAVÉ’S LAB";
  }, []);

  return (
    <div className="observatory sessions-world">
      <a className="lab-skip" href="#main">Skip to content</a>
      <header className="sessions-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/">← The Observatory</Link>
      </header>
      <main id="main" className="sessions-main">
        <p className="lab-kicker">ONE-ON-ONE / WITH BHAVÉ</p>
        <h1>Possibility <em>Sessions.</em></h1>
        <p className="sessions-intro">
          A private conversation to explore what you are already observing,
          the choices you are making, and the possibilities in your life.
        </p>
        <div className="sessions-offer">
          <div>
            <p className="lab-kicker">THE EXPERIENCE</p>
            <h2>Explore what’s <em>possible.</em></h2>
            <p>
              This is space for observation, questions and the practical
              ways of recognizing and expressing who you already are in everyday life.
              No prescribed identity, outcome or destination.
            </p>
            <a className="sessions-contact" href={emailUrl}>
              Inquire About a Session <span aria-hidden="true">↗</span>
            </a>
            <p className="sessions-note">
              Email Bhavé to inquire about a private session. Please avoid
              sharing sensitive details in your first message.
            </p>
          </div>
          <aside className="sessions-side" aria-label="The session invitation">
            <span className="sessions-orbit" aria-hidden="true">◌</span>
            <p>Observe yourself.<br />Choose consciously.<br /><em>Live the experience.</em></p>
            <small>Life is already in motion.</small>
          </aside>
        </div>
        <div className="sessions-bottom">
          <Link to="/">Return to the Observatory ↑</Link>
        </div>
      </main>
      <footer className="lab-footer">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        <span>© {new Date().getFullYear()} Bhavé’s Lab</span>
      </footer>
    </div>
  );
}
