export default function About() {
  return (
    <article className="doc">
      <header className="pagehead"><h1>About</h1><p>A small tool for learning about machines with output.</p></header>

      <section className="card">
        <h2>The project</h2>
        <p>Mealy Moore Studio is a Theory of Computation project. It lets you enter a Mealy or Moore machine, convert it to the other kind, watch both run, and prove that they are equivalent.</p>
        <p>Built by Bhawani Singh Chadha.</p>
      </section>

      <section className="card">
        <h2>Features</h2>
        <ul>
          <li>Mealy and Moore input with validation</li>
          <li>Mealy to Moore and Moore to Mealy conversion with written steps</li>
          <li>Run, step, back, play and a position slider</li>
          <li>Equivalence check for all inputs, with a counterexample if it fails</li>
          <li>Zoomable diagram with draggable states</li>
          <li>JSON import and export</li>
          <li>Five built-in examples</li>
        </ul>
      </section>

      <section className="card">
        <h2>JSON format</h2>
        <pre>{`{
  "type": "mealy",
  "states": ["A", "B"],
  "inputs": ["0", "1"],
  "outputs": ["0", "1"],
  "start": "A",
  "initialOutput": "0",
  "transitions": [
    { "from": "A", "input": "0", "to": "A", "output": "0" }
  ]
}`}</pre>
        <p>For a Moore machine use "type": "moore", give each state as {`{ "name": "A", "output": "0" }`}, and leave out "output" and "initialOutput" on transitions. Use the Download JSON button to see a full file.</p>
      </section>

      <section className="card">
        <h2>Built with</h2>
        <p>React and Vite. The machine logic lives in plain JavaScript files under src/core and has its own tests (npm test).</p>
      </section>
    </article>
  );
}
