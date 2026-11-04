import { useEffect, useState } from "react";
import "../styles/observatory.css";

const bookingEmail =
  "mailto:info@bhaveslab.com?subject=The%20Possibility%20Session";
function OrbitMark() {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="1.3" />
      <ellipse
        cx="24"
        cy="24"
        rx="10"
        ry="22"
        transform="rotate(40 24 24)"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="36" cy="11" r="3" fill="currentColor" />
      <circle cx="24" cy="24" r="3" fill="currentColor" />
    </svg>
  );
}
export function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  useEffect(() => {
    document.title = "BHAVÉ’S LAB — Life is already in motion.";
    if (window.location.pathname.startsWith("/shop"))
      document.getElementById("shop")?.scrollIntoView();
  }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        document.getElementById("lab-menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  return (
    <div className={`observatory-site${motionPaused ? " motion-paused" : ""}`}>
      <a className="lab-skip" href="#main">
        Skip to content
      </a>
      <header className="lab-header">
        <a
          className="lab-wordmark"
          href="/#entrance"
          aria-label="Bhavé’s Lab home"
        >
          <OrbitMark />
          <span>
            BHAVÉ’S LAB<small>THE GENTLEMAN OF POSSIBILITY</small>
          </span>
        </a>
        <button
          className="lab-menu-toggle"
          id="lab-menu-toggle"
          aria-controls="lab-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}{" "}
          <span aria-hidden="true">{menuOpen ? "−" : "+"}</span>
        </button>
        <nav
          id="lab-navigation"
          className={menuOpen ? "is-open" : ""}
          aria-label="Main navigation"
        >
          <a href="#perspective" onClick={() => setMenuOpen(false)}>
            The Lab
          </a>
          <a href="#session" onClick={() => setMenuOpen(false)}>
            The Possibility Session
          </a>
          <a href="#shop" onClick={() => setMenuOpen(false)}>
            Shop
          </a>
        </nav>
      </header>
      <main id="main">
        <section
          className="lab-hero"
          id="entrance"
          aria-labelledby="hero-title"
        >
          <div
            className="observatory-scene"
            role="img"
            aria-label="Bhavé stands inside a dark glass observatory, looking toward a panoramic mountain landscape and floating expressions of possibility."
          >
            <img
              className="observatory-environment"
              src="/observatory/observatory.webp"
              alt=""
              width="852"
              height="610"
            />
            <div className="scene-mist" />
            <div className="scene-light" />
          </div>
          <figure className="ego-screen">
            <img
              src="/observatory/lil-ego-approved.jpeg"
              width="1122"
              height="1402"
              alt="Lil Ego in his orange turban, sunglasses, black and orange outfit, and gold jewelry."
            />
            <figcaption>
              <span>Lil Ego</span>
              <small>AN ORIGINAL CREATIVE UNIVERSE</small>
            </figcaption>
          </figure>
          <div className="hero-copy">
            <p className="lab-eyebrow">
              <span /> OBSERVATION · POSSIBILITY · CREATION
            </p>
            <h1 id="hero-title">
              Life is already
              <br />
              in <em>motion.</em>
            </h1>
            <p className="hero-description">
              We observe what is, explore what’s possible, and create from what
              becomes clear.
            </p>
            <a className="lab-action" href="#session">
              The Possibility Session <span aria-hidden="true">↗</span>
            </a>
            <a className="hero-shop-link" href="#shop">
              Explore the shop <span aria-hidden="true">→</span>
            </a>
          </div>
          <div className="hero-bottom">
            <a href="#perspective">
              STEP INSIDE <span aria-hidden="true">↓</span>
            </a>
            <button
              onClick={() => setMotionPaused(!motionPaused)}
              aria-pressed={motionPaused}
            >
              {motionPaused ? "Resume atmosphere" : "Pause atmosphere"}{" "}
              <span aria-hidden="true">{motionPaused ? "▷" : "Ⅱ"}</span>
            </button>
          </div>
        </section>
        <section
          className="lab-perspective lab-section"
          id="perspective"
          aria-labelledby="perspective-title"
        >
          <div className="section-marker">
            <span>01 / THE LAB</span>
            <span aria-hidden="true">∞</span>
          </div>
          <div className="perspective-layout">
            <h2 id="perspective-title">
              A little space.
              <br />A different <em>possibility.</em>
            </h2>
            <div className="section-prose">
              <p>
                The Lab is a place for curiosity. For looking closely at what’s
                here, allowing a question to open, and following what becomes
                clear.
              </p>
              <p>
                Life, imagination, original stories, and the natural world share
                the same view. There is room to explore without deciding in
                advance what you’ll find.
              </p>
              <p className="lab-signature">
                Bhavé <span>THE GENTLEMAN OF POSSIBILITY</span>
              </p>
            </div>
          </div>
          <div className="possibility-line" aria-hidden="true">
            <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
              <path d="M0 50 C180 50 170 8 300 50 S430 92 580 50 S750 10 900 50 S1060 90 1200 50" />
              <path d="M0 50 C180 50 170 85 300 50 S430 20 580 50 S750 85 900 50 S1060 20 1200 50" />
            </svg>
          </div>
        </section>
        <section
          className="lab-session lab-section"
          id="session"
          aria-labelledby="session-title"
        >
          <div className="section-marker">
            <span>02 / PRIVATE EXPLORATION</span>
            <span>WITH BHAVÉ</span>
          </div>
          <div className="session-layout">
            <div>
              <p className="lab-eyebrow">ONE CONVERSATION. ROOM TO EXPLORE.</p>
              <h2 id="session-title">
                The Possibility
                <br />
                <em>Session.</em>
              </h2>
              <p className="session-intro">
                Bring what’s on your mind.
                <br />
                Let’s see what becomes clear.
              </p>
            </div>
            <div className="section-prose session-detail">
              <p>
                A situation. A question. An idea. A creative possibility. A
                private space to explore what you’re experiencing and clarify
                what you want to do with it.
              </p>
              <p>
                We begin with what you bring. Observation, meditation, hypnosis,
                and other instruments may become part of the session where
                appropriate and with your agreement.
              </p>
              <p>
                No predetermined answer. Space to observe, explore, and choose.
              </p>
              <a className="lab-action" href={bookingEmail}>
                Request a session <span aria-hidden="true">↗</span>
              </a>
              <p className="action-note">
                Email Bhavé to discuss your session and arrange a time.
              </p>
            </div>
          </div>
        </section>
        <section
          className="lab-shop lab-section"
          id="shop"
          aria-labelledby="shop-title"
        >
          <div className="section-marker">
            <span>03 / THE SHOP</span>
            <span>CREATIVE EXPRESSIONS</span>
          </div>
          <div className="shop-layout">
            <div className="shop-orbit" aria-hidden="true">
              <span />
              <span />
              <span />
              <b>∞</b>
            </div>
            <div>
              <p className="lab-eyebrow">THINGS TO TAKE WITH YOU</p>
              <h2 id="shop-title">
                Possibility,
                <br />
                in <em>print & form.</em>
              </h2>
              <p>Books, publications, and thoughtfully chosen objects.</p>
              <p className="shop-status">
                The collection is being prepared. No items are currently offered
                for purchase here.
              </p>
              <a
                className="lab-text-link"
                href="mailto:info@bhaveslab.com?subject=Shop%20inquiry"
              >
                Ask about the collection <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="lab-footer">
        <a className="lab-wordmark" href="#entrance">
          <OrbitMark />
          <span>BHAVÉ’S LAB</span>
        </a>
        <p>Life is already in motion.</p>
        <a href="mailto:info@bhaveslab.com">
          info@bhaveslab.com <span aria-hidden="true">↗</span>
        </a>
        <small>© {new Date().getFullYear()} Bhavé’s Lab</small>
      </footer>
    </div>
  );
}
