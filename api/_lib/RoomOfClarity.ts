import * as React from "react";
/** SERVER ONLY. Never import this presentation into the Vite client. */
const instruments = [
  [
    "Inner Mining",
    "A guided inquiry into assumptions, patterns, and what lies beneath the first answer.",
  ],
  [
    "Bio-Well observation",
    "An optional instrument for exploration. Images and readings are prompts for discussion, not a diagnosis or a measurement of consciousness.",
  ],
  [
    "Meditation",
    "A quiet space to settle attention and observe what is present.",
  ],
  [
    "Hypnosis",
    "Focused, guided exploration, introduced only with your understanding and agreement.",
  ],
  [
    "Creative instruments",
    "Writing, imagery, conversation, and other approaches may support what you are exploring.",
  ],
];
export function RoomOfClarity() {
  return React.createElement(
    "main",
    { className: "clarity-room", id: "main" },
    React.createElement("div", {
      className: "chamber-arch",
      "aria-hidden": "true",
    }),
    React.createElement(
      "header",
      null,
      React.createElement(
        "a",
        { className: "lab-brand", href: "/" },
        "BHAV\u00C9\u2019S LAB",
      ),
      React.createElement(
        "span",
        { className: "lab-kicker" },
        "YOUR PRIVATE EXPLORATION",
      ),
    ),
    React.createElement(
      "section",
      { className: "room-introduction" },
      React.createElement(
        "p",
        { className: "lab-kicker" },
        "THE POSSIBILITY SESSION",
      ),
      React.createElement(
        "h1",
        null,
        "The Room",
        React.createElement("br", null),
        "of ",
        React.createElement("em", null, "Clarity."),
      ),
      React.createElement(
        "p",
        null,
        "You don\u2019t need to arrive with an answer.",
        React.createElement("br", null),
        "Bring what\u2019s here. We begin together.",
      ),
      React.createElement("span", {
        className: "room-line",
        "aria-hidden": "true",
      }),
    ),
    React.createElement(
      "section",
      { className: "room-instruments", "aria-labelledby": "instruments-title" },
      React.createElement(
        "p",
        { className: "lab-kicker" },
        "POSSIBLE INSTRUMENTS / ONE EXPLORATION",
      ),
      React.createElement(
        "h2",
        { id: "instruments-title" },
        "A few ways",
        React.createElement("br", null),
        React.createElement("em", null, "we may explore."),
      ),
      React.createElement(
        "p",
        null,
        "These are optional instruments within the Lab, not a menu of additional services. Bhav\u00E9 will explain a relevant approach during your session. You decide whether it belongs in your exploration.",
      ),
      React.createElement(
        "dl",
        null,
        instruments.map(([name, description], index) =>
          React.createElement(
            "div",
            { key: name },
            React.createElement(
              "dt",
              null,
              React.createElement(
                "span",
                { "aria-hidden": "true" },
                "0",
                index + 1,
              ),
              name,
            ),
            React.createElement("dd", null, description),
          ),
        ),
      ),
      React.createElement(
        "p",
        { className: "room-assurance" },
        "Your Possibility Session is complete in itself. No additional purchase is necessary for clarity. If you want a separate exploration beyond the agreed session, its scope and price are discussed and agreed upon separately.",
      ),
    ),
    React.createElement(
      "footer",
      null,
      React.createElement(
        "a",
        { href: "/" },
        "Return to the observatory \u2197",
      ),
    ),
  );
}
