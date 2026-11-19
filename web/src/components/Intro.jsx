import React from "react";
import { Orbit, Route, ScanLine } from "lucide-react";
export default function Intro({ enter, tour, select }) {
  return (
    <main className="intro">
      <svg
        className="map-lines"
        viewBox="0 0 1400 630"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g fill="none" transform="rotate(-23 960 295)">
          <ellipse cx="960" cy="295" rx="490" ry="212" />
          <ellipse cx="960" cy="295" rx="560" ry="244" strokeDasharray="3 7" />
          <ellipse cx="960" cy="295" rx="665" ry="288" />
          <ellipse cx="960" cy="295" rx="790" ry="340" />
        </g>
      </svg>
      <div className="intro-copy">
        <div className="eyebrow">
          <i /> Interactive planetarium
        </div>
        <h1>
          The Solar
          <br />
          <em>System.</em>
        </h1>
        <p>
          Explore our cosmic neighborhood. Orbit planets, discover their moons,
          and get closer to the worlds that move around our Sun.
        </p>
        <div className="intro-actions">
          <button className="primary" onClick={enter}>
            <Orbit size={18} />
            Enter Solar System
          </button>
          <button className="secondary" onClick={tour}>
            <Route size={17} />
            Guided tour
          </button>
        </div>
      </div>
      <div className="saturn-stage">
        <img
          className="hero-saturn"
          src="/images/saturn-wide.webp"
          alt="Cassini view of Saturn with its rings tilted across the planet"
        />
        <button
          className="saturn-callout"
          onClick={() => select("saturn")}
          aria-label="Inspect Saturn"
        >
          <i />
          <span className="target-name">Saturn</span>
          <small>GAS GIANT</small>
        </button>
      </div>
      <div className="photo-caption">
        <ScanLine size={13} /> CASSINI IMAGING <span>/</span> SATURN
      </div>
    </main>
  );
}
