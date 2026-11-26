// Mealy -> Moore. Each Moore state is a pair (q, o): "in Mealy state q,
// having just emitted o". Only pairs reachable from the start are kept (BFS).
const key = (q, o) => `${q}|${o}`;

export function mealyToMoore(m, initialOutput) {
  const startKey = key(m.start, initialOutput);
  const seen = new Set([startKey]);
  const queue = [{ q: m.start, o: initialOutput }];
  const states = [];
  const delta = {};
  const out = {};
  const labels = {};

  while (queue.length) {
    const { q, o } = queue.shift();
    const id = key(q, o);
    states.push({ id, q, o, label: `${q},${o}` });
    labels[id] = `${q},${o}`;
    out[id] = o;
    delta[id] = {};
    for (const a of m.inputs) {
      const { next, out: o2 } = m.table[q][a];
      const target = key(next, o2);
      delta[id][a] = target;
      if (!seen.has(target)) {
        seen.add(target);
        queue.push({ q: next, o: o2 });
      }
    }
  }

  return { states, inputs: m.inputs, outputs: m.outputs, start: startKey, delta, out, labels };
}
