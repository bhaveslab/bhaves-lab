import { useEffect } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/experience-paths.css";

export function LilEgo() {
  useEffect(() => {
    document.title = "Meet Lil Ego — BHAVÉ’S LAB";
  }, []);

  return (
    <div className="observatory lil-ego-world">
      <a className="lab-skip" href="#lil-ego-main">Skip to Lil Ego</a>
      <header className="lil-ego-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <nav aria-label="Lil Ego page navigation">
          <Link to="/">The Observatory</Link>
          <Link to="/library">The Possibility Game</Link>
        </nav>
      </header>
      <main id="lil-ego-main">
        <section className="lil-ego-intro" aria-labelledby="lil-ego-heading">
          <div className="lil-ego-portrait">
            <div className="lil-ego-halo" aria-hidden="true" />
            <img
              src="/observatory/lil-ego-cutout-672.webp"
              width="672"
              height="840"
              alt="Lil Ego, the original animated character in his orange turban, black sunglasses, and gold accents"
            />
            <span className="lil-ego-signal" aria-hidden="true">ORIGINAL UNIVERSE / 01</span>
          </div>
          <div className="lil-ego-copy">
            <p className="lab-kicker">A CHARACTER FROM BHAVÉ’S WORLD</p>
            <h1 id="lil-ego-heading">Meet <em>Lil Ego.</em></h1>
            <p className="lil-ego-lede">A little character with a big point of view.</p>
            <p>
              Ego is the sense of “I” through which we tell stories about who we are.
              It can appear in our thoughts, reactions, roles, and the meanings we
              attach to an experience.
            </p>
            <p>
              We don’t have to fight it or pretend it isn’t there.
              We can get curious about it. Notice what it says.
              Notice when we’re listening.
            </p>
            <p>
              Lil Ego brings that conversation to life with character, humor,
              curiosity, and a little audacity.
            </p>
            <p className="lil-ego-question">What is your ego saying today?</p>
            <p className="lil-ego-coming">His world is still unfolding. For now, this is the introduction.</p>
          </div>
        </section>
        <section className="lil-ego-closing" aria-label="Lil Ego reflection">
          <p>Observe first. <em>Name later.</em></p>
          <Link to="/">Return to the Observatory ↑</Link>
        </section>
      </main>
      <footer className="lab-footer">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        <span>© {new Date().getFullYear()} Bhavé’s Lab</span>
      </footer>
    </div>
  );
}
