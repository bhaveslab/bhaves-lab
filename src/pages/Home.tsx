import { useEffect, useState } from "react";
import "../styles/observatory.css";
import { ObservationField } from "../components/ObservationField";\nimport { Link } from "../router";

export function Home() {
  const [menu, setMenu] = useState(false);
  const [motion, setMotion] = useState(true);
  useEffect(() => {
    document.title = "BHAVÉ’S LAB — The Observatory";
  }, []);
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
            BHAVÉ’S LAB<small>Bhavé — The Gentleman of Possibility</small>
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
          <a href="#possibility" onClick={() => setMenu(false)}>
            Possibility
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
              {...{ fetchpriority: "high" }}
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
            aria-label="An unbranded graphite bracelet with a cyan accent, an imagined form"
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
              The possibilities are endless.
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
          id="possibility"
          className="observation-reflection"
          aria-labelledby="possibility-heading"
        >
          <div className="reflection-copy">
            <p className="lab-kicker">POSSIBILITY</p>
            <h2 id="possibility-heading">Every experience<br />begins <em>somewhere.</em></h2>
            <p>
              What we observe influences what we perceive. What we perceive
              influences what we imagine, decide, and experience.
            </p>
            <p>We are not here to tell you what your reality should look like.</p>
            <p>
              We invite you to explore what is already happening and consider
              what else might be possible.
            </p>
          </div>
          <div className="source-vision" aria-labelledby="framework-heading">
            <h3 id="framework-heading">The Source Vision Framework</h3>
            <ol className="framework-flow" aria-label="Source Vision sequence">
              {["State", "Perception", "Formation", "Decision", "Experience", "Reality"].map((step, index) => (
                <li key={step}>
                  {step}
                  {index < 5 && <span aria-hidden="true">→</span>}
                </li>
              ))}
            </ol>
            <p>
              A simple way to explore how our internal state, perception,
              imagination, and decisions participate in the experiences of life.
            </p>
          </div>
          <div className="reflection-copy reflection-open">
            <p>
              There is no prescribed destination.<br />
              No correct way to experience life.
            </p>
            <p>Just the opportunity to observe, explore, and discover.</p>
          </div>
          <p className="observation-closing">
            <span>Life is already in motion.</span>
            <span>The possibilities are endless.</span>
            <em>What will you discover?</em>
          </p>
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
