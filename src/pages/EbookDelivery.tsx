import { useEffect, useState } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";
import "../styles/ebook-delivery.css";

type Status = "email" | "ready" | "downloading" | "error";

export function EbookDelivery() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("email");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Your Book — Unlimited Possibilities | Bhavé’s Lab";
    const params = new URLSearchParams(window.location.hash.slice(1));
    const secret = params.get("access");
    if (secret && /^[A-Za-z0-9_.-]{30,1200}$/.test(secret)) {
      setToken(secret);
      setStatus("ready");
    }
    // Remove the entitlement from the visible address bar and browser history.
    if (window.location.hash) {
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  async function downloadBook() {
    if (!token || status === "downloading") return;
    setStatus("downloading");
    setError("");
    try {
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(typeof body.error === "string"
          ? body.error
          : "The download is currently unavailable.");
      }
      const pdf = await response.blob();
      if (pdf.type !== "application/pdf" || pdf.size < 1000) {
        throw new Error("The delivered file could not be verified.");
      }
      const url = URL.createObjectURL(pdf);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "Unlimited_Possibilities_The_Pattern_of_Choice.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      setStatus("ready");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Download unavailable.");
      setStatus("error");
    }
  }

  return (
    <div className="observatory ebook-delivery-world">
      <a className="lab-skip" href="#delivery-main">Skip to book access</a>
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/library">The Library</Link>
      </header>
      <main id="delivery-main" className="ebook-delivery-main">
        <p className="lab-kicker">DIGITAL EDITION / PRIVATE ACCESS</p>
        <h1>Unlimited <em>Possibilities.</em></h1>
        <p className="library-lede">The Pattern of Choice</p>
        {status === "email" ? (
          <section className="ebook-delivery-panel" aria-label="Your receipt">
            <h2>Check your email.</h2>
            <p>Thank you for your purchase. Your private book link is sent to the email address used at checkout once payment is confirmed.</p>
            <p>The download link is valid for seven days from purchase. If you do not see the receipt, check your spam folder, then contact <a href="mailto:info@bhaveslab.com?subject=Book%20Receipt%20Assistance">info@bhaveslab.com</a>.</p>
          </section>
        ) : (
          <section className="ebook-delivery-panel" aria-label="Download your book">
            <h2>Your edition is ready.</h2>
            <p>Your private link can be used for seven days from purchase.</p>
            <button type="button" className="ebook-download-action" onClick={downloadBook} disabled={status === "downloading"}>
              {status === "downloading" ? "Preparing your PDF…" : "Download the PDF"}
            </button>
            {error && <p role="alert" className="ebook-delivery-error">{error} If needed, contact <a href="mailto:info@bhaveslab.com?subject=Book%20Download%20Help">info@bhaveslab.com</a>.</p>}
          </section>
        )}
        <Link to="/library" className="library-back">Return to the Library ↑</Link>
      </main>
    </div>
  );
}
