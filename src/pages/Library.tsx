import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";

import { useEffect, useState } from "react";

export function Library() {
  const [checkoutAvailable, setCheckoutAvailable] = useState(false);

  useEffect(() => {
    document.title = "Unlimited Possibilities | Bhavé’s Lab";
    const controller = new AbortController();
    fetch("/api/ebooks/catalog", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((catalog) => {
        setCheckoutAvailable(catalog?.checkoutAvailable === true);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  return (
    <div className="observatory library-world">
      <a className="lab-skip" href="#library-main">Skip to the book</a>
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/sessions">Possibility Sessions</Link>
      </header>
      <main id="library-main" className="library-main library-single">
        <h1>Unlimited <em>Possibilities</em></h1>
        <p className="library-lede">The Pattern of Choice</p>
        <section className="library-shelf" aria-label="About the book">
          <div className="library-grid">
            <article className="library-book">
              <img
                className="library-book-art library-book-cover"
                src="/observatory/unlimited-possibilities-final-cover.webp"
                alt="Unlimited Possibilities book cover with glass doors reflecting different scenes."
                width="480"
                height="720"
              />
              <div className="library-book-copy">
                <p className="library-volume">DIGITAL PDF · 17 PAGES</p>
                <h2>Let’s look closer.</h2>
                <p>When you look back at the choices you’ve made, what keeps repeating?</p>
                <p>A self-directed guide to studying yourself, recognizing your natural rhythm,
                  and bringing what you know about yourself into everyday decisions.
                  Includes a worked example and a reflection worksheet.</p>
                <p className="library-price">$10.00 <span>USD · one-time purchase</span></p>
                {checkoutAvailable ? (
                  <>
                    <a className="lab-button" href="/api/ebooks/checkout">Buy the PDF</a>
                    <p className="library-availability">Download here after checkout. We’ll also email you a private link.</p>
                  </>
                ) : (
                  <p className="library-availability">Online ordering is being prepared.</p>
                )}
              </div>
            </article>
          </div>
        </section>
        <p className="library-closing"><em>Life is already in motion.</em></p>
        <Link to="/" className="library-back">Return to the Observatory ↑</Link>
      </main>
    </div>
  );
}
