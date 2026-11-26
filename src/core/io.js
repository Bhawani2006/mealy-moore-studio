// JSON export / import of machines.
import { MAX_STATES, stateNames } from "./machine.js";

export function exportMachine(mode, machine, initOut) {
  if (mode === "mealy") {
    const transitions = [];
    for (const q of machine.states)
      for (const a of machine.inputs) {
        const c = machine.table[q][a];
        transitions.push({ from: q, input: a, to: c.next, output: c.out });
      }
    return { type: "mealy", states: machine.states, inputs: machine.inputs, outputs: machine.outputs, start: machine.start, initialOutput: initOut, transitions };
  }
  const transitions = [];
  for (const s of machine.states)
    for (const a of machine.inputs) transitions.push({ from: s.id, input: a, to: machine.delta[s.id][a] });
  return {
    type: "moore",
    states: machine.states.map((s) => ({ name: s.id, output: s.o })),
    inputs: machine.inputs,
    outputs: machine.outputs,
    start: machine.start,
    transitions,
  };
}

/** Returns { mode, form } for the Simulator, or throws Error with a readable message. */
export function importMachine(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }
  if (!data || (data.type !== "mealy" && data.type !== "moore")) throw new Error('JSON needs "type": "mealy" or "moore".');
  const names = (data.states || []).map((s) => (typeof s === "string" ? s : s?.name));
  if (!names.length || names.some((n) => typeof n !== "string")) throw new Error("states must be a non-empty list of names.");
  if (new Set(names).size !== names.length) throw new Error("State names must be unique.");
  if (names.length > MAX_STATES) throw new Error(`At most ${MAX_STATES} states are supported.`);
  const ids = stateNames(names.length);
  const map = Object.fromEntries(names.map((n, i) => [n, ids[i]]));
  if (!Array.isArray(data.inputs) || !data.inputs.length) throw new Error("inputs must be a non-empty list.");
  if (!Array.isArray(data.outputs) || !data.outputs.length) throw new Error("outputs must be a non-empty list.");
  if (!(data.start in map)) throw new Error("start must be one of the states.");
  const base = {
    n: names.length,
    start: map[data.start],
    inputsText: data.inputs.map(String).join(" "),
    outputsText: data.outputs.map(String).join(" "),
    inputString: "",
    cells: {},
  };
  const tr = Array.isArray(data.transitions) ? data.transitions : [];
  for (const t of tr) {
    if (!(t.from in map) || !(t.to in map)) throw new Error(`Transition uses an unknown state: ${t.from} -> ${t.to}.`);
    if (!data.inputs.map(String).includes(String(t.input))) throw new Error(`Transition uses an unknown input: ${t.input}.`);
    if (data.type === "mealy") {
      if (!data.outputs.map(String).includes(String(t.output))) throw new Error(`Transition uses an unknown output: ${t.output}.`);
      base.cells[`${map[t.from]}|${t.input}`] = { next: map[t.to], out: String(t.output) };
    } else base.cells[`${map[t.from]}|${t.input}`] = map[t.to];
  }
  if (data.type === "mealy") {
    return { mode: "mealy", form: { ...base, initOut: String(data.initialOutput ?? data.outputs[0]) } };
  }
  const outs = {};
  (data.states || []).forEach((s, i) => {
    outs[ids[i]] = String(s?.output ?? data.outputs[0]);
  });
  return { mode: "moore", form: { ...base, outs } };
}
