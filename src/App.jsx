import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Simulator from "./pages/Simulator.jsx";
import Theory from "./pages/Theory.jsx";
import About from "./pages/About.jsx";

const PAGES = [
  { path: "/", label: "Home", view: Home },
  { path: "/simulator", label: "Simulator", view: Simulator },
  { path: "/theory", label: "Theory", view: Theory },
  { path: "/about", label: "About", view: About },
];

const current = () => {
  const p = window.location.hash.replace(/^#/, "") || "/";
  return PAGES.find((x) => x.path === p) ? p : "/";
};

export default function App() {
  const [path, setPath] = useState(current());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => {
      setPath(current());
      setOpen(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  const View = PAGES.find((p) => p.path === path).view;

  return (
    <>
      <nav className="nav">
        <a className="brand" href="#/">
          <span className="logo">M</span>
          <span>Mealy<b>Moore</b> Studio</span>
        </a>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? "Close" : "Menu"}
        </button>
        <ul className={open ? "links open" : "links"}>
          {PAGES.map((p) => (
            <li key={p.path}>
              <a href={`#${p.path}`} className={p.path === path ? "active" : ""}>
                {p.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <main className={path === "/simulator" ? "wide" : ""}>
        <View />
      </main>
      <footer className="foot">Mealy Moore Studio. A finite state machine learning tool.</footer>
    </>
  );
}
