// Moore machine builder, validator and Moore -> Mealy conversion.
import { parseAlphabet, stateNames, MAX_STATES } from "./machine.js";

/**
 * machine = { states:[{id,q,o,label}], inputs, outputs, start, delta[id][a] = id, out[id] = o, labels }
 * (same shape the Mealy -> Moore converter produces, so graphs and runners are shared)
 */
export function buildMoore({ n, inputsText, outputsText, start, outs, cells }) {
  const count = Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 1, 1), MAX_STATES);
  const ids = stateNames(count);
  const inputs = parseAlphabet(inputsText);
  const outputs = parseAlphabet(outputsText);
  const delta = {};
  const out = {};
  const labels = {};
  for (const q of ids) {
    out[q] = outputs.includes(outs[q]) ? outs[q] : outputs[0];
    labels[q] = q;
    delta[q] = {};
    for (const a of inputs) {
      const t = cells[`${q}|${a}`];
      delta[q][a] = ids.includes(t) ? t : ids[0];
    }
  }
  return {
    states: ids.map((q) => ({ id: q, q, o: out[q], label: q })),
    inputs,
    outputs,
    start: ids.includes(start) ? start : ids[0],
    delta,
    out,
    labels,
  };
}

export function validateMoore(m) {
  const errors = [];
  const ids = m.states.map((s) => s.id);
  if (ids.length < 1) errors.push("Add at least one state.");
  if (m.inputs.length === 0) errors.push("Add at least one input symbol.");
  if (new Set(m.inputs).size !== m.inputs.length) errors.push("Input symbols must be unique.");
  if (m.outputs.length === 0) errors.push("Add at least one output symbol.");
  if (new Set(m.outputs).size !== m.outputs.length) errors.push("Output symbols must be unique.");
  if (!ids.includes(m.start)) errors.push("The start state must be one of the states.");
  if (errors.length) return errors;
  for (const s of m.states) {
    if (!m.outputs.includes(m.out[s.id])) errors.push(`State ${s.id} has no valid output.`);
    for (const a of m.inputs) {
      if (!ids.includes(m.delta[s.id]?.[a])) errors.push(`Transition from ${s.id} on ${a} is incomplete.`);
    }
  }
  return errors;
}

/** Moore -> Mealy: the output of a transition is the output of the state it enters. */
export function mooreToMealy(m) {
  const states = m.states.map((s) => s.id);
  const table = {};
  for (const q of states) {
    table[q] = {};
    for (const a of m.inputs) {
      const next = m.delta[q][a];
      table[q][a] = { next, out: m.out[next] };
    }
  }
  return { states, inputs: m.inputs, outputs: m.outputs, start: m.start, table };
}
