import React, {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Orbit,
  BookOpen,
  Columns2,
  Search,
  SlidersHorizontal,
  X,
  Route,
  Play,
  Pause,
  RotateCcw,
  Maximize,
  MousePointer2,
  Info,
  ChevronLeft,
  ChevronRight,
  Check,
  ScanLine,
  LoaderCircle,
} from "lucide-react";
import { bodyById } from "./data/bodies";
import { IndexRail, Mark, primaryIds } from "./components/Shared";
import Intro from "./components/Intro";
import { Atlas, Detail, Compare } from "./components/Atlas";
const Planetarium = lazy(() => import("./components/Planetarium"));

function read(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences are optional in restricted browsers. */
  }
}
class SceneBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="scene-message" role="alert">
        The 3D scene could not load. Use the celestial index to explore the
        atlas.{" "}
        <button onClick={() => this.setState({ error: false })}>
          Retry scene
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function Header({
  page,
  home,
  overview,
  atlas,
  compare,
  search,
  settings,
  showSettings,
}) {
  return (
    <header className="topbar">
      <button className="brand" onClick={home} aria-label="SOLARIS home">
        <Mark />
        SOLARIS
      </button>
      <nav aria-label="Main navigation">
        {[
          [Orbit, "Explorer", overview, "explorer"],
          [BookOpen, "Object atlas", atlas, "atlas"],
          [Columns2, "Compare", compare, "compare"],
        ].map(([Icon, title, action, id]) => (
          <button
            className={page === id ? "active" : ""}
            onClick={action}
            key={id}
            aria-label={title}
          >
            <Icon size={16} />
            <span>{title}</span>
          </button>
        ))}
      </nav>
      <div className="head-tools">
        <button
          onClick={search}
          className="search-trigger"
          aria-label="Search bodies"
        >
          <Search size={17} />
          <span>Search</span>
          <kbd>/</kbd>
        </button>
        <i />
        <button
          className={"icon-btn " + (showSettings ? "on" : "")}
          onClick={settings}
          aria-label="Display settings"
          aria-expanded={showSettings}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>
    </header>
  );
}
function Settings({
  quality,
  setQuality,
  paths,
  setPaths,
  labels,
  setLabels,
  close,
}) {
  return (
    <aside className="settings pop">
      <div className="pop-heading">
        <h3>Display settings</h3>
        <button
          className="icon-btn"
          onClick={close}
          aria-label="Close settings"
        >
          <X size={17} />
        </button>
      </div>
      <label className="setting-row">
        Render quality
        <select value={quality} onChange={(e) => setQuality(e.target.value)}>
          <option>Low</option>
          <option>Balanced</option>
          <option>High</option>
        </select>
      </label>
      {[
        [paths, setPaths, "Orbital paths"],
        [labels, setLabels, "Planet labels"],
      ].map(([value, set, key]) => (
        <label className="setting-row" key={key}>
          {key}
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => set(e.target.checked)}
          />
        </label>
      ))}
    </aside>
  );
}
function Credits({ close }) {
  return (
    <aside className="credits pop">
      <div className="pop-heading">
        <h3>Scale & credits</h3>
        <button className="icon-btn" onClick={close} aria-label="Close credits">
          <X size={16} />
        </button>
      </div>
      <p>
        Sizes, distances and motion are compressed independently. The orbits
        illustrate the system and do not predict sky positions. The atlas lists
        real measurements.
      </p>
      <p>
        Planet maps and derived portraits © Solar System Scope / INOVE, resized
        and shaded for SOLARIS.{" "}
        <a
          href="https://www.solarsystemscope.com/textures/"
          target="_blank"
          rel="noreferrer"
        >
          Collection
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY 4.0
        </a>
      </p>
      <p>
        Cassini imagery courtesy of NASA/JPL/Space Science Institute and
        NASA/JPL-Caltech/SSI/Cornell.{" "}
        <a
          href="https://www.jpl.nasa.gov/images/pia06193-the-greatest-saturn-portrait-yet/"
          target="_blank"
          rel="noreferrer"
        >
          Landing portrait
        </a>{" "}
        ·{" "}
        <a
          href="https://www.jpl.nasa.gov/images/pia17474-jewel-of-the-solar-system/"
          target="_blank"
          rel="noreferrer"
        >
          Atlas portrait
        </a>
      </p>
    </aside>
  );
}
export default function App() {
  const [entered, setEntered] = useState(
    () => read("solaris.entered", "0") === "1",
  );
  const [selected, setSelected] = useState(null),
    [panel, setPanel] = useState(null),
    [tab, setTab] = useState("Overview");
  const [searchFocus, setSearchFocus] = useState(false),
    [settings, setSettings] = useState(false),
    [credits, setCredits] = useState(false);
  const [quality, setQuality] = useState(() => {
    const q = read("solaris.quality", "Balanced");
    return ["Low", "Balanced", "High"].includes(q) ? q : "Balanced";
  });
  const [paths, setPaths] = useState(true),
    [labels, setLabels] = useState(true),
    [playing, setPlaying] = useState(
      () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [speed, setSpeed] = useState(1);
  const [epoch, setEpoch] = useState(0),
    [tour, setTour] = useState(null),
    [ready, setReady] = useState(false);
  const drawer = useRef(null);
  const enter = () => {
    setEntered(true);
    write("solaris.entered", "1");
  };
  const home = () => {
    setEntered(false);
    setPanel(null);
    setSelected(null);
    setTour(null);
    setSettings(false);
    setCredits(false);
    setReady(false);
  };
  const [fullView, setFullView] = useState(false);
  const overview = (fitAll = true) => {
    setFullView(fitAll === true);
    enter();
    setPanel(null);
    setSelected(null);
    setTour(null);
    setEpoch((e) => e + 1);
    setSettings(false);
  };
  const select = (id) => {
    enter();
    setSelected(id);
    setPanel("detail");
    setTab("Overview");
    setSettings(false);
    setCredits(false);
    setEpoch((e) => e + 1);
  };
  const selectFree = (id) => {
    setTour(null);
    select(id);
  };
  const showPanel = (name, focus = false) => {
    enter();
    setPanel(name);
    setSelected(null);
    setTour(null);
    setSearchFocus(focus);
    setCredits(false);
    setSettings(false);
  };
  const closePanel = () => {
    setPanel(null);
    setSelected(null);
    setTour(null);
  };
  const tourStep = (index) => {
    setTour(index);
    select(primaryIds[index]);
  };
  const onReady = useCallback((count) => setReady(count === 14), []);
  useEffect(() => {
    drawer.current?.scrollTo({ top: 0 });
    if (panel === "atlas" && searchFocus)
      drawer.current?.querySelector("input")?.focus();
  }, [selected, panel, tab, searchFocus]);
  useEffect(() => {
    function keys(e) {
      if (e.key === "Escape") {
        if (settings) setSettings(false);
        else if (credits) setCredits(false);
        else closePanel();
        return;
      }
      if (
        e.target.isContentEditable ||
        ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.key === "/") {
        e.preventDefault();
        showPanel("atlas", true);
      }
      if (e.code === "Space" && entered && e.target.tagName !== "BUTTON") {
        e.preventDefault();
        setPlaying((v) => !v);
      }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  }, [entered, settings, credits]);
  return (
    <div
      className={
        "app " + (entered ? "entered" : "landing") + (panel ? " has-panel" : "")
      }
    >
      <Header
        page={panel === "atlas" || panel === "compare" ? panel : "explorer"}
        home={home}
        overview={() => overview()}
        atlas={() => showPanel("atlas")}
        compare={() => showPanel("compare")}
        search={() => showPanel("atlas", true)}
        settings={() => {
          setSettings(!settings);
          setCredits(false);
        }}
        showSettings={settings}
      />
      {settings && (
        <Settings
          {...{ quality, paths, labels, setPaths, setLabels }}
          setQuality={(q) => {
            setQuality(q);
            write("solaris.quality", q);
          }}
          close={() => setSettings(false)}
        />
      )}
      {entered ? (
        <main className="observatory" aria-label="Solar system observatory">
          <div className="scene">
            <SceneBoundary>
              <Suspense fallback={null}>
                <Planetarium
                  {...{
                    selected,
                    playing,
                    speed,
                    quality,
                    paths,
                    labels,
                    onReady,
                  }}
                  onSelect={selectFree}
                  resetToken={epoch}
                  fullView={fullView}
                />
              </Suspense>
            </SceneBoundary>
          </div>
          <div className="scene-title">
            <div className="eyebrow">
              <i /> Orbital view
            </div>
            <h1>
              {tour !== null
                ? "Guided tour"
                : selected
                  ? bodyById[selected].name
                  : "Solar System"}
            </h1>
            {!ready && (
              <small className="loading">
                <LoaderCircle size={13} /> Loading observatory
              </small>
            )}
          </div>
          {!panel && (
            <button
              className="tour-trigger secondary"
              onClick={() => tourStep(0)}
            >
              <Route size={15} />
              Guided tour
            </button>
          )}
          <div className="scene-tools">
            <button
              aria-label={playing ? "Pause movement" : "Play movement"}
              title={playing ? "Pause" : "Play"}
              onClick={() => setPlaying(!playing)}
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <label>
              <span className="sr-only">Orbital speed</span>
              <select
                aria-label="Orbital speed"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              >
                {[0.25, 0.5, 1, 2, 5, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
            </label>
            <i />
            <button
              aria-label="Reset camera"
              title="Reset camera"
              onClick={() => setEpoch((e) => e + 1)}
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => overview()}
              title="System overview"
              aria-label="System overview"
            >
              <Maximize size={16} />
            </button>
          </div>
          {panel && (
            <aside
              className="drawer"
              aria-label={
                panel === "detail"
                  ? bodyById[selected].name + " information"
                  : panel === "atlas"
                    ? "Object atlas"
                    : "Compare worlds"
              }
            >
              <button
                className="drawer-close icon-btn"
                aria-label="Close panel"
                onClick={closePanel}
              >
                <X size={17} />
              </button>
              {tour !== null && (
                <div className="tour-controls">
                  <span>
                    <Route size={14} /> TOUR {tour + 1} / 9
                  </span>
                  <button
                    aria-label="Previous tour stop"
                    disabled={tour === 0}
                    onClick={() => tourStep(tour - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <button
                    aria-label={tour === 8 ? "Finish tour" : "Next tour stop"}
                    onClick={() =>
                      tour === 8 ? overview() : tourStep(tour + 1)
                    }
                  >
                    {tour === 8 ? (
                      <Check size={17} />
                    ) : (
                      <ChevronRight size={17} />
                    )}
                  </button>
                </div>
              )}
              <div className="drawer-scroll" ref={drawer}>
                {panel === "detail" ? (
                  <Detail id={selected} {...{ tab, setTab }} />
                ) : panel === "atlas" ? (
                  <Atlas select={selectFree} autoFocus={searchFocus} />
                ) : (
                  <Compare />
                )}
              </div>
            </aside>
          )}
        </main>
      ) : (
        <Intro enter={() => overview(false)} tour={() => tourStep(0)} select={selectFree} />
      )}
      <IndexRail selected={selected} onSelect={selectFree} />
      <footer>
        <button
          onClick={() => {
            setCredits(!credits);
            setSettings(false);
          }}
          aria-expanded={credits}
        >
          <span className="scale-dot" />
          Illustrative scale
          <Info size={12} />
        </button>
        <span className="footer-right">
          {entered ? (
            <>
              <MousePointer2 size={12} /> Drag to orbit <b>·</b> Scroll to zoom
            </>
          ) : (
            <>
              <ScanLine size={13} /> NASA / JPL IMAGERY
            </>
          )}
        </span>
      </footer>
      {credits && <Credits close={() => setCredits(false)} />}
    </div>
  );
}

