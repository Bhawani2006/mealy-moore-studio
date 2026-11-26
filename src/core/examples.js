const mealy = ({ name, ...o }) => ({ name, mode: "mealy", form: { start: "q0", initOut: "0", inputsText: "0 1", outputsText: "0 1", ...o } });
const moore = ({ name, ...o }) => ({ name, mode: "moore", form: { start: "q0", inputsText: "0 1", outputsText: "0 1", ...o } });

export const EXAMPLES = [
  mealy({
    name: "Overlapping 101 detector (Mealy)",
    n: 3, inputString: "1011010",
    cells: {
      "q0|0": { next: "q0", out: "0" }, "q0|1": { next: "q1", out: "0" },
      "q1|0": { next: "q2", out: "0" }, "q1|1": { next: "q1", out: "0" },
      "q2|0": { next: "q0", out: "0" }, "q2|1": { next: "q1", out: "1" },
    },
  }),
  mealy({
    name: "Detect 11 (Mealy)",
    n: 2, inputString: "1101",
    cells: {
      "q0|0": { next: "q0", out: "0" }, "q0|1": { next: "q1", out: "0" },
      "q1|0": { next: "q0", out: "0" }, "q1|1": { next: "q1", out: "1" },
    },
  }),
  mealy({
    name: "Running parity (Mealy)",
    n: 2, inputString: "110101",
    cells: {
      "q0|0": { next: "q0", out: "0" }, "q0|1": { next: "q1", out: "1" },
      "q1|0": { next: "q1", out: "1" }, "q1|1": { next: "q0", out: "0" },
    },
  }),
  moore({
    name: "Ends with 01 (Moore)",
    n: 3, inputString: "100101",
    outs: { q0: "0", q1: "0", q2: "1" },
    cells: {
      "q0|0": "q1", "q0|1": "q0",
      "q1|0": "q1", "q1|1": "q2",
      "q2|0": "q1", "q2|1": "q0",
    },
  }),
  moore({
    name: "Count 1s modulo 3 (Moore)",
    n: 3, inputString: "1101110",
    inputsText: "0 1", outputsText: "0 1 2",
    outs: { q0: "0", q1: "1", q2: "2" },
    cells: {
      "q0|0": "q0", "q0|1": "q1",
      "q1|0": "q1", "q1|1": "q2",
      "q2|0": "q2", "q2|1": "q0",
    },
  }),
];
