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
        data.editions[0].cents === 999))
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
          Thirty days to a possible reality — and beyond.
          Select your possibility, explore your world, and create your own missions.
          Life is already in motion.
        </p>
        <section className="library-shelf" aria-labelledby="library-book-heading">
          <div className="library-grid">
            <article className="library-book">
              <img
                className="library-book-art library-book-cover"
                src="/observatory/the-possibility-game-cover.webp"
                alt="The Possibility Game by Bhavé — 30 Days to a Possible Reality — and Beyond. Cover showing a cyan-lit Observatory overlooking mountains and water."
                width="1024"
                height="1536"
                decoding="async"
              />
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
                <button className="lab-button" type="button" onClick={() => void buy()}
                  disabled={!available || busy}>
                  {busy ? "Opening secure checkout…" : "Purchase PDF · $9.99"}
                </button>
                {!available && (
                  <p className="library-availability">
                    Secure checkout and private ebook delivery are being verified.
                    Purchasing will open once they are ready.
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
