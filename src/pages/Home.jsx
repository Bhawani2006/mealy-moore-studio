import { useMemo } from "react";
import Diagram from "../components/Diagram.jsx";
import { buildMealy } from "../core/machine.js";
import { mealyGraph } from "../core/graph.js";
import { EXAMPLES } from "../core/examples.js";

const FEATURES = [
  ["Build either machine", "Type a Mealy or a Moore machine with simple dropdowns. No code needed."],
  ["Two way conversion", "Mealy to Moore and Moore to Mealy, with every step written out in words."],
  ["Run and step", "Play, pause, step forward and back through an input and watch the active state light up."],
  ["Equivalence check", "A search over state pairs proves both machines match for every input, not just the ones you tried."],
  ["Clear validation", "Missing moves, duplicate symbols and unknown input symbols are reported right away."],
  ["Zoom, drag, import, export", "Move states around, zoom the diagram, and save or load machines as JSON."],
];

export default function Home() {
  const graph = useMemo(() => mealyGraph(buildMealy(EXAMPLES[0].form)), []);
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">Theory of Computation</p>
          <h1>See how Mealy and Moore machines turn into each other.</h1>
          <p className="lead">
            Build a machine, convert it, run it on any input and prove that both versions behave the same.
          </p>
          <div className="row">
            <a className="btn primary big" href="#/simulator">Open the simulator</a>
            <a className="btn big" href="#/theory">Read the theory</a>
          </div>
        </div>
        <div className="hero-art card">
          <Diagram graph={graph} color="#e0592a" label="Example Mealy machine, overlapping 101 detector" />
          <p className="hint">Overlapping 101 detector. Try dragging a state.</p>
        </div>
      </section>

      <section>
        <h2 className="sec">What you can do</h2>
        <div className="feat">
          {FEATURES.map(([t, d]) => (
            <article className="card" key={t}><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="sec">How it works</h2>
        <ol className="how">
          <li><b>Enter</b><span>Pick the type, set states, symbols and transitions, or load an example.</span></li>
          <li><b>Convert</b><span>The other machine and the written steps appear at once.</span></li>
          <li><b>Check</b><span>Run an input and read the equivalence result.</span></li>
        </ol>
      </section>
    </>
  );
}
