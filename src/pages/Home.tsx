import { useEffect, useState } from "react";
import "../styles/observatory.css";
import { ObservationField } from "../components/ObservationField";

export function Home({ shopPage = false }: { shopPage?: boolean }) {
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    document.title = "BHAVÉ’S LAB — The Observatory";
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
          <a href="#observatory" onClick={() => setMenu(false)}>
            The Observatory
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
            <a className="observatory-entry-link" href="#observatory">
              Explore the Observatory <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="hero-bottom">
            <a href="#observatory">
              LOOK A LITTLE CLOSER <span aria-hidden="true">↓</span>
            </a>
            <button onClick={() => setMotion(!motion)} aria-pressed={!motion}>
              {motion ? "Pause atmosphere" : "Resume atmosphere"}
            </button>
          </div>
        </section>
        <ObservationField />
        <section
          id="session"
          className="lab-session lab-section session-public-introduction"
        >
          <div className="session-heading">
            <p className="lab-kicker">AN INVITATION</p>
            <h2>
              A possibility
              <br />
              <em>worth exploring?</em>
            </h2>
            <p>Sometimes a conversation opens another perspective.</p>
            <p className="session-offer">
              The Possibility Session <span>60 minutes · $175</span>
            </p>
            <p>Every Possibility Session includes The Possibility ebook.</p>
            <a className="lab-text-link" href="/booking">
              Explore The Possibility Session <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <section id="shop" className="observatory-shop lab-section">
          <p className="lab-kicker">THE SHOP / TANGIBLE CREATIONS</p>
          <div className="ebook-home-offer">
            <h2>The Possibility.</h2>
            <p>Life Is Already in Motion.</p>
            <p>By Bhavé · English and Español · $9.99 per edition</p>
            <a className="lab-text-link" href="/shop">
              Explore the editions <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
        <div className="observatory-signature">
          <span aria-hidden="true">∞</span>
          <p>
            Bhavé <small>The Gentleman of Possibility</small>
          </p>
        </div>
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
