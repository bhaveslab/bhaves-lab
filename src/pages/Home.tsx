import { useEffect, useState } from "react";
import "../styles/observatory.css";

export function Home({ shopPage = false }: { shopPage?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    document.title = "BHAVÉ’S LAB — Life is already in motion.";
    if (shopPage) document.getElementById("shop")?.scrollIntoView();
  }, [shopPage]);
  useEffect(() => {
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(false);
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className={`observatory ${motion ? "" : "motion-paused"}`}>
      <a className="lab-skip" href="#main">
        Skip to content
      </a>
      <header className="lab-header">
        <a className="lab-brand" href="/" title="Home">
          <span className="orbit-mark" aria-hidden="true">
            ◌
          </span>
          <span>
            BHAVÉ’S LAB<small>THE GENTLEMAN OF POSSIBILITY</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "Close menu" : "Menu"}
          aria-expanded={menu}
          aria-controls="lab-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close −" : "Menu +"}
        </button>
        <nav
          id="lab-navigation"
          className={menu ? "is-open" : ""}
          aria-label="Main navigation"
        >
          <a href="#about" onClick={() => setMenu(false)}>
            The Lab
          </a>
          <a href="#session" onClick={() => setMenu(false)}>
            The Possibility Session
          </a>
          <a href="#shop" onClick={() => setMenu(false)}>
            Shop
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="lab-hero" aria-labelledby="hero-heading">
          <picture className="observatory-image">
            <source
              media="(max-width: 600px)"
              srcSet="/observatory/observatory-mobile.webp"
            />
            <img
              src="/observatory/observatory.webp"
              alt="Bhavé inside a reflective teal observatory, contemplating panoramic mountains and flowing abstract light."
              fetchPriority="high"
              width="853"
              height="621"
            />
          </picture>
          <div className="lab-mist" aria-hidden="true" />
          <div className="lab-horizon" aria-hidden="true" />
          <div
            className="observation-screen ego-screen"
            role="img"
            aria-label="Lil Ego, the original creative character, observed on a transparent display"
          >
            <span className="screen-coordinate" aria-hidden="true">
              EXPRESSION / 01
            </span>
            <div className="screen-grid" aria-hidden="true" />
            <img
              src="/observatory/lil-ego-cutout-336.webp"
              srcSet="/observatory/lil-ego-cutout-336.webp 336w, /observatory/lil-ego-cutout-672.webp 672w, /observatory/lil-ego-cutout.webp 1122w"
              sizes="(max-width: 800px) 116px, 205px"
              alt=""
              width="1122"
              height="1402"
            />
            <span className="screen-caption" aria-hidden="true">
              Lil Ego <i>·</i> Original universe
            </span>
            <svg
              className="screen-wave"
              viewBox="0 0 200 24"
              aria-hidden="true"
            >
              <path d="M0 12 Q10 0 20 12 T40 12 T60 12 T80 12 T100 12 T120 12 T140 12 T160 12 T180 12 T200 12" />
            </svg>
          </div>
          <div
            className="observation-screen bracelet-screen"
            role="img"
            aria-label="An unbranded graphite bracelet with a cyan accent, an artistic wearable concept, not for sale"
          >
            <span className="screen-coordinate" aria-hidden="true">
              FORM / 02
            </span>
            <div className="screen-orbit" aria-hidden="true" />
            <img
              src="/observatory/bracelet-concept-480.webp"
              srcSet="/observatory/bracelet-concept-480.webp 480w, /observatory/bracelet-concept-768.webp 768w"
              sizes="(max-width: 800px) 130px, 250px"
              alt=""
              width="1536"
              height="1024"
            />
            <span className="screen-caption" aria-hidden="true">
              A possibility in form
            </span>
          </div>
          <div className="hero-copy">
            <p className="lab-kicker">OBSERVATION · POSSIBILITY · CREATION</p>
            <h1 id="hero-heading">
              Life is already
              <br />
              in <em>motion.</em>
            </h1>
            <p className="hero-support">
              We observe what is, explore what’s possible,
              <br className="desktop-break" /> and create from what becomes
              clear.
            </p>
            <a className="lab-button" href="/booking">
              Book Your Session<span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-bottom">
            <a href="#about">
              STEP INSIDE <span aria-hidden="true">↓</span>
            </a>
            <button onClick={() => setMotion(!motion)} aria-pressed={!motion}>
              {motion ? "Pause atmosphere" : "Resume atmosphere"}
            </button>
          </div>
        </section>
        <section id="about" className="lab-about lab-section">
          <p className="lab-kicker">01 / THE LAB</p>
          <div>
            <h2>
              A little space.
              <br />
              <em>A different perspective.</em>
            </h2>
            <p>
              Bhavé’s Lab is an ongoing exploration of life, possibility, and
              the things we create along the way.
            </p>
            <p>
              Some possibilities become stories. Others become objects,
              experiences, or a new way of seeing what’s already here. We begin
              with observation and leave room for what becomes clear.
            </p>
            <p className="signature">
              Bhavé <span>— The Gentleman of Possibility</span>
            </p>
          </div>
        </section>
        <section
          id="session"
          className="lab-session lab-section session-public-introduction"
        >
          <div className="session-heading">
            <p className="lab-kicker">02 / PRIVATE EXPLORATION</p>
            <h2>
              The Possibility
              <br />
              <em>Session.</em>
            </h2>
            <p className="session-invitation">Enter the Room of Clarity.</p>
            <p>
              Bring what’s happening. Together, we observe what is, explore
              what’s possible, and discover what becomes clear.
            </p>
            <p className="session-price">
              60 minutes <span aria-hidden="true">·</span> $175
            </p>
            <p>
              A private experience with Bhavé. Bring a situation, a question, an
              idea, a creative possibility, or a direction you want to examine.
            </p>
            <p>
              We begin with observation and conversation: what is occurring,
              what assumptions may be present, and what becomes possible.
            </p>
            <p>
              The session is complete in itself. There is no requirement to
              purchase anything else.
            </p>
            <a className="lab-text-link" href="/booking">
              Book Your Session <span aria-hidden="true">↘</span>
            </a>
          </div>
        </section>
        <section id="shop" className="lab-shop lab-section">
          <p className="lab-kicker">03 / THE SHOP</p>
          <div className="shop-entrance">
            <div className="book-sculpture" aria-hidden="true">
              <span>BHAVÉ’S LAB</span>
              <i>
                Possibility,
                <br />
                in your hands.
              </i>
              <span>OBSERVE · EXPLORE · CREATE</span>
            </div>
            <div>
              <h2>
                Ideas to
                <br />
                <em>take with you.</em>
              </h2>
              <p>
                A place for books, publications, and thoughtfully chosen
                objects.
              </p>
              <p className="shop-status">
                The collection is being prepared. No items are currently
                available to purchase.
              </p>
              <a
                className="lab-text-link"
                href="mailto:info@bhaveslab.com?subject=Shop%20enquiry"
              >
                Ask about the collection <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
        <section className="lab-closing">
          <span aria-hidden="true">∞</span>
          <p>
            There is room for
            <br />
            <em>what becomes possible.</em>
          </p>
          <a href="#session">Let’s explore it together ↗</a>
        </section>
      </main>
      <footer className="lab-footer">
        <a className="lab-brand" href="/">
          BHAVÉ’S LAB
        </a>
        <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        <span>© {new Date().getFullYear()} Bhavé’s Lab</span>
      </footer>
    </div>
  );
}
