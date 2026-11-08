import { useEffect } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";

export function Library() {
  useEffect(() => {
    document.title = "The Possibility Game — BHAVÉ’S LAB";
  }, []);

  return (
    <div className="observatory library-world">
      <a className="lab-skip" href="#library-main">Skip to the ebook</a>
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/">← The Observatory</Link>
      </header>
      <main id="library-main" className="library-main library-single">
        <p className="lab-kicker">THE DIGITAL LIBRARY / ONE ORIGINAL EXPERIENCE</p>
        <h1>The <em>Possibility Game.</em></h1>
        <p className="library-lede">
          Thirty days to a possible reality — and beyond.
          Select your possibility, explore your world, and create your own missions.
          Life is already in motion.
        </p>
        <section className="library-shelf" aria-labelledby="library-book-heading">
          <div className="library-grid">
            <article className="library-book">
              <div className="library-book-art" role="img" aria-label="The Possibility Game ebook cover, dark teal with a luminous orbit">
                <span>BHAVÉ’S LAB / DIGITAL EDITION</span>
                <span className="library-art-mark" aria-hidden="true">◌</span>
                <strong>THE<br />POSSIBILITY<br />GAME</strong>
                <small>BHAVÉ · THE GENTLEMAN OF POSSIBILITY</small>
              </div>
              <div className="library-book-copy">
                <p className="library-volume">EBOOK / PDF · 49 PAGES</p>
                <h2 id="library-book-heading">The Possibility Game</h2>
                <p className="library-subtitle">30 Days to a Possible Reality — and Beyond</p>
                <p>
                  Thirty guided missions through the Source Vision Framework:
                  State, Perception, Formation, Decision, Experience, Reality.
                </p>
                <p>
                  Explore surprising possibilities, make small real-life moves,
                  record your observations, and keep playing long after Day 30.
                  Create as many of your own missions as you wish.
                </p>
                <p className="library-price">$9.99 <span>USD · one-time purchase · digital ebook only</span></p>
                <p className="library-availability">
                  Secure checkout and private ebook delivery are being verified.
                  Purchasing will open once they are ready.
                </p>
              </div>
            </article>
          </div>
        </section>
        <p className="library-closing">
          Thirty days are the invitation. <em>Possibility has no ending.</em>
        </p>
        <Link to="/" className="library-back">Return to the Observatory ↑</Link>
      </main>
      <footer className="lab-footer">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        <span>© {new Date().getFullYear()} Bhavé’s Lab</span>
      </footer>
    </div>
  );
}
