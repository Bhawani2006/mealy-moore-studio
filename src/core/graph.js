// Turns a machine into { nodes, edges, start } for the state diagram.
// Parallel transitions between the same two states share one edge label.
export function mealyGraph(m) {
  const nodes = m.states.map((q) => ({ id: q, label: q }));
  const map = new Map();
  for (const q of m.states) {
    for (const a of m.inputs) {
      const { next, out } = m.table[q][a];
      const k = `${q}|${next}`;
      if (!map.has(k)) map.set(k, { from: q, to: next, labels: [] });
      map.get(k).labels.push(`${a}/${out}`);
    }
  }
  return { nodes, edges: [...map.values()], start: m.start };
}

export function mooreGraph(m) {
  const nodes = m.states.map((s) => ({ id: s.id, label: s.label, output: s.o }));
  const map = new Map();
  for (const s of m.states) {
    for (const a of m.inputs) {
      const to = m.delta[s.id][a];
      const k = `${s.id}>${to}`;
      if (!map.has(k)) map.set(k, { from: s.id, to, labels: [] });
      map.get(k).labels.push(a);
    }
  }
  return { nodes, edges: [...map.values()], start: m.start };
}
