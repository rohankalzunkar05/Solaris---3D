import React, { useState } from "react";
import {
  Search,
  X,
  ExternalLink,
  Orbit,
  Telescope,
  BookOpen,
  Ruler,
} from "lucide-react";
import { bodies, bodyById, metrics, planetIds } from "../data/bodies";
import { Portrait, formatMetric } from "./Shared";

export function Atlas({ select, initialFilter = "All", autoFocus = false }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(initialFilter);
  const filtered = bodies.filter(
    (b) =>
      (filter === "All" || b.kind === filter) &&
      (b.name + " " + b.type)
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="eyebrow">
        <i /> Reference library
      </div>
      <h2>Object atlas</h2>
      <label className="search-box">
        <Search size={18} />
        <input
          autoFocus={autoFocus}
          placeholder="Search celestial bodies"
          aria-label="Search celestial bodies"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button aria-label="Clear search" onClick={() => setQuery("")}>
            <X size={15} />
          </button>
        )}
      </label>
      <div className="tabs">
        {["All", "Planet", "Dwarf planet", "Star"].map((k) => (
          <button
            key={k}
            className={k === filter ? "active" : ""}
            onClick={() => setFilter(k)}
          >
            {k === "All"
              ? "All"
              : k === "Star"
                ? "Sun"
                : k === "Planet"
                  ? "Planets"
                  : "Dwarf planets"}
          </button>
        ))}
      </div>
      <div className="atlas-list">
        {filtered.map((b) => (
          <button className="atlas-row" key={b.id} onClick={() => select(b.id)}>
            <Portrait id={b.id} />
            <span>
              <strong>{b.name}</strong>
              <small>{b.type}</small>
            </span>
            <Orbit size={16} />
          </button>
        ))}
      </div>
      {!filtered.length && (
        <p className="empty">
          No matching bodies. Try another name or category.
        </p>
      )}
    </>
  );
}
const illustratedMoons = new Set([
  "moon",
  "phobos",
  "deimos",
  "io",
  "europa",
  "ganymede",
  "callisto",
  "titan",
  "enceladus",
  "titania",
  "oberon",
  "triton",
  "charon",
]);
const sections = [
  ["Overview", BookOpen],
  ["Properties", Ruler],
  ["Moons", Orbit],
  ["Exploration", Telescope],
];
export function Detail({ id, tab, setTab }) {
  const b = bodyById[id];
  const sources = (
    <section className="sources">
      <h4>Sources</h4>
      {b.sources.map((s) => (
        <a key={s.url} href={s.url} target="_blank" rel="noreferrer">
          {s.label}
          <ExternalLink size={12} />
        </a>
      ))}
    </section>
  );
  return (
    <>
      <div className="eyebrow">
        <i />
        {b.type}
      </div>
      <h2>{b.name}</h2>
      <div className="tabs detail-tabs">
        {sections
          .filter(([name]) => name !== "Moons" || b.kind !== "Star")
          .map(([name, Icon]) => (
            <button
              key={name}
              aria-pressed={tab === name}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              <Icon size={14} />
              {name}
            </button>
          ))}
      </div>
      {tab === "Overview" && (
        <>
          <p className="lead">{b.overview}</p>
          {id === "saturn" && (
            <img
              className="detail-photo"
              src="/images/saturn-portrait.webp"
              alt="Cassini natural-color mosaic of Saturn"
            />
          )}
          <h4>At a glance</h4>
          <dl className="quick-stats">
            {["diameter", "temperature"].map((k) => (
              <div key={k}>
                <dt>{metrics.find((m) => m.key === k).label}</dt>
                <dd>
                  {formatMetric(b.properties[k])}{" "}
                  <small>
                    {b.properties[k] != null &&
                      metrics.find((m) => m.key === k).unit}
                  </small>
                </dd>
              </div>
            ))}
          </dl>
          <h4>Field notes</h4>
          <ul>
            {b.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {b.layers && (
            <>
              <h4>Layers</h4>
              <p>{b.layers}</p>
              <h4>Solar activity</h4>
              <p>{b.activity}</p>
            </>
          )}
          {sources}
        </>
      )}
      {tab === "Properties" && (
        <>
          <dl className="measures">
            {metrics
              .filter(
                (m) =>
                  b.kind !== "Star" || !["distance", "orbit"].includes(m.key),
              )
              .map((m) => (
                <div key={m.key}>
                  <dt>{m.label}</dt>
                  <dd>
                    {formatMetric(b.properties[m.key])}{" "}
                    {b.properties[m.key] != null && m.unit}
                  </dd>
                </div>
              ))}
          </dl>
          <p className="note">{b.notes}</p>
          <h4>Atmosphere</h4>
          <p>{b.atmosphere}</p>
          <h4>Surface & composition</h4>
          <p>{b.surface}</p>
          {sources}
        </>
      )}
      {tab === "Moons" && (
        <>
          <h4>Known moons</h4>
          <p>{b.moonCount ?? "Count unavailable"}</p>
          {b.moons.length > 0 && <h4>Major moons</h4>}
          {b.moons.map((m) => (
            <article className="moon-row" key={m.name}>
              {illustratedMoons.has(m.name.toLowerCase()) && (
                <Portrait id={m.name.toLowerCase()} />
              )}
              <strong>{m.name}</strong>
              <p>{m.description}</p>
            </article>
          ))}
          {sources}
        </>
      )}
      {tab === "Exploration" && (
        <>
          <h4>Missions & discoveries</h4>
          {b.missions.map((f) => (
            <p key={f}>{f}</p>
          ))}
          {sources}
        </>
      )}
    </>
  );
}
export function Compare() {
  const [left, setLeft] = useState("earth"),
    [right, setRight] = useState("mars");
  const pair = [bodyById[left], bodyById[right]];
  return (
    <>
      <div className="eyebrow">
        <i /> Comparative planetology
      </div>
      <h2>Compare worlds</h2>
      <div className="compare-head">
        {pair.map((b, i) => (
          <div key={i}>
            <Portrait id={b.id} />
            <select
              aria-label={i ? "Second planet" : "First planet"}
              value={b.id}
              onChange={(e) => (i ? setRight : setLeft)(e.target.value)}
            >
              {planetIds.map((id) => (
                <option
                  disabled={id === (i ? left : right)}
                  key={id}
                  value={id}
                >
                  {bodyById[id].name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <table className="comparison">
        <thead>
          <tr>
            <th>Property</th>
            {pair.map((b) => (
              <th key={b.id}>{b.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.key}>
              <th>
                {m.label}
                <small>{m.unit}</small>
              </th>
              {pair.map((b) => (
                <td key={b.id}>{formatMetric(b.properties[m.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pair.map((b) => (
        <p className="note" key={b.id}>
          <strong>{b.name}.</strong> {b.notes}
        </p>
      ))}
      <div className="sources">
        {pair.map((b) => (
          <a
            key={b.id}
            href={b.sources[0].url}
            target="_blank"
            rel="noreferrer"
          >
            {b.sources[0].label}
            <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </>
  );
}
