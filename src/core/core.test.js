import test from "node:test";
import assert from "node:assert/strict";
import { buildMealy, validateMealy, tokenizeInput } from "./machine.js";
import { buildMoore, validateMoore, mooreToMealy } from "./moore.js";
import { mealyToMoore } from "./converter.js";
import { runMealy, runMoore } from "./simulator.js";
import { compareTraces, verifyEquivalence } from "./checker.js";
import { exportMachine, importMachine } from "./io.js";
import { mealyToMooreSteps, mooreToMealySteps } from "./steps.js";
import { EXAMPLES } from "./examples.js";

const build = (ex) => (ex.mode === "mealy" ? buildMealy(ex.form) : buildMoore(ex.form));

test("all examples validate", () => {
  for (const ex of EXAMPLES) {
    const m = build(ex);
    assert.deepEqual(ex.mode === "mealy" ? validateMealy(m) : validateMoore(m), [], ex.name);
  }
});

test("Mealy -> Moore keeps behaviour for every input up to length 8", () => {
  for (const ex of EXAMPLES.filter((e) => e.mode === "mealy")) {
    const mealy = build(ex);
    const moore = mealyToMoore(mealy, "0");
    assert.equal(verifyEquivalence(mealy, moore).equivalent, true, ex.name);
    assert.ok(mealyToMooreSteps(mealy, moore, "0").length > 3);
  }
});

test("Moore -> Mealy keeps behaviour", () => {
  for (const ex of EXAMPLES.filter((e) => e.mode === "moore")) {
    const moore = build(ex);
    const mealy = mooreToMealy(moore);
    assert.equal(verifyEquivalence(mealy, moore).equivalent, true, ex.name);
    const tok = tokenizeInput(ex.form.inputString, moore.inputs);
    const cmp = compareTraces(runMealy(mealy, tok.symbols), runMoore(moore, tok.symbols));
    assert.equal(cmp.same, true);
    assert.ok(mooreToMealySteps(moore, mealy).length > 2);
  }
});

test("101 detector splits q1 and gives 4 states", () => {
  const moore = mealyToMoore(build(EXAMPLES[0]), "0");
  assert.equal(moore.states.length, 4);
  const mealy = build(EXAMPLES[0]);
  const t = runMealy(mealy, tokenizeInput("1011010", mealy.inputs).symbols);
  assert.equal(t.outputString, "0010010");
});

test("broken machine is caught by the equivalence check", () => {
  const mealy = build(EXAMPLES[0]);
  const moore = mealyToMoore(mealy, "0");
  const bad = structuredClone(moore);
  const some = Object.keys(bad.out)[0];
  bad.out[some] = bad.out[some] === "0" ? "1" : "0";
  assert.equal(verifyEquivalence(mealy, bad).equivalent, false);
});

test("JSON export then import round-trips", () => {
  for (const ex of EXAMPLES) {
    const m = build(ex);
    const json = JSON.stringify(exportMachine(ex.mode, m, ex.form.initOut));
    const { mode, form } = importMachine(json);
    assert.equal(mode, ex.mode);
    const m2 = mode === "mealy" ? buildMealy(form) : buildMoore(form);
    assert.deepEqual(m2, m);
  }
});

test("import rejects bad files", () => {
  assert.throws(() => importMachine("nope"));
  assert.throws(() => importMachine(JSON.stringify({ type: "dfa" })));
  assert.throws(() => importMachine(JSON.stringify({ type: "moore", states: ["a"], inputs: ["0"], outputs: ["0"], start: "z" })));
});

test("tokenizer rejects unknown symbols", () => {
  assert.ok(tokenizeInput("102", ["0", "1"]).error);
});
