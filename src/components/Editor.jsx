import { useRef } from "react";
import { EXAMPLES } from "../core/examples.js";
import { MAX_STATES } from "../core/machine.js";

const names = (n) => Array.from({ length: n }, (_, i) => `q${i}`);

export default function Editor({ mode, setMode, form, machine, errors, tokenError, update, setCell, loadExample, onExport, onImport, importError }) {
  const fileRef = useRef(null);
  const states = names(machine.states.length);
  const isMealy = mode === "mealy";

  return (
    <section className="card editor">
      <div className="seg" role="tablist" aria-label="Machine type">
        <button role="tab" aria-selected={isMealy} className={isMealy ? "on" : ""} onClick={() => setMode("mealy")}>Mealy input</button>
        <button role="tab" aria-selected={!isMealy} className={!isMealy ? "on" : ""} onClick={() => setMode("moore")}>Moore input</button>
      </div>

      <label className="field">
        <span>Load an example</span>
        <select value="" onChange={(e) => e.target.value !== "" && loadExample(Number(e.target.value))}>
          <option value="">Choose...</option>
          {EXAMPLES.map((ex, i) => (
            <option key={ex.name} value={i}>{ex.name}</option>
          ))}
        </select>
      </label>

      <div className="grid2">
        <label className="field">
          <span>Number of states (1 to {MAX_STATES})</span>
          <input type="number" min="1" max={MAX_STATES} value={form.n} onChange={(e) => update("n", Number(e.target.value))} />
        </label>
        <label className="field">
          <span>Start state</span>
          <select value={machine.start} onChange={(e) => update("start", e.target.value)}>
            {states.map((q) => <option key={q}>{q}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Input symbols</span>
          <input value={form.inputsText} onChange={(e) => update("inputsText", e.target.value)} placeholder="0 1" />
        </label>
        <label className="field">
          <span>Output symbols</span>
          <input value={form.outputsText} onChange={(e) => update("outputsText", e.target.value)} placeholder="0 1" />
        </label>
        {isMealy && (
          <label className="field">
            <span>Initial output of the Moore result</span>
            <select value={form.initOut} onChange={(e) => update("initOut", e.target.value)}>
              {machine.outputs.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        )}
      </div>

      <h3>{isMealy ? "Transitions: next state / output" : "States: output and transitions"}</h3>
      <div className="tablewrap">
        <table className="tt">
          <thead>
            <tr>
              <th>State</th>
              {!isMealy && <th>Output</th>}
              {machine.inputs.map((a) => <th key={a}>on {a}</th>)}
            </tr>
          </thead>
          <tbody>
            {states.map((q) => (
              <tr key={q}>
                <th>{q}</th>
                {!isMealy && (
                  <td>
                    <select aria-label={`Output of ${q}`} value={form.outs?.[q] ?? machine.outputs[0]} onChange={(e) => setCell(q, null, e.target.value, "out")}>
                      {machine.outputs.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </td>
                )}
                {machine.inputs.map((a) => {
                  const c = isMealy ? machine.table[q]?.[a] : null;
                  const next = isMealy ? c?.next : machine.delta[q]?.[a];
                  return (
                    <td key={a}>
                      <select aria-label={`${q} on ${a}, next state`} value={next} onChange={(e) => setCell(q, a, e.target.value, "next")}>
                        {states.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      {isMealy && (
                        <select aria-label={`${q} on ${a}, output`} value={c?.out} onChange={(e) => setCell(q, a, e.target.value, "out")}>
                          {machine.outputs.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.length > 0 && (
        <ul className="errors" role="alert">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      <label className="field">
        <span>Test input (for example 1011010, or symbols separated by spaces)</span>
        <input value={form.inputString} onChange={(e) => update("inputString", e.target.value)} placeholder="1011010" />
      </label>
      {tokenError && <p className="errors single" role="alert">{tokenError}</p>}

      <div className="row">
        <button className="btn" onClick={onExport} disabled={errors.length > 0}>Download JSON</button>
        <button className="btn" onClick={() => fileRef.current.click()}>Import JSON</button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={onImport} />
      </div>
      {importError && <p className="errors single" role="alert">{importError}</p>}
    </section>
  );
}
