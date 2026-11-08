import { useState } from "react";

const views = ["Worlds", "Patterns", "Stories"] as const;
export function ObservationField() {
  const [view, setView] = useState<(typeof views)[number]>("Worlds");
  return (
    <section
      id="observatory"
      className="possibility-field"
      aria-labelledby="field-title"
    >
      <div className="field-invitation">
        <p className="lab-kicker">THE OBSERVATORY</p>
        <h2 id="field-title">
          What do <em>you see?</em>
        </h2>
        <p>
          A landscape. A pattern. A story.
          <br />A world not yet imagined.
        </p>
      </div>
      <div className={`field-panorama field-view-${view.toLowerCase()}`}>
        <picture
          className="field-environment"
          aria-hidden={view === "Patterns"}
        >
          <source
            media="(max-width: 600px)"
            srcSet="/observatory/imagined-world-mobile.webp"
          />
          <img
            src="/observatory/imagined-world.webp"
            alt="An imagined moonlit bay with mist, forested mountains, and a distant stone arch."
            width="1280"
            height="720"
            loading="lazy"
          />
        </picture>
        <svg
          className="imagined-world"
          viewBox="0 0 1600 880"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-hidden={view !== "Patterns"}
          aria-label={
            view === "Patterns"
              ? "Intersecting luminous rings, geometric paths and flowing waves in a deep teal field"
              : "An imagined moonlit world with layered mountains, a celestial sphere, and flowing light"
          }
        >
          <defs>
            <radialGradient id="field-sky">
              <stop stopColor="#245b67" />
              <stop offset=".6" stopColor="#0b2731" />
              <stop offset="1" stopColor="#030d10" />
            </radialGradient>
            <radialGradient id="field-orb" cx="36%" cy="28%">
              <stop stopColor="#d0f1e8" />
              <stop offset=".32" stopColor="#80bbb9" />
              <stop offset=".65" stopColor="#1b6876" />
              <stop offset="1" stopColor="#061e2a" />
            </radialGradient>
            <linearGradient id="field-wave">
              <stop stopColor="#72d5db" stopOpacity="0" />
              <stop offset=".4" stopColor="#80d1d4" stopOpacity=".7" />
              <stop offset=".7" stopColor="#c9ebe3" stopOpacity=".4" />
              <stop offset="1" stopColor="#72d5db" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="field-floor" x2="0" y2="1">
              <stop stopColor="#4e8b91" stopOpacity=".2" />
              <stop offset="1" stopColor="#031014" stopOpacity="0" />
            </linearGradient>
            <clipPath id="orb-mask">
              <circle cx="1030" cy="290" r="138" />
            </clipPath>
          </defs>
          <rect width="1600" height="880" fill="url(#field-sky)" />
          <g fill="#bce4dc" opacity=".35">
            {Array.from({ length: 36 }, (_, i) => (
              <circle
                key={i}
                cx={(i * 137 + 43) % 1600}
                cy={(i * 79 + 28) % 440}
                r={i % 5 === 0 ? 1.7 : 0.8}
              />
            ))}
          </g>
          <g className="world-orb">
            <circle
              cx="1030"
              cy="290"
              r="154"
              fill="none"
              stroke="#a7ded8"
              strokeOpacity=".12"
            />
            <circle cx="1030" cy="290" r="138" fill="url(#field-orb)" />
            <g
              clipPath="url(#orb-mask)"
              fill="none"
              stroke="#c8eeea"
              strokeOpacity=".2"
            >
              <path
                d="M880 240 Q1000 320 1190 185 M860 310 Q1080 180 1200 340 M875 375 Q1020 265 1190 420"
                strokeWidth="18"
              />
              <ellipse cx="1030" cy="290" rx="82" ry="150" />
              <ellipse cx="1030" cy="290" rx="145" ry="60" />
            </g>
          </g>
          <g className="world-mountains">
            <path
              d="M0 590 120 490 210 535 365 360 465 485 580 420 710 550 885 440 1020 525 1170 380 1350 505 1480 410 1600 510V880H0Z"
              fill="#14363f"
            />
            <path
              d="m265 455 100-95 100 125-69-38-31-40-28 30Z"
              fill="#659397"
              opacity=".25"
            />
            <path
              d="M0 660 175 570 280 615 420 530 575 665 755 560 925 670 1115 510 1285 655 1460 540 1600 630V880H0Z"
              fill="#09232d"
            />
            <path
              d="M0 760 210 660 405 735 620 625 810 755 1030 665 1220 760 1430 655 1600 730V880H0Z"
              fill="#04141c"
            />
            <ellipse
              cx="800"
              cy="780"
              rx="500"
              ry="55"
              fill="url(#field-floor)"
            />
          </g>
          <g
            className="field-geometry"
            fill="none"
            stroke="#9ddcdb"
            strokeWidth=".8"
          >
            <circle cx="800" cy="430" r="245" strokeOpacity=".17" />
            <circle cx="800" cy="430" r="190" strokeOpacity=".24" />
            <ellipse
              cx="800"
              cy="430"
              rx="390"
              ry="90"
              strokeOpacity=".27"
              transform="rotate(-24 800 430)"
            />
            <path d="m800 205 195 338H605Z" strokeOpacity=".22" />
            <path d="M410 430h780M800 110v640" strokeOpacity=".1" />
          </g>
          <g className="field-ribbons" fill="none" stroke="url(#field-wave)">
            {Array.from({ length: 13 }, (_, i) => (
              <path
                key={i}
                d={`M-80 ${470 + i * 9} C320 ${260 + i * 11},480 ${745 - i * 9},800 ${470 + i * 4} S1270 ${280 + i * 8},1690 ${460 + i * 11}`}
                strokeWidth={i === 6 ? 2 : 0.6}
              />
            ))}
          </g>
        </svg>
        <div
          className="field-story-plane"
          role="img"
          aria-label="The original Lil Ego character within a transparent screen in an imagined landscape"
          aria-hidden={view !== "Stories"}
        >
          <span className="screen-coordinate" aria-hidden="true">
            AN ORIGINAL UNIVERSE
          </span>
          <img
            src="/observatory/lil-ego-cutout-336.webp"
            srcSet="/observatory/lil-ego-cutout-336.webp 336w, /observatory/lil-ego-cutout-672.webp 672w"
            sizes="(max-width: 600px) 180px, 270px"
            alt=""
            width="1122"
            height="1402"
            loading="lazy"
          />
          <span className="screen-caption" aria-hidden="true">
            Lil Ego
          </span>
        </div>
        <div className="field-atmosphere" aria-hidden="true" />
        <div
          className="field-view-control"
          role="group"
          aria-label="Explore visual expressions"
        >
          {views.map((name) => (
            <button
              key={name}
              aria-pressed={view === name}
              onClick={() => setView(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      <p className="field-afterthought">
        What becomes clear
        <br />when you observe?
      </p>
    </section>
  );
}
