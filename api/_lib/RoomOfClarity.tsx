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
  return (
    <main className="clarity-room" id="main">
      <div className="chamber-arch" aria-hidden="true" />
      <header>
        <a className="lab-brand" href="/">
          BHAVÉ’S LAB
        </a>
        <span className="lab-kicker">YOUR PRIVATE EXPLORATION</span>
      </header>
      <section className="room-introduction">
        <p className="lab-kicker">THE POSSIBILITY SESSION</p>
        <h1>
          The Room
          <br />
          of <em>Clarity.</em>
        </h1>
        <p>
          You don’t need to arrive with an answer.
          <br />
          Bring what’s here. We begin together.
        </p>
        <span className="room-line" aria-hidden="true" />
      </section>
      <section className="room-instruments" aria-labelledby="instruments-title">
        <p className="lab-kicker">POSSIBLE INSTRUMENTS / ONE EXPLORATION</p>
        <h2 id="instruments-title">
          A few ways
          <br />
          <em>we may explore.</em>
        </h2>
        <p>
          These are optional instruments within the Lab, not a menu of
          additional services. Bhavé will explain a relevant approach during
          your session. You decide whether it belongs in your exploration.
        </p>
        <dl>
          {instruments.map(([name, description], index) => (
            <div key={name}>
              <dt>
                <span aria-hidden="true">0{index + 1}</span>
                {name}
              </dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        <p className="room-assurance">
          Your Possibility Session is complete in itself. No additional purchase
          is necessary for clarity. If you want a separate exploration beyond
          the agreed session, its scope and price are discussed and agreed upon
          separately.
        </p>
      </section>
      <footer>
        <a href="/">Return to the observatory ↗</a>
      </footer>
    </main>
  );
}
