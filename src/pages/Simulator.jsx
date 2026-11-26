import { useEffect, useMemo, useState } from "react";
import { buildMealy, validateMealy, tokenizeInput } from "../core/machine.js";
import { buildMoore, validateMoore, mooreToMealy } from "../core/moore.js";
import { mealyToMoore } from "../core/converter.js";
import { runMealy, runMoore } from "../core/simulator.js";
import { compareTraces, verifyEquivalence } from "../core/checker.js";
import { mealyGraph, mooreGraph } from "../core/graph.js";
import { mealyToMooreSteps, mooreToMealySteps } from "../core/steps.js";
import { EXAMPLES } from "../core/examples.js";
import { exportMachine, importMachine } from "../core/io.js";
import Editor from "../components/Editor.jsx";
import Diagram from "../components/Diagram.jsx";
import MachineTable from "../components/MachineTable.jsx";
import Trace from "../components/Trace.jsx";

const MEALY_COLOR = "#e0592a";
const MOORE_COLOR = "#1b8a7a";

const emptyForm = (mode) => ({ ...EXAMPLES.find((e) => e.mode === mode).form });

export default function Simulator() {
  const [mode, setMode] = useState("mealy");
  const [forms, setForms] = useState({ mealy: emptyForm("mealy"), moore: emptyForm("moore") });
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [importError, setImportError] = useState("");
  const [tab, setTab] = useState("steps");
  const form = forms[mode];

  const machine = useMemo(() => (mode === "mealy" ? buildMealy(form) : buildMoore(form)), [mode, form]);
  const errors = useMemo(() => (mode === "mealy" ? validateMealy(machine) : validateMoore(machine)), [mode, machine]);
  const initOut = machine.outputs?.includes(form.initOut) ? form.initOut : machine.outputs[0];

  const update = (field, value) => setForms((f) => ({ ...f, [mode]: { ...f[mode], [field]: value } }));
  const setCell = (q, a, value, field) =>
    setForms((f) => {
      const cur = f[mode];
      if (mode === "moore" && field === "out") return { ...f, moore: { ...cur, outs: { ...cur.outs, [q]: value } } };
      if (mode === "moore") return { ...f, moore: { ...cur, cells: { ...cur.cells, [`${q}|${a}`]: value } } };
      return { ...f, mealy: { ...cur, cells: { ...cur.cells, [`${q}|${a}`]: { ...machine.table[q][a], [field]: value } } } };
    });
  const loadExample = (i) => {
    const ex = EXAMPLES[i];
    setMode(ex.mode);
    setForms((f) => ({ ...f, [ex.mode]: { ...ex.form } }));
  };

  const result = useMemo(() => {
    if (errors.length) return null;
    let mealy, moore, steps;
    if (mode === "mealy") {
      mealy = machine;
      moore = mealyToMoore(mealy, initOut);
      steps = mealyToMooreSteps(mealy, moore, initOut);
    } else {
      moore = machine;
      mealy = mooreToMealy(moore);
      steps = mooreToMealySteps(moore, mealy);
    }
    const tok = tokenizeInput(form.inputString, machine.inputs);
    const mt = tok.error ? null : runMealy(mealy, tok.symbols);
    const ot = tok.error ? null : runMoore(moore, tok.symbols);
    return {
      mealy, moore, steps, tok, mt, ot,
      cmp: mt ? compareTraces(mt, ot) : null,
      eq: verifyEquivalence(mealy, moore),
      mg: mealyGraph(mealy),
      og: mooreGraph(moore),
    };
  }, [mode, machine, errors, initOut, form.inputString]);

  const total = result?.mt?.steps.length ?? 0;
  const k = Math.min(cursor, total);

  useEffect(() => { setCursor(0); setPlaying(false); }, [form.inputString, mode]);
  useEffect(() => {
    if (!playing) return undefined;
    if (k >= total) { setPlaying(false); return undefined; }
    const id = setTimeout(() => setCursor((c) => Math.min(c + 1, total)), 700);
    return () => clearTimeout(id);
  }, [playing, k, total]);

  const active = (trace, startId) => {
    if (!trace || k === 0) return { node: startId, edge: null };
    const s = trace.steps[k - 1];
    return { node: s.to, edge: `${s.from}|${s.to}` };
  };
  const ma = active(result?.mt, result?.mealy.start);
  const oa = active(result?.ot, result?.moore.start);

  const onExport = () => {
    const data = exportMachine(mode, machine, initOut);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${mode}-machine.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const { mode: m, form: f } = importMachine(await file.text());
      setMode(m);
      setForms((cur) => ({ ...cur, [m]: f }));
      setImportError("");
    } catch (err) {
      setImportError(err.message);
    }
  };

  const eqLabel = mode === "mealy" ? "Mealy to Moore" : "Moore to Mealy";

  return (
    <div className="sim">
      <header className="pagehead">
        <h1>Simulator</h1>
        <p>Build a machine, convert it, and run both versions on the same input.</p>
      </header>
      <div className="simgrid">
        <Editor
          mode={mode} setMode={setMode} form={form} machine={machine} errors={errors}
          tokenError={result?.tok.error} update={update} setCell={setCell} loadExample={loadExample}
          onExport={onExport} onImport={onImport} importError={importError}
        />
        <div className="results">
          {!result ? (
            <section className="card"><h2>Waiting for a valid machine</h2><p>Fix the problems listed under the table.</p></section>
          ) : (
            <>
              <section className="card">
                <h2>Run</h2>
                <div className="row">
                  <button className="btn" onClick={() => { setPlaying(false); setCursor(0); }} disabled={k === 0}>Reset</button>
                  <button className="btn" onClick={() => { setPlaying(false); setCursor(Math.max(0, k - 1)); }} disabled={k === 0}>Back</button>
                  <button className="btn primary" disabled={total === 0} onClick={() => {
                    if (playing) setPlaying(false); else { if (k >= total) setCursor(0); setPlaying(true); }
                  }}>{playing ? "Pause" : k >= total && total > 0 ? "Replay" : "Play"}</button>
                  <button className="btn" onClick={() => { setPlaying(false); setCursor(Math.min(total, k + 1)); }} disabled={k >= total}>Step</button>
                  <span className="pos">{k} of {total}</span>
                </div>
                <input className="slider" type="range" min="0" max={total} value={k} disabled={total === 0}
                  onChange={(e) => { setPlaying(false); setCursor(Number(e.target.value)); }} aria-label="Position in the input" />
                {total === 0 && !result.tok.error && <p className="hint">Type a test input on the left to run the machine.</p>}
                <div className={`verdict ${result.eq.equivalent && (!result.cmp || result.cmp.same) ? "ok" : "bad"}`} role="status">
                  <p><b>Equivalence check ({eqLabel}):</b>{" "}
                    {result.eq.equivalent
                      ? `equivalent for every input (${result.eq.pairs} state pairs explored).`
                      : `NOT equivalent. Counterexample input: ${result.eq.counterexample.join(" ")}.`}</p>
                  {result.cmp && (
                    <p><b>This input:</b>{" "}
                      {result.cmp.same ? `both machines print ${result.mt.outputString || "nothing"}.` : `they first differ at step ${result.cmp.firstDiff + 1}.`}</p>
                  )}
                </div>
              </section>

              <section className="card">
                <h2 className="t-mealy">Mealy machine</h2>
                <Diagram graph={result.mg} color={MEALY_COLOR} activeNode={ma.node} activeEdge={ma.edge}
                  label={`Mealy machine diagram with ${result.mealy.states.length} states`} />
                <p className="hint">Edges read input/output.</p>
                <MachineTable kind="mealy" machine={result.mealy} />
              </section>

              <section className="card">
                <h2 className="t-moore">Moore machine</h2>
                <Diagram graph={result.og} color={MOORE_COLOR} moore activeNode={oa.node} activeEdge={oa.edge}
                  label={`Moore machine diagram with ${result.moore.states.length} states`} />
                <p className="hint">The output is written inside each state, under the line. Edges read the input.</p>
                <MachineTable kind="moore" machine={result.moore} />
              </section>

              <section className="card">
                <div className="seg small">
                  <button className={tab === "steps" ? "on" : ""} onClick={() => setTab("steps")}>Conversion steps</button>
                  <button className={tab === "trace" ? "on" : ""} onClick={() => setTab("trace")}>Traces</button>
                </div>
                {tab === "steps" ? (
                  <ol className="steps">{result.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                ) : result.mt ? (
                  <div className="two">
                    <div><h3 className="t-mealy">Mealy</h3>
                      <Trace trace={result.mt} labelOf={(x) => x} start={result.mealy.start} cursor={k} /></div>
                    <div><h3 className="t-moore">Moore</h3>
                      <Trace trace={result.ot} labelOf={(x) => result.moore.labels[x]} start={result.moore.start} cursor={k} startOutput={result.moore.out[result.moore.start]} /></div>
                  </div>
                ) : <p>Fix the test input to see the traces.</p>}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
