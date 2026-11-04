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
      const result = await response.json();
      if (
        !response.ok ||
        result.requestReceived !== true ||
        result.bookingConfirmed !== false
      )
        throw new Error();
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
        <span className="lab-kicker">60 MINUTES · $175 · WITH BHAVÉ</span>
        <h2>Arrange your session.</h2>
        <p>
          Booking begins with a request. Share what you’d like to explore and
          your preferred availability. We’ll reply to arrange the next steps.
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
      <label>
        Your included ebook language
        <select name="ebookEdition" defaultValue="en" required>
          <option value="en">English — The Possibility</option>
          <option value="es">Español — La posibilidad</option>
        </select>
      </label>
      <p className="form-note">
        Every confirmed Possibility Session includes one copy of The Possibility
        ebook in your selected language at no additional cost. Delivery follows
        verified payment and a confirmed reservation.
      </p>
      <label className="booking-trap" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="consent">
        <input name="consent" type="checkbox" value="yes" required />I agree to
        be contacted by email about this session request.
      </label>
      <p className="form-note">
        60 minutes · $175. No payment is collected by this form. Sending a
        request does not confirm a time or unlock the Room of Clarity. Please
        keep sensitive personal details out of this form.
      </p>
      <button
        className="lab-button"
        disabled={status === "sending" || status === "sent"}
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Request received"
            : "Book Your Session"}
        <span aria-hidden="true">↗</span>
      </button>
      <p role="status" aria-live="polite">
        {status === "sent"
          ? "Your request has been received. Your session is not yet confirmed. We’ll be in touch by email about availability and payment."
          : status === "error"
            ? message
            : ""}
      </p>
    </form>
  );
}

export function Booking() {
  useEffect(() => {
    document.title = "Book The Possibility Session — BHAVÉ’S LAB";
  }, []);
  return (
    <div className="observatory booking-world">
      <a className="lab-skip" href="#main">
        Skip to content
      </a>
      <header className="booking-stage-header">
        <a className="lab-brand" href="/">
          BHAVÉ’S LAB
        </a>
        <a href="/#session">← Back to the observatory</a>
      </header>
      <main id="main" className="booking-stage">
        <div className="booking-context">
          <nav aria-label="Session stages">
            <a href="/#session">01 / Introduction</a>
            <span aria-current="step">02 / Booking</span>
            <span>03 / Confirmed session</span>
          </nav>
          <p className="lab-kicker">YOUR PRIVATE BOOKING PROCESS</p>
          <h1>
            Your Possibility
            <br />
            <em>Session.</em>
          </h1>
          <p className="session-price">60 minutes · $175</p>
          <p>Includes The Possibility ebook in English or Spanish.</p>
          <p>No account or password required.</p>
          <p>
            A private experience with Bhavé. Share only what you want to
            explore; detailed personal information can wait for your session.
          </p>
          <p>
            A request starts the conversation. Your booking requires verified
            availability and payment before confirmation. The confirmed session
            space remains unavailable until then.
          </p>
          <a
            className="lab-text-link"
            href="mailto:info@bhaveslab.com?subject=The%20Possibility%20Session"
          >
            Or begin by email ↗
          </a>
        </div>
        <BookingForm />
      </main>
    </div>
  );
}
