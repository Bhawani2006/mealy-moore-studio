// Behaviour checks. The Moore machine's initial output is ignored: it has no
// Mealy counterpart. Both machines are compared from the first input onward.
export function compareTraces(mealyTrace, mooreTrace) {
  const a = mealyTrace.steps;
  const b = mooreTrace.steps;
  let firstDiff = -1;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]?.output !== b[i]?.output) {
      firstDiff = i;
      break;
    }
  }
  return { same: firstDiff === -1, firstDiff };
}

/** BFS over (Mealy state, Moore state) pairs: proves equivalence for ALL inputs. */
export function verifyEquivalence(mealy, moore) {
  const k = (p, s) => `${p}\u0000${s}`;
  const seen = new Set([k(mealy.start, moore.start)]);
  const queue = [{ p: mealy.start, s: moore.start, path: [] }];
  let pairs = 0;
  while (queue.length) {
    const { p, s, path } = queue.shift();
    pairs++;
    for (const a of mealy.inputs) {
      const { next, out } = mealy.table[p][a];
      const s2 = moore.delta[s][a];
      if (moore.out[s2] !== out) {
        return { equivalent: false, counterexample: [...path, a], pairs };
      }
      const key = k(next, s2);
      if (!seen.has(key)) {
        seen.add(key);
        queue.push({ p: next, s: s2, path: [...path, a] });
      }
    }
  }
  return { equivalent: true, counterexample: null, pairs };
}
