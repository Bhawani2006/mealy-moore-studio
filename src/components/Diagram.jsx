import { useEffect, useId, useMemo, useRef, useState } from "react";

const NR = 30;
const polar = (p, ang, r) => [p.x + r * Math.cos(ang), p.y + r * Math.sin(ang)];
const norm = (x, y) => {
  const d = Math.hypot(x, y) || 1;
  return [x / d, y / d];
};

function baseLayout(nodes) {
  const n = nodes.length;
  const R = n === 1 ? 0 : Math.max(130, n * 38);
  return nodes.map((nd, i) => {
    const ang = n === 1 ? -Math.PI / 2 : -Math.PI / 2 + (2 * Math.PI * i) / n;
    return { ...nd, bx: R * Math.cos(ang), by: R * Math.sin(ang), ang };
  });
}

function loopGeometry(p) {
  const th = p.ang;
  const s = polar(p, th - 0.5, NR);
  const e = polar(p, th + 0.5, NR + 3);
  const c1 = polar(p, th - 0.55, NR * 2.5);
  const c2 = polar(p, th + 0.55, NR * 2.5);
  const [lx, ly] = polar(p, th, NR * 1.82 + 14);
  return { d: `M${s[0]},${s[1]} C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${e[0]},${e[1]}`, lx, ly };
}

function edgeGeometry(a, b, curved) {
  const [ux, uy] = norm(b.x - a.x, b.y - a.y);
  const nx = -uy;
  const ny = ux;
  const bend = curved ? 56 : 0;
  const cx = (a.x + b.x) / 2 + nx * bend;
  const cy = (a.y + b.y) / 2 + ny * bend;
  const [sx, sy] = norm(cx - a.x, cy - a.y);
  const [ex, ey] = norm(cx - b.x, cy - b.y);
  const s = [a.x + sx * NR, a.y + sy * NR];
  const e = [b.x + ex * (NR + 3), b.y + ey * (NR + 3)];
  return {
    d: `M${s[0]},${s[1]} Q${cx},${cy} ${e[0]},${e[1]}`,
    lx: 0.25 * s[0] + 0.5 * cx + 0.25 * e[0] + nx * 13,
    ly: 0.25 * s[1] + 0.5 * cy + 0.25 * e[1] + ny * 13,
  };
}

/**
 * Zoomable, pannable state diagram. Drag a state to move it, drag the background to pan,
 * use the mouse wheel or the buttons to zoom.
 */
