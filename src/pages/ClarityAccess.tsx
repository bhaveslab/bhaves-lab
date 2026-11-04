import { lazy, Suspense, useEffect, useState } from "react";
import "../styles/observatory.css";
const Room = lazy(() =>
  import("./RoomOfClarity").then((module) => ({
    default: module.RoomOfClarity,
  })),
);
export function ClarityAccess() {
  const [access, setAccess] = useState<"checking" | "locked" | "verified">(
    "checking",
  );
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
        if (
          result.access !== "confirmed" ||
          result.paymentVerified !== true ||
          result.availabilityVerified !== true
        )
          throw new Error("Access not verified");
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
        <Suspense fallback={<p role="status">Opening the room…</p>}>
          <Room />
        </Suspense>
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
          <a className="lab-button" href="/#session">
            Return to The Possibility Session <span aria-hidden="true">↗</span>
          </a>
        </main>
      )}
    </div>
  );
}
