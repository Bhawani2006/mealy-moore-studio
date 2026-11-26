// Runs a machine over a list of input symbols and records a trace.
function joinOutputs(list, outputs) {
  return list.join(outputs.every((o) => o.length === 1) ? "" : " ");
}

export function runMealy(m, symbols) {
  let q = m.start;
  const steps = [];
  symbols.forEach((a, t) => {
    const { next, out } = m.table[q][a];
    steps.push({ t, from: q, input: a, to: next, output: out });
    q = next;
  });
  return {
    initialOutput: null, // a Mealy machine emits nothing before the first input
    steps,
    outputString: joinOutputs(steps.map((s) => s.output), m.outputs),
  };
}

export function runMoore(m, symbols) {
  let s = m.start;
  const steps = [];
  symbols.forEach((a, t) => {
    const to = m.delta[s][a];
    steps.push({ t, from: s, input: a, to, output: m.out[to] });
    s = to;
  });
  return {
    initialOutput: m.out[m.start], // emitted at t = 0, before any input
    steps,
    outputString: joinOutputs(steps.map((s2) => s2.output), m.outputs),
  };
}
