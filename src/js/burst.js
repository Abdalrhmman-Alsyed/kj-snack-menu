// Comic "starburst" shapes generated as SVG polygons.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** points string for a starburst centred on 0,0 with outer radius 100 */
export function burstPoints(spikes = 16, inner = 0.75, jitter = 0.08, seed = 1) {
  const rnd = mulberry32(seed);
  const pts = [];
  const n = spikes * 2;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * (Math.PI / n) * 0.5;
    const base = i % 2 === 0 ? 100 : 100 * inner;
    const r = base * (1 - jitter / 2 + rnd() * jitter);
    pts.push(`${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function burstSVG(opts = {}, cls = '') {
  const { spikes = 14, inner = 0.74, jitter = 0.1, seed = 5 } = opts;
  return `<svg class="burst ${cls}" viewBox="-110 -110 220 220" aria-hidden="true"><polygon points="${burstPoints(spikes, inner, jitter, seed)}"/></svg>`;
}

/** fills every <svg data-burst> in the document */
export function hydrateBursts(root = document) {
  root.querySelectorAll('svg[data-burst]').forEach((svg) => {
    const pts = burstPoints(+svg.dataset.burst, +(svg.dataset.inner || 0.75), +(svg.dataset.jitter || 0.08), +(svg.dataset.seed || 1));
    svg.innerHTML = `<polygon points="${pts}"/>`;
  });
}
