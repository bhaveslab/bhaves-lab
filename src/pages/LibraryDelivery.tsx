import { useEffect, useState } from "react";
import { Link } from "../router";
import "../styles/observatory.css";
import "../styles/library.css";

type DeliveryState = "checking" | "processing" | "ready" | "error";

export function LibraryDelivery() {
  const [token, setToken] = useState(() =>
    new URLSearchParams(window.location.hash.slice(1)).get("access") || "",
  );
  const [state, setState] = useState<DeliveryState>(token ? "ready" : "checking");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = "Your Possibility Game Ebook — BHAVÉ’S LAB";
    if (window.location.hash) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (token) return;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setState("error");
      setMessage("Open the private link in your purchase receipt.");
      return;
    }
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    let tries = 0;
    async function check() {
      try {
        const response = await fetch("/api/ebooks/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json();
        if (!active) return;
        if (!response.ok) throw Error();
        if (data.state === "ready" && typeof data.token === "string") {
          setToken(data.token);
          setState("ready");
          return;
        }
        setState("processing");
        if (++tries < 8) timer = setTimeout(check, 2500);
        else setMessage("Your confirmation email contains your private download link.");
      } catch {
        if (active) {
          setState("error");
          setMessage("Please use your receipt email or contact info@bhaveslab.com.");
        }
      }
    }
    void check();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  async function download() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/ebooks/download", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/pdf")) {
        throw Error("Your private download is not available. Please consult your receipt.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "The_Possibility_Game_Observatory_Edition.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Download unavailable.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="observatory library-world">
      <header className="library-header">
        <Link to="/" className="lab-brand">BHAVÉ’S LAB</Link>
        <Link to="/library">← The Digital Library</Link>
      </header>
      <main className="library-main" id="main">
        <p className="lab-kicker">YOUR PRIVATE DIGITAL EDITION</p>
        <h1>The <em>Possibility Game.</em></h1>
        <p className="library-lede">
          {state === "checking" ? "Checking your purchase…" :
          state === "processing" ? "Payment and delivery confirmation are processing." :
          state === "ready" ? "Your purchase was verified. Your PDF is ready to request." :
          "We could not verify your purchase here."}
        </p>
        {state === "ready" && (
          <button className="lab-button" type="button" disabled={busy}
            onClick={() => void download()}>
            {busy ? "Verifying download…" : "Download your PDF"}
          </button>
        )}
        <p className="library-availability" role="status">{message}</p>
        <p className="library-availability">
          Need assistance? <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a>
        </p>
      </main>
    </div>
  );
}
