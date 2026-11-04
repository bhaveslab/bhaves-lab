import { useEffect, useRef, useState } from "react";
import "../styles/observatory.css";
import "../styles/ebooks.css";
const editions = {
  en: {
    title: "The Possibility",
    subtitle: "Life Is Already in Motion",
    language: "English",
    cover: "/books/possibility-en.webp",
  },
  es: {
    title: "La posibilidad",
    subtitle: "La vida ya está en movimiento",
    language: "Español",
    cover: "/books/possibility-es.webp",
  },
};
export function EbookShop() {
  const [edition, setEdition] = useState<"en" | "es">("en");
  const [available, setAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<string | null>(null);
  const book = editions[edition];
  useEffect(() => {
    document.title = "The Possibility — Shop — BHAVÉ’S LAB";
    fetch("/api/ebooks/catalog")
      .then((r) => r.json())
      .then((data) => setAvailable(data.checkoutAvailable === true))
      .catch(() => setAvailable(false));
  }, []);
  async function buy() {
    setBusy(true);
    setError("");
    try {
      request.current ??= crypto.randomUUID();
      const response = await fetch("/api/ebooks/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edition, requestId: request.current }),
      });
      const data = await response.json();
      if (
        !response.ok ||
        typeof data.url !== "string" ||
        new URL(data.url).origin !== "https://checkout.stripe.com"
      )
        throw Error();
      window.location.assign(data.url);
    } catch {
      setError("Checkout is temporarily unavailable. Please try again later.");
      setBusy(false);
    }
  }
  return (
    <div className="observatory ebook-world">
      <a className="lab-skip" href="#main">
        Skip to content
      </a>
      <header className="booking-stage-header">
        <a className="lab-brand" href="/">
          BHAVÉ’S LAB
        </a>
        <a href="/">← The Observatory</a>
      </header>
      <main id="main" className="ebook-shop">
        <div className="ebook-cover">
          <img
            src={book.cover}
            alt={`${book.title} — ${book.language} edition cover`}
            width="520"
            height="672"
          />
        </div>
        <div className="ebook-details">
          <p className="lab-kicker">THE SHOP / ORIGINAL PUBLICATIONS</p>
          <fieldset className="edition-picker">
            <legend>Choose your language edition</legend>
            {(["en", "es"] as const).map((lang) => (
              <label key={lang}>
                <input
                  type="radio"
                  name="edition"
                  value={lang}
                  checked={edition === lang}
                  onChange={() => {
                    setEdition(lang);
                    request.current = null;
                    setError("");
                  }}
                />
                {editions[lang].language}
              </label>
            ))}
          </fieldset>
          <h1 lang={edition}>{book.title}</h1>
          <p className="ebook-subtitle" lang={edition}>
            {book.subtitle}
          </p>
          <p className="ebook-author">By Bhavé</p>
          <p>
            A short exploration of observation, imagination, and what becomes
            possible.
          </p>
          <p className="ebook-price">
            $9.99 <span>USD · PDF · 12 pages</span>
          </p>
          <p className="ebook-separate">
            Each language edition is a separate purchase.
          </p>
          <button
            className="lab-button"
            onClick={buy}
            disabled={!available || busy}
          >
            {busy
              ? "Opening secure checkout…"
              : `Buy ${book.language} edition · $9.99`}
            <span aria-hidden="true">↗</span>
          </button>
          {!available && (
            <p className="ebook-note">
              Purchasing is being prepared. Please check back.
            </p>
          )}
          <p className="ebook-note">
            After verified payment, your private download link is sent to the
            email you provide at checkout. The link is valid for seven days.
            This ebook purchase does not book a Possibility Session.
          </p>
          <p role="status">{error}</p>
          <a
            className="lab-text-link"
            href="mailto:info@bhaveslab.com?subject=The%20Possibility%20ebook"
          >
            Questions about the ebook ↗
          </a>
        </div>
      </main>
    </div>
  );
}
export function EbookDelivery() {
  const [token, setToken] = useState(
    () =>
      new URLSearchParams(window.location.hash.slice(1)).get("access") || "",
  );
  const [state, setState] = useState<
    "checking" | "ready" | "processing" | "error"
  >(token ? "ready" : "checking");
  const [edition, setEdition] = useState<"en" | "es" | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    document.title = "Your ebook — BHAVÉ’S LAB";
    if (window.location.hash)
      window.history.replaceState({}, "", window.location.pathname);
    if (token) return;
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId) {
      setState("error");
      setMessage("Open the private link in your receipt email.");
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    async function check() {
      try {
        const r = await fetch("/api/ebooks/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await r.json();
        if (!active) return;
        if (!r.ok) throw Error();
        if (data.state === "ready" && typeof data.token === "string") {
          setToken(data.token);
          setEdition(data.edition);
          setState("ready");
        } else {
          setState("processing");
          if (++tries < 8) timer = setTimeout(check, 2500);
        }
      } catch {
        if (active) {
          setState("error");
          setMessage(
            "Your purchase could not be verified here. Please use your receipt email, or contact info@bhaveslab.com.",
          );
        }
      }
    }
    check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);
  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/pdf")
      ) {
        const d = await response.json();
        throw Error(d.error || "Download unavailable.");
      }
      const file = await response.blob();
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        edition === "es"
          ? "La_Posibilidad_ES_FINAL_REVIEW.pdf"
          : "The_Possibility.pdf";
      const header = response.headers.get("content-disposition");
      const name = header?.match(/filename="([^"]+)"/);
      if (name) link.download = name[1];
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Download unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="observatory ebook-world">
      <header className="booking-stage-header">
        <a className="lab-brand" href="/">
          BHAVÉ’S LAB
        </a>
        <a href="/shop">The Shop</a>
      </header>
      <main className="ebook-delivery">
        <p className="lab-kicker">YOUR PRIVATE DIGITAL EDITION</p>
        <h1>
          Your next
          <br />
          <em>possibility.</em>
        </h1>
        <p>
          {state === "checking"
            ? "Checking your purchase…"
            : state === "processing"
              ? "Payment confirmation and email delivery are still processing. Your receipt email will contain your private link."
              : state === "ready"
                ? "Your private link will be checked before the PDF is delivered."
                : ""}
        </p>
        {state === "ready" && (
          <button className="lab-button" onClick={save} disabled={busy}>
            {busy ? "Verifying download…" : "Download your PDF"}
            <span aria-hidden="true">↓</span>
          </button>
        )}
        <p role="status">{message}</p>
        <p className="ebook-note">
          Need help? <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        </p>
        <a className="lab-text-link" href="/">
          Return to The Observatory ↗
        </a>
      </main>
    </div>
  );
}
