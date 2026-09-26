/**
 * Disegna una pizza in SVG partendo dalla descrizione del menù.
 * Ogni ingrediente ha la sua forma e il suo colore; le posizioni sono
 * casuali ma fisse (dipendono dal seme), così la stessa pizza esce sempre uguale.
 * Coordinate su una tela 200x200 con il centro in (100, 100).
 */

export type PizzaLayer = 'cheese' | 'top' | 'herb' | 'leaf';

export interface PizzaPart {
  d: string;
  fill: string;
  stroke?: string;
  sw?: number;
  t?: string;
}

export interface PizzaPiece {
  layer: PizzaLayer;
  i: number;
  parts: PizzaPart[];
}

export interface PizzaDrawing {
  base: string;
  baseFill: string;
  baseStroke: string;
  crust: string;
  char: string[];
  pieces: PizzaPiece[];
  count: number;
}

const INK = '#1a1412';
const R_TOP = 68; // raggio entro cui cadono i condimenti

type Rnd = () => number;
type Pt = [number, number];

function rng(seed: number): Rnd {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** forma morbida chiusa: una curva liscia che passa per n punti attorno al centro */
function blob(cx: number, cy: number, r: number, rnd: Rnd, jitter = 0.25, n = 7, sx = 1, sy = 1, rot = 0): string {
  const pts: Pt[] = [];
  const off = rnd() * Math.PI * 2;
  const c = Math.cos(rot), s = Math.sin(rot);
  for (let k = 0; k < n; k++) {
    const a = off + (k / n) * Math.PI * 2;
    const rr = r * (1 - jitter / 2 + rnd() * jitter);
    const x = Math.cos(a) * rr * sx;
    const y = Math.sin(a) * rr * sy;
    pts.push([cx + x * c - y * s, cy + x * s + y * c]);
  }
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let k = 0; k < n; k++) {
    const p0 = pts[(k - 1 + n) % n], p1 = pts[k], p2 = pts[(k + 1) % n], p3 = pts[(k + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}

function circle(cx: number, cy: number, r: number): string {
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
}

/** bastoncino con le punte arrotondate (listarelle, patatine) */
function capsule(cx: number, cy: number, len: number, h: number, rot: number): string {
  const c = Math.cos(rot), s = Math.sin(rot);
  const p = (x: number, y: number): string => `${f(cx + x * c - y * s)} ${f(cy + x * s + y * c)}`;
  const L = len / 2, H = h / 2;
  return `M${p(-L, -H)}L${p(L, -H)}A${f(H)} ${f(H)} 0 0 1 ${p(L, H)}L${p(-L, H)}A${f(H)} ${f(H)} 0 0 1 ${p(-L, -H)}Z`;
}

function arc(cx: number, cy: number, r: number, a0: number, span: number): string {
  const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
  const x1 = cx + Math.cos(a0 + span) * r, y1 = cy + Math.sin(a0 + span) * r;
  return `M${f(x0)} ${f(y0)}A${f(r)} ${f(r)} 0 0 1 ${f(x1)} ${f(y1)}`;
}

const leaf = (x: number, y: number, rot: number, sc: number): PizzaPart[] => [
  { d: 'M0 0C8 -14 30 -17 46 0C30 17 8 14 0 0Z', fill: '#5f9a4c', stroke: INK, sw: 2.2, t: `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${sc})` },
  { d: 'M3 0C16 -2 30 -1 42 0', fill: 'none', stroke: '#2f5a2a', sw: 1.6, t: `translate(${f(x)} ${f(y)}) rotate(${f(rot)}) scale(${sc})` }
];

type Maker = (x: number, y: number, rnd: Rnd) => PizzaPart[];

interface Topping {
  test: RegExp;
  layer: PizzaLayer;
  make: Maker;
  count?: number;   // pezzi fissi (altrimenti dipende da quanti ingredienti ci sono)
  spread?: number;  // raggio della zona in cui cadono
}

const rot = (rnd: Rnd) => rnd() * Math.PI * 2;
const deg = (rnd: Rnd) => rnd() * 360;

const TOPPINGS: Topping[] = [
  { test: /burrata/, layer: 'cheese', count: 1, spread: 22, make: (x, y, r) => [
    { d: blob(x, y, 19, r, 0.18, 8), fill: '#fffaf0', stroke: '#e6d8bd', sw: 1.4 },
    { d: blob(x - 3, y - 3, 8, r, 0.3), fill: '#f6ecd9' }
  ] },
  { test: /stracciatella/, layer: 'cheese', count: 9, make: (x, y, r) => {
    const a = rot(r);
    return [{ d: `M${f(x)} ${f(y)}q${f(Math.cos(a) * 6 + 3)} ${f(Math.sin(a) * 6 - 3)} ${f(Math.cos(a) * 12)} ${f(Math.sin(a) * 12)}`, fill: 'none', stroke: '#fffaf0', sw: 5 }];
  } },
  { test: /philadelphia/, layer: 'cheese', count: 5, make: (x, y, r) => [
    { d: blob(x, y, 6.5, r, 0.15), fill: '#fffdf7', stroke: '#e5dccb', sw: 1 },
    { d: arc(x, y, 3, rot(r), 4), fill: 'none', stroke: '#e5dccb', sw: 1 }
  ] },
  { test: /gorgonzola/, layer: 'cheese', count: 5, make: (x, y, r) => [
    { d: blob(x, y, 7, r, 0.35), fill: '#f2edd4' },
    { d: circle(x - 2, y + 1, 1.3), fill: '#5f8f89' },
    { d: circle(x + 2.5, y - 2, 1.1), fill: '#5f8f89' }
  ] },
  { test: /emmental/, layer: 'cheese', count: 4, make: (x, y, r) => [
    { d: blob(x, y, 8, r, 0.2), fill: '#f4d261', stroke: '#d9b340', sw: 1 },
    { d: circle(x + 2, y - 1, 1.9), fill: '#dcb13a' }
  ] },
  { test: /nduja/, layer: 'top', make: (x, y, r) => [{ d: blob(x, y, 5.5, r, 0.5, 6), fill: '#c2331b', stroke: '#8f2010', sw: 1 }] },
  { test: /salame/, layer: 'top', make: (x, y, r) => [
    { d: circle(x, y, 8.5), fill: '#a12b37', stroke: '#6e1a24', sw: 1.2 },
    { d: circle(x - 3, y - 2, 1.2), fill: '#f2c3b2' },
    { d: circle(x + 2.5, y + 2, 1.1), fill: '#f2c3b2' },
    { d: circle(x + 2, y - 3.5, 0.9), fill: '#f2c3b2' }
  ] },
  { test: /guanciale|pancetta|lardo/, layer: 'top', make: (x, y, r) => {
    const a = rot(r);
    return [
      { d: capsule(x, y, 16, 6.5, a), fill: '#f5c9b6', stroke: '#d4897a', sw: 1.1 },
      { d: capsule(x, y, 11, 2, a), fill: '#de8e80' }
    ];
  } },
  { test: /speck/, layer: 'top', count: 4, make: (x, y, r) => [{ d: blob(x, y, 10, r, 0.3, 7, 1.6, 0.6, rot(r)), fill: '#b1524b', stroke: '#f0c3b8', sw: 1.6 }] },
  { test: /crudo/, layer: 'top', count: 4, make: (x, y, r) => [{ d: blob(x, y, 10, r, 0.3, 7, 1.6, 0.65, rot(r)), fill: '#e5898a', stroke: '#f7d2cb', sw: 1.6 }] },
  { test: /cotto/, layer: 'top', make: (x, y, r) => [{ d: blob(x, y, 9, r, 0.3), fill: '#f4a9a3', stroke: '#df857f', sw: 1 }] },
  { test: /funghi/, layer: 'top', make: (x, y, r) => {
    const t = `rotate(${f(deg(r))} ${f(x)} ${f(y)})`;
    return [
      { d: `M${f(x - 7)} ${f(y)}a7 7 0 0 1 14 0Z`, fill: '#b5845a', stroke: '#86603e', sw: 1, t },
      { d: capsule(x, y + 3.5, 7, 4.5, Math.PI / 2), fill: '#dbbc94', stroke: '#86603e', sw: 1, t }
    ];
  } },
  { test: /olive/, layer: 'top', make: (x, y) => [{ d: circle(x, y, 4.3), fill: 'none', stroke: '#2a2220', sw: 2.8 }] },
  { test: /rucola/, layer: 'top', count: 8, make: (x, y, r) => [{ d: blob(x, y, 6.5, r, 0.45, 7, 1.7, 0.55, rot(r)), fill: '#4f8e36', stroke: '#2f5f20', sw: 0.8 }] },
  { test: /pachino|datterino rosso/, layer: 'top', make: (x, y) => [
    { d: circle(x, y, 6.5), fill: '#e8331f', stroke: '#9e1a10', sw: 1.1 },
    { d: circle(x, y, 3.4), fill: '#f47b52' },
    { d: circle(x - 2, y - 2.5, 1.2), fill: '#ffffff' }
  ] },
  { test: /datterino giallo/, layer: 'top', make: (x, y) => [
    { d: circle(x, y, 6.5), fill: '#f6c431', stroke: '#c7930d', sw: 1.1 },
    { d: circle(x, y, 3.4), fill: '#fadd7c' },
    { d: circle(x - 2, y - 2.5, 1.2), fill: '#ffffff' }
  ] },
  { test: /salmone/, layer: 'top', count: 4, make: (x, y, r) => {
    const a = rot(r);
    return [
      { d: blob(x, y, 10, r, 0.25, 7, 1.5, 0.7, a), fill: '#f28b5c', stroke: '#d8683c', sw: 1 },
      { d: capsule(x, y, 12, 1.4, a + 0.5), fill: '#fbd3ba' }
    ];
  } },
  { test: /(?<!crema di )gamberi/, layer: 'top', count: 4, make: (x, y, r) => {
    const t = `rotate(${f(deg(r))} ${f(x)} ${f(y)})`;
    return [
      { d: arc(x, y, 6, -0.4, 3.9), fill: 'none', stroke: '#ee7c58', sw: 6, t },
      { d: arc(x, y, 6, -0.2, 3.4), fill: 'none', stroke: '#f8b595', sw: 2, t }
    ];
  } },
  { test: /cozze/, layer: 'top', count: 4, make: (x, y, r) => {
    const a = rot(r);
    return [
      { d: blob(x, y, 7.5, r, 0.05, 8, 1.35, 0.8, a), fill: '#2b2440', stroke: '#16121f', sw: 1 },
      { d: blob(x, y, 4, r, 0.1, 7, 1.3, 0.7, a), fill: '#f08b3d' }
    ];
  } },
  { test: /calamari/, layer: 'top', count: 5, make: (x, y) => [{ d: circle(x, y, 5.5), fill: 'none', stroke: '#f6efe2', sw: 3.2 }] },
  { test: /tonno/, layer: 'top', make: (x, y, r) => [{ d: blob(x, y, 6, r, 0.55, 6), fill: '#c9a07c', stroke: '#a37a57', sw: 0.8 }] },
  { test: /cipolla caramellata/, layer: 'top', count: 7, make: (x, y, r) => [{ d: arc(x, y, 6, rot(r), 2.4), fill: 'none', stroke: '#a8622c', sw: 2.4 }] },
  { test: /cipolla/, layer: 'top', count: 7, make: (x, y, r) => [{ d: arc(x, y, 6, rot(r), 2.4), fill: 'none', stroke: '#a24d8d', sw: 2 }] },
  { test: /acciughe/, layer: 'top', count: 5, make: (x, y, r) => [{ d: blob(x, y, 7, r, 0.1, 8, 2, 0.35, rot(r)), fill: '#6d5d50', stroke: '#4a3e35', sw: 0.8 }] },
  { test: /sardella/, layer: 'top', count: 7, make: (x, y, r) => [{ d: blob(x, y, 4.5, r, 0.5, 6), fill: '#b63f1e' }] },
  { test: /wurstel/, layer: 'top', count: 5, make: (x, y) => [
    { d: circle(x, y, 6.5), fill: '#e8917a', stroke: '#b5624b', sw: 1.2 },
    { d: circle(x, y, 3.8), fill: '#f2b29e' }
  ] },
  { test: /patatine/, layer: 'top', count: 8, make: (x, y, r) => [{ d: capsule(x, y, 15, 4.6, rot(r)), fill: '#f3c64a', stroke: '#d29f22', sw: 0.9 }] },
  { test: /carciofi/, layer: 'top', count: 5, make: (x, y, r) => [
    { d: blob(x, y, 7, r, 0.1, 8, 1.3, 0.85, rot(r)), fill: '#90a35c', stroke: '#5d7136', sw: 1.2 }
  ] },
  { test: /melanzane/, layer: 'top', count: 5, make: (x, y) => [{ d: circle(x, y, 7.5), fill: '#ecdcb2', stroke: '#4a2340', sw: 2.6 }] },
  { test: /peperoni/, layer: 'top', count: 6, make: (x, y, r) => [{ d: arc(x, y, 7, rot(r), 1.9), fill: 'none', stroke: r() > 0.5 ? '#e3321f' : '#f5c230', sw: 4 }] },
  { test: /(?<!crema di )zucchine/, layer: 'top', count: 5, make: (x, y) => [
    { d: circle(x, y, 7), fill: '#e8ecb3', stroke: '#3f7a34', sw: 2.2 },
    { d: circle(x, y, 2), fill: '#d3d98f' }
  ] },
  { test: /uovo/, layer: 'top', count: 1, spread: 14, make: (x, y, r) => [
    { d: blob(x, y, 17, r, 0.25, 8), fill: '#fffaf0', stroke: '#eadfc8', sw: 1 },
    { d: circle(x + 1, y - 1, 7), fill: '#f5b41c', stroke: '#d8920c', sw: 1 }
  ] },
  { test: /grana|pecorino/, layer: 'herb', count: 10, make: (x, y, r) => [{ d: capsule(x, y, 8, 3.2, rot(r)), fill: '#f1da96' }] },
  // le creme vanno a ciuffetti, come quando si mettono col cucchiaino
  { test: /crema di basilico/, layer: 'herb', count: 9, make: (x, y, r) => [
    { d: blob(x, y, 4.2, r, 0.35, 6), fill: '#3f8a3a', stroke: '#2b6428', sw: 0.8 },
    { d: circle(x - 1.2, y - 1.2, 1.1), fill: '#8fcf7c' }
  ] },
  { test: /pesto di pistacchio/, layer: 'herb', count: 9, make: (x, y, r) => [
    { d: blob(x, y, 4.2, r, 0.35, 6), fill: '#9fb458', stroke: '#76893a', sw: 0.8 },
    { d: circle(x + 1.5, y + 1, 0.9), fill: '#5e7a2c' }
  ] },
  { test: /origano/, layer: 'herb', count: 22, make: (x, y) => [{ d: circle(x, y, 1.1), fill: '#5b7a36' }] },
  { test: /pepe rosa/, layer: 'herb', count: 14, make: (x, y) => [{ d: circle(x, y, 1.8), fill: '#e36c85' }] },
  { test: /aglio/, layer: 'herb', count: 6, make: (x, y, r) => [{ d: blob(x, y, 4, r, 0.1, 7, 1.2, 0.75, rot(r)), fill: '#f7f1de', stroke: '#dcd0ad', sw: 0.8 }] }
];

const BASES: [RegExp, string, string][] = [
  [/crema di zucchine/, '#b7cf79', '#8fae52'],
  [/crema di piselli/, '#a7c65b', '#7fa13a'],
  [/crema di gamberi/, '#f3a586', '#dc8062'],
  [/pomodoro/, '#dc2a1c', '#b01a10']
];

/** punto nel disco il più lontano possibile da quelli già usati (distribuzione uniforme) */
function place(taken: Pt[], rnd: Rnd, spread: number): Pt {
  let best: Pt = [100, 100];
  let bestD = -1;
  for (let k = 0; k < 14; k++) {
    const a = rnd() * Math.PI * 2;
    const r = spread * Math.sqrt(rnd());
    const p: Pt = [100 + Math.cos(a) * r, 100 + Math.sin(a) * r];
    let d = Infinity;
    for (const q of taken) d = Math.min(d, (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2);
    if (d > bestD) { bestD = d; best = p; }
  }
  taken.push(best);
  return best;
}

export function drawPizza(description: string, seed: number, variant: 'menu' | 'logo' = 'menu'): PizzaDrawing {
  const rnd = rng(seed * 9301 + 49297);
  const text = norm(description);
  const items = text.split(',').map((s) => s.trim()).filter(Boolean);

  const baseRule = BASES.find(([re]) => re.test(text));
  const baseFill = baseRule ? baseRule[1] : '#fbf1de';
  const baseStroke = baseRule ? baseRule[2] : '#ead7b3';
  const whiteBase = !baseRule;

  const logo = variant === 'logo';
  const base = logo ? circle(100, 100, 80) : blob(100, 100, 80, rnd, 0.06, 18);

  // bruciature del cornicione (la "leopardatura" del forno a legna)
  const char: string[] = [];
  const nChar = logo ? 7 : 13;
  for (let k = 0; k < nChar; k++) {
    const a = (k / nChar) * Math.PI * 2 + rnd() * 0.4;
    const r = 88 + rnd() * 3;
    char.push(blob(100 + Math.cos(a) * r, 100 + Math.sin(a) * r, 2 + rnd() * 2.2, rnd, 0.5, 6, 1.4, 0.8, a + Math.PI / 2));
  }

  const pieces: PizzaPiece[] = [];
  const taken: Pt[] = [];
  let i = 0;
  const push = (layer: PizzaLayer, parts: PizzaPart[]) => pieces.push({ layer, i: i++, parts });

  if (logo) {
    // come nel logo: grossi dischi di mozzarella perfettamente tondi
    const dots: [number, number, number][] = [[62, 56, 11], [104, 44, 8], [140, 72, 12], [76, 104, 7], [122, 118, 13], [66, 142, 10], [102, 158, 7], [150, 132, 6]];
    for (const [x, y, r] of dots) push('cheese', [{ d: circle(x, y, r), fill: '#fffaf0' }]);
    push('leaf', leaf(128, 36, -34, 0.95));
    push('leaf', leaf(134, 38, 26, 0.85));
    return { base, baseFill: '#d51313', baseStroke: INK, crust: '#f5a623', char, pieces, count: i };
  }

  // la mozzarella va sotto a tutto il resto
  const hasMozza = items.some((s) => /mozz|fior di latte|bufala/.test(s));
  if (hasMozza) {
    const n = whiteBase ? 6 : 8;
    for (let k = 0; k < n; k++) {
      const [x, y] = place(taken, rnd, 62);
      push('cheese', [{ d: blob(x, y, whiteBase ? 8 : 10 + rnd() * 4, rnd, 0.4, 7), fill: whiteBase ? '#f2d8a2' : '#fff7e8' }]);
    }
  }

  const toppings: Topping[] = [];
  for (const item of items) {
    for (const t of TOPPINGS) {
      if (t.test.test(item) && !toppings.includes(t)) toppings.push(t);
    }
  }
  const nTop = toppings.filter((t) => t.layer === 'top' && !t.count).length || 1;

  const order: PizzaLayer[] = ['cheese', 'top', 'herb'];
  for (const layer of order) {
    for (const t of toppings.filter((x) => x.layer === layer)) {
      const n = t.count ?? Math.max(4, Math.min(8, Math.round(16 / nTop)));
      const local: Pt[] = layer === 'herb' ? [] : taken;
      for (let k = 0; k < n; k++) {
        const [x, y] = place(local, rnd, t.spread ?? R_TOP);
        push(layer, t.make(x, y, rnd));
      }
    }
  }

  return { base, baseFill, baseStroke, crust: '#eaae5f', char, pieces, count: i };
}