export default function Diagram({ graph, color, activeNode, activeEdge, moore = false, label }) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef(null);
  const base = useMemo(() => baseLayout(graph.nodes), [graph]);
  const [offs, setOffs] = useState({});
  const [view, setView] = useState({ k: 1, x: 0, y: 0 });
  const drag = useRef(null);

  // a new machine shape resets the layout
  const shape = graph.nodes.map((n) => n.id).join(",");
  useEffect(() => {
    setOffs({});
    setView({ k: 1, x: 0, y: 0 });
  }, [shape]);

  const pos = useMemo(
    () => base.map((p) => ({ ...p, x: p.bx + (offs[p.id]?.x || 0), y: p.by + (offs[p.id]?.y || 0) })),
    [base, offs]
  );
  const byId = useMemo(() => Object.fromEntries(pos.map((p) => [p.id, p])), [pos]);
  const pairs = useMemo(() => new Set(graph.edges.map((e) => `${e.from}>${e.to}`)), [graph]);

  const pad = 120;
  const xs = base.map((p) => p.bx);
  const ys = base.map((p) => p.by);
  const vb = {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };

  const unitsPerPx = () => {
    const r = svgRef.current.getBoundingClientRect();
    return Math.max(vb.w / r.width, vb.h / r.height);
  };

  const zoomBy = (f, cx = 0, cy = 0) =>
    setView((v) => {
      const k = Math.min(4, Math.max(0.3, v.k * f));
      const r = k / v.k;
      // keep the point (cx, cy) fixed on screen
      return { k, x: cx - (cx - v.x) * r, y: cy - (cy - v.y) * r };
    });

  useEffect(() => {
    const el = svgRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const u = Math.max(vb.w / r.width, vb.h / r.height);
      const cx = (e.clientX - r.left - r.width / 2) * u;
      const cy = (e.clientY - r.top - r.height / 2) * u;
      zoomBy(e.deltaY < 0 ? 1.12 : 1 / 1.12, cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  });

  const onDown = (e, id) => {
    e.stopPropagation();
    svgRef.current.setPointerCapture(e.pointerId);
    drag.current = { id, sx: e.clientX, sy: e.clientY, o: offs[id] || { x: 0, y: 0 }, v: view };
  };
  const onBgDown = (e) => {
    svgRef.current.setPointerCapture(e.pointerId);
    drag.current = { id: null, sx: e.clientX, sy: e.clientY, v: view };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const u = unitsPerPx();
    const dx = (e.clientX - d.sx) * u;
    const dy = (e.clientY - d.sy) * u;
    if (d.id) setOffs((o) => ({ ...o, [d.id]: { x: d.o.x + dx / d.v.k, y: d.o.y + dy / d.v.k } }));
    else setView({ ...d.v, x: d.v.x + dx, y: d.v.y + dy });
  };
  const onUp = () => {
    drag.current = null;
  };

  const edges = [...graph.edges].sort(
    (a, b) => Number(`${a.from}|${a.to}` === activeEdge) - Number(`${b.from}|${b.to}` === activeEdge)
  );
  const startNode = byId[graph.start];
  const sAng = startNode.ang + 1.1;
  const [sx1, sy1] = polar(startNode, sAng, NR + 40);
  const [sx2, sy2] = polar(startNode, sAng, NR + 3);
  const cx0 = vb.x + vb.w / 2;
  const cy0 = vb.y + vb.h / 2;

  return (
    <div className="dg" style={{ "--machine": color }}>
      <div className="dg-tools">
        <button className="mini" onClick={() => zoomBy(1.25)} aria-label="Zoom in">+</button>
        <button className="mini" onClick={() => zoomBy(1 / 1.25)} aria-label="Zoom out">-</button>
        <button className="mini wide" onClick={() => { setView({ k: 1, x: 0, y: 0 }); setOffs({}); }}>Reset view</button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        role="img"
        aria-label={label}
        onPointerDown={onBgDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <marker id={`${uid}a`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto">
            <path className="arrow" d="M0,0 L10,5 L0,10 z" />
          </marker>
          <marker id={`${uid}b`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto">
            <path className="arrow-on" d="M0,0 L10,5 L0,10 z" />
          </marker>
        </defs>
        <g transform={`translate(${view.x} ${view.y}) translate(${cx0} ${cy0}) scale(${view.k}) translate(${-cx0} ${-cy0})`}>
          <line className="edge" x1={sx1} y1={sy1} x2={sx2} y2={sy2} markerEnd={`url(#${uid}a)`} />
          <text className="start-text" x={sx1} y={sy1} dy={-8}>start</text>
          {edges.map((e) => {
            const key = `${e.from}|${e.to}`;
            const on = key === activeEdge;
            const a = byId[e.from];
            const b = byId[e.to];
            const g = e.from === e.to ? loopGeometry(a) : edgeGeometry(a, b, pairs.has(`${e.to}>${e.from}`));
            return (
              <g key={key}>
                <path className={on ? "edge on" : "edge"} d={g.d} markerEnd={`url(#${uid}${on ? "b" : "a"})`} />
                <text className={on ? "elabel on" : "elabel"} x={g.lx} y={g.ly} textAnchor="middle" dominantBaseline="central">
                  {e.labels.join(", ")}
                </text>
              </g>
            );
          })}
          {pos.map((p) => (
            <g key={p.id} transform={`translate(${p.x},${p.y})`} className="nd" onPointerDown={(e) => onDown(e, p.id)}>
              <circle className={p.id === activeNode ? "node on" : "node"} r={NR} />
              {moore ? (
                <>
                  <text className="nname" y={-6}>{p.label}</text>
                  <line className="divider" x1={-NR * 0.7} x2={NR * 0.7} y1={3} y2={3} />
                  <text className="nout" y={19}>{p.output}</text>
                </>
              ) : (
                <text className="nname" dy="0.35em">{p.label}</text>
              )}
            </g>
          ))}
        </g>
      </svg>
      <p className="dg-hint">Drag a state to move it. Drag empty space to pan. Scroll to zoom.</p>
    </div>
  );
}
