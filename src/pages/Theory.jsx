import { useMemo } from "react";
import { buildMealy } from "../core/machine.js";
import { mealyToMoore } from "../core/converter.js";
import { mealyToMooreSteps } from "../core/steps.js";
import { EXAMPLES } from "../core/examples.js";
import MachineTable from "../components/MachineTable.jsx";

export default function Theory() {
  const demo = useMemo(() => {
    const mealy = buildMealy(EXAMPLES[0].form);
    const moore = mealyToMoore(mealy, "0");
    return { mealy, moore, steps: mealyToMooreSteps(mealy, moore, "0") };
  }, []);

  return (
    <article className="doc">
      <header className="pagehead"><h1>Theory</h1><p>The ideas behind the simulator, in plain words.</p></header>

      <section className="card">
        <h2>Finite state machines with output</h2>
        <p>A finite state machine reads an input string one symbol at a time and moves between a fixed set of states. A DFA only answers yes or no at the end. Mealy and Moore machines print an output symbol as they go, so they are used for things like detectors, counters and controllers.</p>
        <p>Both are written as a tuple of states Q, input alphabet Sigma, output alphabet Delta, transition function, output function and a start state q0.</p>
      </section>

      <section className="card">
        <h2>Mealy versus Moore</h2>
        <div className="tablewrap">
          <table className="tt ro cmp">
            <thead><tr><th></th><th>Mealy</th><th>Moore</th></tr></thead>
            <tbody>
              <tr><th>Output depends on</th><td>current state and current input</td><td>current state only</td></tr>
              <tr><th>Output function</th><td>lambda: Q x Sigma to Delta</td><td>lambda: Q to Delta</td></tr>
              <tr><th>Output sits on</th><td>transitions (labelled input/output)</td><td>states</td></tr>
              <tr><th>Output length for n inputs</th><td>n symbols</td><td>n + 1 symbols (one before any input)</td></tr>
              <tr><th>Number of states</th><td>usually fewer</td><td>may need more</td></tr>
              <tr><th>Reacts to input</th><td>in the same step</td><td>one step later</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>Mealy to Moore</h2>
        <ol>
          <li>Every Moore state is a pair (q, o): "we are in Mealy state q and we just printed o".</li>
          <li>The start state is (q0, o0), where o0 is an initial output you choose, because a Moore machine must print something before the first input.</li>
          <li>From (q, o) on input a, look up the Mealy move q to q' printing o'. The Moore move goes to (q', o').</li>
          <li>Only pairs that can be reached from the start are kept.</li>
        </ol>
        <p>A Mealy state entered with different outputs gets split into several Moore states. In the worst case you get |Q| x |Delta| states.</p>
      </section>

      <section className="card">
        <h2>Moore to Mealy</h2>
        <p>Keep the same states. Each transition from q on input a goes to q' and prints the output of q'. Nothing is split, so the state count stays the same.</p>
      </section>

      <section className="card">
        <h2>Worked example</h2>
        <p>The overlapping 101 detector, converted with initial output 0.</p>
        <h3>Mealy machine</h3>
        <MachineTable kind="mealy" machine={demo.mealy} />
        <h3>Moore machine</h3>
        <MachineTable kind="moore" machine={demo.moore} />
        <h3>Steps</h3>
        <ol className="steps">{demo.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
      </section>

      <section className="card">
        <h2>Equivalence</h2>
        <p>Because of the extra initial output, the two machines are compared from the first input onward and the Moore start output is ignored.</p>
        <p>The simulator explores pairs (Mealy state, Moore state) starting from the two start states, taking every input. If any pair prints different outputs, the input path that led there is a counterexample. If no pair differs, the machines agree on all inputs, not only on short test strings. There are at most |Q mealy| x |Q moore| pairs, so the check always ends.</p>
      </section>
    </article>
  );
}
