export default function MachineTable({ kind, machine }) {
  if (kind === "mealy") {
    return (
      <div className="tablewrap">
        <table className="tt ro">
          <thead>
            <tr><th>State</th>{machine.inputs.map((a) => <th key={a}>on {a}</th>)}</tr>
          </thead>
          <tbody>
            {machine.states.map((q) => (
              <tr key={q}>
                <th>{q}{q === machine.start ? " (start)" : ""}</th>
                {machine.inputs.map((a) => (
                  <td key={a}>{machine.table[q][a].next} / {machine.table[q][a].out}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="tablewrap">
      <table className="tt ro">
        <thead>
          <tr><th>State</th><th>Output</th>{machine.inputs.map((a) => <th key={a}>on {a}</th>)}</tr>
        </thead>
        <tbody>
          {machine.states.map((s) => (
            <tr key={s.id}>
              <th>{s.label}{s.id === machine.start ? " (start)" : ""}</th>
              <td>{s.o}</td>
              {machine.inputs.map((a) => <td key={a}>{machine.labels[machine.delta[s.id][a]]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
