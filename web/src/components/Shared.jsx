import React from "react";
import { CircleDot } from "lucide-react";
import { bodyById } from "../data/bodies";

export const primaryIds = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
];
export function Mark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="brand-mark">
      <g fill="none" stroke="currentColor" strokeWidth="1.75">
        <circle cx="22" cy="22" r="12" />
        <ellipse
          cx="22"
          cy="22"
          rx="21"
          ry="6.4"
          transform="rotate(-38 22 22)"
        />
        <path d="M13 25a10 10 0 0 1 8-12" opacity=".6" />
      </g>
    </svg>
  );
}
export function Portrait({ id, className = "" }) {
  return (
    <img
      className={"portrait " + (id === "saturn" ? "ringed " : "") + className}
      src={"/images/" + (id === "saturn" ? "saturn-wide" : id) + ".webp"}
      alt=""
      draggable="false"
    />
  );
}
export function IndexRail({ selected, onSelect }) {
  return (
    <section className="index-rail" aria-label="Celestial index">
      <div className="index-heading">
        <span>
          <CircleDot size={14} /> Celestial index
        </span>
        <small>SUN + 8 PLANETS</small>
      </div>
      <div className="index-grid">
        {primaryIds.map((id) => (
          <button
            key={id}
            className={"index-card " + (selected === id ? "selected" : "")}
            onClick={() => onSelect(id)}
            aria-label={"Explore " + bodyById[id].name}
          >
            <Portrait id={id} />
            <span>{bodyById[id].name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
export function formatMetric(value) {
  if (value == null) return "—";
  if (Math.abs(value) >= 1e12) {
    const [n, p] = value.toExponential(2).split("e");
    return (
      <>
        {Number(n)} × 10<sup>{Number(p)}</sup>
      </>
    );
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}
