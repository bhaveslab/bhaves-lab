import { useEffect, useState } from "react";
import "../styles/observatory.css";
export function ClarityAccess() {
  const [access, setAccess] = useState<"checking" | "locked" | "verified">(
    "checking",
  );
  const [roomMarkup, setRoomMarkup] = useState<string | null>(null);
  useEffect(() => {
    document.title = "The Room of Clarity — BHAVÉ’S LAB";
    const controller = new AbortController();
    fetch("/api/clarity-access", {
      credentials: "same-origin",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Access not verified");
        const result = await response.json();
        if (typeof result.html !== "string" || !result.html.trim())
          throw new Error("Access not verified");
        setRoomMarkup(result.html);
        setAccess("verified");
      })
      .catch(() => {
        if (!controller.signal.aborted) setAccess("locked");
      });
    return () => controller.abort();
  }, []);
  return (
    <div className="observatory">
      <a className="lab-skip" href="#main">
        Skip to content
      </a>
      {access === "verified" ? (
        // HTML comes only from the authenticated, booking-authorized same-origin API.
        <div dangerouslySetInnerHTML={{ __html: roomMarkup ?? "" }} />
      ) : (
        <main id="main" className="clarity-locked">
          <span aria-hidden="true" className="locked-orbit">
            ◌
          </span>
          <p className="lab-kicker">THE POSSIBILITY SESSION</p>
          <h1>The Room of Clarity</h1>
          <p role="status">
            {access === "checking"
              ? "Checking your session access…"
              : "The room opens after your session’s availability and payment have both been confirmed. A booking request alone does not unlock this space."}
          </p>
          {access === "locked" && (
            <p>
              If you already have a confirmed session, contact{" "}
              <a href="mailto:info@bhaveslab.com">info@bhaveslab.com</a> for
              assistance.
            </p>
          )}
          <a className="lab-button" href="/booking">
            Return to booking <span aria-hidden="true">↗</span>
          </a>
        </main>
      )}
    </div>
  );
}
