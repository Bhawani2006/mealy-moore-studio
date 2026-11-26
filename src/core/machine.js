// Mealy machine model, builder, validator, input tokenizer.
export const MAX_STATES = 8;

export function parseAlphabet(text) {
  return text.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
}

export function stateNames(n) {
  return Array.from({ length: n }, (_, i) => `q${i}`);
}

/**
 * Build a normalised Mealy machine from raw form data.
 * Missing or stale cells fall back to a safe default so the UI never holds an
 * undefined transition; validateMealy() still checks completeness.
 * machine = { states, inputs, outputs, start, table[q][a] = { next, out } }
 */
export function buildMealy({ n, inputsText, outputsText, start, cells }) {
  const count = Math.min(Math.max(Number.isFinite(n) ? Math.trunc(n) : 1, 1), MAX_STATES);
  const states = stateNames(count);
  const inputs = parseAlphabet(inputsText);
  const outputs = parseAlphabet(outputsText);
  const table = {};
  for (const q of states) {
    table[q] = {};
    for (const a of inputs) {
      const c = cells[`${q}|${a}`];
      table[q][a] = {
        next: c && states.includes(c.next) ? c.next : states[0],
        out: c && outputs.includes(c.out) ? c.out : outputs[0],
      };
    }
  }
  return {
    states,
    inputs,
    outputs,
    start: states.includes(start) ? start : states[0],
    table,
  };
}

export function validateMealy(m) {
  const errors = [];
  if (m.states.length < 1) errors.push("Add at least one state.");
  if (m.inputs.length === 0) errors.push("Add at least one input symbol.");
  if (new Set(m.inputs).size !== m.inputs.length) errors.push("Input symbols must be unique.");
  if (m.outputs.length === 0) errors.push("Add at least one output symbol.");
  if (new Set(m.outputs).size !== m.outputs.length) errors.push("Output symbols must be unique.");
  if (!m.states.includes(m.start)) errors.push("The start state must be one of the states.");
  if (errors.length) return errors;
  for (const q of m.states) {
    for (const a of m.inputs) {
      const c = m.table[q]?.[a];
      if (!c || !m.states.includes(c.next) || !m.outputs.includes(c.out)) {
        errors.push(`Transition from ${q} on ${a} is incomplete.`);
      }
    }
  }
  return errors;
}

/** Split the test string into symbols. Single-character alphabets allow "1011". */
export function tokenizeInput(text, inputs) {
  const t = text.trim();
  if (!t) return { symbols: [], error: null };
  const allSingle = inputs.every((s) => s.length === 1);
  const symbols = allSingle && !/[\s,]/.test(t) ? [...t] : t.split(/[\s,]+/).filter(Boolean);
  const bad = symbols.find((s) => !inputs.includes(s));
  if (bad !== undefined) {
    return {
      symbols: [],
      error: `"${bad}" is not in the input alphabet (${inputs.join(", ")}).`,
    };
  }
  return { symbols, error: null };
}
