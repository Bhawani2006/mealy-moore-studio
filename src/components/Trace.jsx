export default function Trace({ trace, labelOf, start, cursor, startOutput }) {
  return (
    <div className="tablewrap">
      <table className="tt ro trace">
        <thead>
          <tr><th>Step</th><th>State</th><th>Input</th><th>Next</th><th>Output</th></tr>
        </thead>
        <tbody>
          {startOutput != null && (
            <tr className="muted">
              <td>0</td><td>{labelOf(start)}</td><td>-</td><td>-</td><td>{startOutput}</td>
            </tr>
          )}
          {trace.steps.map((s) => (
            <tr key={s.t} className={s.t + 1 === cursor ? "now" : s.t + 1 > cursor ? "later" : ""}>
              <td>{s.t + 1}</td><td>{labelOf(s.from)}</td><td>{s.input}</td><td>{labelOf(s.to)}</td><td>{s.output}</td>
            </tr>
          ))}
          {trace.steps.length === 0 && <tr><td colSpan="5">No input yet.</td></tr>}
        </tbody>
      </table>
      <p className="hint">Output string: <b>{trace.outputString || "(empty)"}</b></p>
    </div>
  );
}
