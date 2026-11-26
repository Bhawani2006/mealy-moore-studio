// Human readable steps for the two conversions, shown in the Simulator and Theory pages.
export function mealyToMooreSteps(mealy, moore, initOut) {
  const steps = [];
  steps.push(
    `Start: the Mealy start state ${mealy.start} has not emitted anything yet, so the Moore start state is (${mealy.start},${initOut}) with the chosen initial output ${initOut}.`
  );
  const byQ = {};
  for (const s of moore.states) (byQ[s.q] ||= []).push(s.o);
  for (const q of mealy.states) {
    const outs = byQ[q];
    if (!outs) steps.push(`${q} is never reached, so it gets no Moore state.`);
    else if (outs.length > 1)
      steps.push(
        `${q} is entered with outputs ${outs.join(" and ")}, so it is split into ${outs.map((o) => `(${q},${o})`).join(" and ")}.`
      );
    else steps.push(`${q} is only ever entered with output ${outs[0]}, so it stays as one state (${q},${outs[0]}).`);
  }
  for (const s of moore.states) {
    const parts = mealy.inputs.map((a) => `on ${a} go to ${moore.labels[moore.delta[s.id][a]]}`);
    steps.push(`State (${s.label}) outputs ${s.o}; ${parts.join(", ")}.`);
  }
  const possible = mealy.states.length * mealy.outputs.length;
  steps.push(`Result: ${moore.states.length} Moore states (upper bound is ${mealy.states.length} x ${mealy.outputs.length} = ${possible}).`);
  return steps;
}

export function mooreToMealySteps(moore, mealy) {
  const steps = [];
  steps.push("Rule: a Mealy transition prints the output of the Moore state it enters. The states stay the same.");
  for (const q of mealy.states) {
    const parts = mealy.inputs.map((a) => {
      const c = mealy.table[q][a];
      return `${a}: ${c.next} / ${c.out}`;
    });
    steps.push(`${q}: ${parts.join(", ")}.`);
  }
  steps.push(
    `Note: the Moore start state prints ${moore.out[moore.start]} before any input. A Mealy machine prints nothing at that moment, so that first output is left out when comparing.`
  );
  return steps;
}
