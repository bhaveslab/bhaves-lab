import { useEffect, useState, type FormEvent } from "react";
import "../styles/observatory.css";

function BookingForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const response = await fetch("/api/possibility-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error();
      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
      setMessage(
        "Your request could not be sent. Please try again, or email info@bhaveslab.com.",
      );
    }
  }
  return (
    <form
      className="booking-form"
      onSubmit={submit}
      aria-label="Possibility Session request"
    >
      <div className="form-intro">
        <span className="lab-kicker">A PRIVATE CONVERSATION</span>
        <h3>What’s on your mind?</h3>
        <p>
          Share a little about what you’d like to explore and when you’re
          available. We’ll reply by email to arrange your session.
        </p>
      </div>
      <div className="form-pair">
        <label>
          Your name
          <input name="name" autoComplete="name" required maxLength={120} />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <label>
        What would you like to explore?
        <textarea
          name="details"
          rows={3}
          required
          maxLength={2000}
          placeholder="A situation, a question, an idea…"
        />
      </label>
      <label>
        Your availability and time zone
        <input
          name="availability"
          required
          maxLength={300}
          placeholder="For example: weekday afternoons, Central time"
        />
      </label>
      <label className="booking-trap" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="consent">
        <input name="consent" type="checkbox" value="yes" required />I agree to
        be contacted by email about this session request.
      </label>
      <p className="form-note">
        This is a request. Your session is confirmed only after we agree on a
        time. Please keep sensitive personal details out of this form.
      </p>
      <button
        className="lab-button"
        disabled={status === "sending" || status === "sent"}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Request received"
            : "Request a session"}
        <span aria-hidden="true">↗</span>
      </button>
      <p role="status" aria-live="polite">
        {status === "sent"
          ? "Thank you. Your request has been received. We’ll be in touch by email."
          : status === "error"
            ? message
            : ""}
      </p>
    </form>
  );
}

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
        <a className="lab-brand" href="/" aria-label="Bhavé’s Lab home">
          <span className="orbit-mark" aria-hidden="true">
            ◌
          </span>
          <span>
            BHAVÉ’S LAB<small>THE GENTLEMAN OF POSSIBILITY</small>
          </span>
        </a>
        <button
          className="menu-toggle"
          aria-label={menu ? "Close navigation" : "Open navigation"}
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
          <figure className="ego-screen">
            <img
              src="/observatory/lil-ego-reference.jpeg"
              alt="Lil Ego in his original orange turban, black sunglasses, orange and black outfit, and gold jewelry."
              width="1122"
              height="1402"
            />
            <figcaption>
              LIL EGO<span>AN ORIGINAL CREATIVE EXPRESSION</span>
            </figcaption>
          </figure>
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
            <a className="lab-button" href="#session">
              The Possibility Session<span aria-hidden="true">↗</span>
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
        <section id="session" className="lab-session lab-section">
          <div className="session-heading">
            <p className="lab-kicker">02 / PRIVATE EXPLORATION</p>
            <h2>
              The Possibility
              <br />
              <em>Session.</em>
            </h2>
            <p>
              Bring a situation, a question, an idea, or a creative possibility.
              Together, we make space to explore it privately and find clarity
              about what comes next.
            </p>
            <p>
              Observation, meditation, hypnosis, and other techniques may be
              used as appropriate within your session. The exploration follows
              what you bring.
            </p>
            <a className="lab-text-link" href="#booking">
              Begin a conversation <span aria-hidden="true">↘</span>
            </a>
          </div>
          <div id="booking">
            <BookingForm />
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
