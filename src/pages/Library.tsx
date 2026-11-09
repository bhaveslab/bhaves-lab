import { useEffect, useRef, useState } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";

export function Library() {
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<string | null>(null);

  useEffect(() => {
    document.title = "The Possibility Game — BHAVÉ’S LAB";
    fetch("/api/ebooks/catalog")
      .then((response) => response.json())
      .then((data) => setAvailable(data.checkoutAvailable === true &&
        Array.isArray(data.editions) &&
        data.editions.length === 1 &&
        data.editions[0].edition === "game" &&
        data.editions[0].cents === 1000))
      .catch(() => setAvailable(false));
  }, []);

  async function buy() {
    if (!available || busy) return;
    setBusy(true);
    setError("");
    try {
      request.current ??= crypto.randomUUID();
      const response = await fetch("/api/ebooks/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edition: "game", requestId: request.current }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw Error(typeof data.error === "string" && data.error.length < 180
          ? data.error : "Secure checkout is not ready.");
      }
      if (typeof data.url !== "string" ||
          new URL(data.url).origin !== "https://checkout.stripe.com") {
        throw Error("Secure checkout is not ready.");
      }
      window.location.assign(data.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Secure checkout is currently unavailable.");
      setBusy(false);
    }
  }

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
          One shot. One original character. Your life is the playing field.
          Try 30 days to see what becomes. Life is already in motion.
        </p>
        <section className="library-shelf" aria-labelledby="library-book-heading">
          <div className="library-grid">
            <article className="library-book">
              <img
                className="library-book-art library-book-cover"
                src="/observatory/the-possibility-game-cover.webp"
                alt="The Possibility Game — One Shot. One Character. Cinematic black-glass Observatory cover with a figure and cyan holographic interfaces."
                width="1024"
                height="1536"
                decoding="async"
              />
              <div className="library-book-copy">
                <p className="library-volume">EBOOK / PDF · 14 PAGES</p>
                <h2 id="library-book-heading">The Possibility Game</h2>
                <p className="library-subtitle">One Shot. One Character. Your Life Is the Playing Field.</p>
                <p>
                  Begin wherever you are. Observe yourself, create one original
                  character, and bring that expression into ordinary life.
                </p>
                <p>
                  Try 30 days to see what becomes. Use the simple embodiment and
                  reset protocols, notice what actually changes, and spend more
                  time living than reading. This is one challenge, not 30 lessons.
                </p>
                <p className="library-price">$10.00 <span>USD · one-time purchase · digital PDF</span></p>
                <button className="lab-button" type="button" onClick={() => void buy()}
                  disabled={!available || busy}>
                  {busy ? "Opening secure checkout…" : "Purchase PDF · $10.00"}
                </button>
                {!available && (
                  <p className="library-availability">
                    Secure checkout and delivery of this edition are being verified.
                    Purchasing opens when the new PDF is ready.
                  </p>
                )}
                <p className="library-availability" role="status">{error}</p>
                <p className="library-availability">
                  A private download link will be sent to the buyer's email after
                  verified payment. The link is valid for seven days.
                </p>
              </div>
            </article>
          </div>
        </section>
        <p className="library-closing">
          One character. Thirty days to see what becomes. <em>Life is already in motion.</em>
        </p>
        <p className="library-closing">
          Interested in a one-on-one conversation? <Link to="/sessions">Explore Possibility Sessions ↗</Link>
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
