'use strict';
/* ==========================================================
   Wardrobe data + SVG character renderer
   Character space: viewBox 0 0 300 580, centred on x = 150.
   Most pieces are drawn for the LEFT side and mirrored.
   ========================================================== */

const BRAT = '#8ACE00';

const SKIN_TONES = ['#FFE3D3', '#F9D2B6', '#F1C19F', '#E3A87E', '#D19A6A', '#B97E52', '#9A6440', '#7A4A2E', '#5C3620', '#3E2415', '#BFE3FF', '#CDB8FF', '#B6F07A', '#FFB6D9'];
const HAIR_COLORS = ['#111111', '#3b2416', '#5a3825', '#8b5a2b', '#b5562b', '#e3b04b', '#f3e2a9', '#f0f0f0', '#ff8fc8', '#c9a7ff', '#5ab4ff', '#8ACE00', '#e0245e', '#2ec4b6'];
const EYE_COLORS = ['#6b4226', '#3b2416', '#3a7bd5', '#2d9c5a', '#8f9aa5', '#a06cd5', '#e0245e', '#d4af37', '#111111', '#8ACE00'];
const LIP_COLORS = ['#e07a8a', '#c2185b', '#e0245e', '#b5651d', '#7a1f3d', '#ff8fc8', '#d9a38e', '#111111', '#8ACE00', '#5e2a84'];
const PALETTE = ['#111111', '#ffffff', '#8ACE00', '#ff4fa3', '#ff8fc8', '#e0245e', '#ff3b30', '#ff9500', '#ffd60a', '#fff3b0', '#34c759', '#b8f2c9', '#2ec4b6', '#5ab4ff', '#0a84ff', '#1d3557', '#5e5ce6', '#c9a7ff', '#bf5af2', '#7a1f3d', '#a2845e', '#f5e6c8', '#c0c0c0', '#d4af37'];
const PATTERNS = ['solid', 'stripes', 'diag', 'polka', 'check', 'plaid', 'leopard', 'zebra', 'hearts', 'stars', 'flowers', 'sparkle', 'denim', 'mesh', 'mirror', 'paisley', 'bandhani', 'web', 'snow', 'gulal', 'phulkari', 'lehariya'];

/* ---------- tiny SVG helpers ---------- */
const OL = 'stroke="#2b1a24" stroke-opacity=".5" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"';
const p = (d, f, ex = '') => `<path d="${d}" fill="${f}" ${OL} ${ex}/>`;
const ln = (d, c = '#2b1a24', w = 1.4, op = .45) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, f, ex = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${ex}/>`;
const mir = s => `<g transform="translate(300 0) scale(-1 1)">${s}</g>`;
const both = s => s + mir(s);
const r1 = n => Math.round(n * 10) / 10;

function clamp255(v) { return Math.max(0, Math.min(255, v)); }
function shade(hex, amt) {
  if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
  const n = parseInt(hex.slice(1), 16);
  const f = v => clamp255(Math.round(amt < 0 ? v * (1 + amt / 100) : v + (255 - v) * (amt / 100)));
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}
function heart(cx, cy, s) {
  return `M${cx},${cy + s * .9} C${cx - s * 1.7},${cy - s * .2} ${cx - s * .7},${cy - s * 1.4} ${cx},${cy - s * .4} C${cx + s * .7},${cy - s * 1.4} ${cx + s * 1.7},${cy - s * .2} ${cx},${cy + s * .9} Z`;
}
function star(cx, cy, R, r = R * .45) {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
    d += (i ? 'L' : 'M') + r1(cx + rr * Math.cos(a)) + ',' + r1(cy + rr * Math.sin(a));
  }
  return d + 'Z';
}
function sparkle(cx, cy, s) {
  return `M${cx},${cy - s} Q${cx},${cy} ${cx + s},${cy} Q${cx},${cy} ${cx},${cy + s} Q${cx},${cy} ${cx - s},${cy} Q${cx},${cy} ${cx},${cy - s} Z`;
}
function qpt(a, b, c, t) {
  const u = 1 - t;
  return [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]];
}

/* ---------- patterns ---------- */
function patternDef(id, pat, c1, c2) {
  const W = (w, h, inner, ex = '', base = `<rect width="${w}" height="${h}" fill="${c1}"/>`) =>
    `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}" ${ex}>${base}${inner}</pattern>`;
  switch (pat) {
    case 'stripes': return W(12, 12, `<rect width="12" height="5" fill="${c2}"/>`);
    case 'diag': return W(10, 10, `<rect width="4" height="10" fill="${c2}"/>`, 'patternTransform="rotate(40)"');
    case 'polka': return W(14, 14, `<circle cx="3.5" cy="3.5" r="2.4" fill="${c2}"/><circle cx="10.5" cy="10.5" r="2.4" fill="${c2}"/>`);
    case 'check': return W(14, 14, `<rect width="7" height="14" fill="${c2}" opacity=".45"/><rect width="14" height="7" fill="${c2}" opacity=".45"/>`);
    case 'plaid': return W(24, 24, `<rect y="4" width="24" height="6" fill="${c2}" opacity=".5"/><rect x="4" width="6" height="24" fill="${c2}" opacity=".5"/><rect y="16" width="24" height="1.5" fill="${c2}" opacity=".8"/><rect x="16" width="1.5" height="24" fill="${c2}" opacity=".8"/>`);
    case 'leopard': return W(26, 26, `<g fill="none" stroke="${c2}" stroke-width="2.2" stroke-linecap="round"><path d="M3,5 q4,-4 8,0"/><path d="M15,14 q4,-4 8,1"/><path d="M4,19 q3,4 8,2"/><path d="M17,3 q3,3 6,0"/></g><g fill="${shade(c1, -25)}"><circle cx="7" cy="6" r="1.8"/><circle cx="19" cy="15" r="1.8"/><circle cx="8" cy="20" r="1.6"/></g>`);
    case 'zebra': return W(20, 20, `<path d="M0,3 Q6,6 10,3 T20,4 L20,7 Q14,10 10,7 T0,7Z M0,13 Q5,16 10,13 T20,14 L20,16 Q14,19 10,16 T0,17Z" fill="${c2}"/>`);
    case 'hearts': return W(18, 18, `<path d="${heart(9, 9, 4)}" fill="${c2}"/>`);
    case 'stars': return W(20, 20, `<path d="${star(10, 10, 5)}" fill="${c2}"/>`);
    case 'flowers': return W(22, 22, [0, 72, 144, 216, 288].map(a => `<circle cx="${r1(11 + 4 * Math.cos(a * Math.PI / 180))}" cy="${r1(11 + 4 * Math.sin(a * Math.PI / 180))}" r="3" fill="${c2}"/>`).join('') + '<circle cx="11" cy="11" r="2" fill="#ffd60a"/>');
    case 'sparkle': return W(16, 16, `<path d="${sparkle(4, 4, 3)}" fill="${c2}" opacity=".9"/><path d="${sparkle(12, 11, 2.2)}" fill="${c2}" opacity=".8"/><circle cx="12" cy="3" r=".9" fill="${c2}"/><circle cx="3" cy="13" r=".8" fill="${c2}"/>`);
    case 'denim': return W(6, 6, `<path d="M0,6 L6,0 M-1,1 L1,-1 M5,7 L7,5" stroke="${c2}" stroke-width="1" opacity=".45"/>`);
    case 'mesh': return W(7, 7, `<path d="M0,0 L7,7 M7,0 L0,7" stroke="${c2}" stroke-width=".9"/>`, '', `<rect width="7" height="7" fill="${c1}" opacity=".3"/>`);
    case 'mirror': return W(18, 18, `<circle cx="9" cy="9" r="4" fill="#e8eef5" stroke="${c2}" stroke-width="1.6"/><circle cx="0" cy="0" r="2" fill="${c2}"/><circle cx="18" cy="18" r="2" fill="${c2}"/><circle cx="18" cy="0" r="2" fill="${c2}"/><circle cx="0" cy="18" r="2" fill="${c2}"/>`);
    case 'paisley': return W(24, 24, `<path d="M8,16 C2,14 2,6 8,4 C14,2 16,10 12,14 C10,16 9,18 12,21 C7,21 6,18 8,16 Z" fill="${c2}"/><circle cx="9" cy="9" r="1.6" fill="${c1}"/><circle cx="19" cy="6" r="1.4" fill="${c2}"/><circle cx="20" cy="18" r="1" fill="${c2}"/>`);
    case 'bandhani': return W(14, 14, `<g fill="${c2}"><circle cx="3" cy="3" r="1"/><circle cx="5.5" cy="3" r="1"/><circle cx="4.2" cy="5.2" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="12.5" cy="10" r="1"/><circle cx="11.2" cy="12.2" r="1"/></g>`);
    case 'web': return W(40, 40, `<g stroke="${c2}" stroke-width=".8" fill="none"><path d="M20,0 L20,40 M0,20 L40,20 M0,0 L40,40 M40,0 L0,40"/><path d="M20,12 L28,20 L20,28 L12,20 Z"/><path d="M20,5 L35,20 L20,35 L5,20 Z"/></g>`, '', `<rect width="40" height="40" fill="${c1}" opacity=".3"/>`);
    case 'snow': return W(22, 22, `<g stroke="${c2}" stroke-width="1.2" stroke-linecap="round"><path d="M11,6 L11,16 M6.7,8.5 L15.3,13.5 M6.7,13.5 L15.3,8.5"/></g><circle cx="2" cy="20" r="1" fill="${c2}"/><circle cx="20" cy="2" r="1" fill="${c2}"/>`);
    case 'gulal': return W(30, 30, [[5, 6, '#ff4fa3', 4], [20, 4, '#34c759', 3], [14, 16, '#ffd60a', 4.5], [26, 22, '#5ab4ff', 3.5], [4, 24, '#bf5af2', 3]].map(([x, y, c, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" opacity=".85"/><circle cx="${x + r}" cy="${y - r * .6}" r="${r * .35}" fill="${c}" opacity=".85"/>`).join(''));
    case 'phulkari': return W(16, 16, `<path d="M8,1 L15,8 L8,15 L1,8 Z" fill="${c2}"/><path d="M8,4.5 L11.5,8 L8,11.5 L4.5,8 Z" fill="#ffd60a"/><circle cx="8" cy="8" r="1" fill="${c1}"/>`);
    case 'lehariya': return W(14, 14, `<path d="M-2,10 Q1.5,4 5,10 T12,10 T19,10" stroke="${c2}" stroke-width="2.4" fill="none"/>`, 'patternTransform="rotate(-35)"');
    default: return '';
  }
}

/* ---------- body geometry ---------- */
function interp(t, y) {
  if (y <= t[0][0]) return t[0][1];
  for (let i = 1; i < t.length; i++) {
    if (y <= t[i][0]) { const [y0, v0] = t[i - 1], [y1, v1] = t[i]; return v0 + (v1 - v0) * (y - y0) / (y1 - y0); }
  }
  return t[t.length - 1][1];
}
// torso half-width by height
const TW = [[140, 38], [152, 44], [160, 47], [168, 51], [182, 53], [196, 52], [214, 47], [232, 41], [250, 36], [268, 34], [284, 38], [300, 43], [322, 47], [345, 48], [380, 52], [420, 56], [460, 60], [560, 70]];
const hw = y => interp(TW, y);
// left leg outer / inner x by height
const OUT = [[310, 104], [330, 104], [360, 108], [400, 115], [440, 120], [480, 123], [530, 127], [560, 127]];
const INN = [[310, 150], [335, 150], [360, 148], [420, 146], [480, 144], [530, 142], [560, 142]];
function range(a, b, step = 6) { const r = []; for (let y = a; y < b; y += step) r.push(y); r.push(b); return r; }

function torso(y1, y2, o = {}) {
  const pad = o.pad ?? 2, hem = o.hem ?? 0, ys = range(y1, y2);
  const L = ys.map(y => [r1(150 - hw(y) - pad), y]), R = ys.map(y => [r1(150 + hw(y) + pad), y]);
  const xl = L[0][0], xr = R[0][0];
  const N = {
    straight: `L${xr},${y1}`,
    crew: `L138,${y1 - 1} Q150,${y1 + 12} 162,${y1 - 1} L${xr},${y1}`,
    scoop: `L133,${y1} Q150,${y1 + 34} 167,${y1} L${xr},${y1}`,
    v: `L137,${y1} L150,${y1 + 40} L163,${y1} L${xr},${y1}`,
    sweet: `Q${xl + 16},${y1 - 9} 150,${y1 + 5} Q${xr - 16},${y1 - 9} ${xr},${y1}`,
    turtle: `L137,${y1} L137,${y1 - 30} L163,${y1 - 30} L163,${y1} L${xr},${y1}`,
    shoulder: `Q150,${y1 - 12} ${xr},${y1}`,
  }[o.neck || 'straight'];
  return `M${xl},${y1} ${N} ` + R.slice(1).map(q => `L${q[0]},${q[1]}`).join(' ') +
    ` Q150,${y2 + hem} ${L[L.length - 1][0]},${y2} ` + L.slice(0, -1).reverse().map(q => `L${q[0]},${q[1]}`).join(' ') + ' Z';
}
function skirt(yW, yE, flare, o = {}) {
  const pad = o.pad ?? 2, hem = o.hem ?? 5, yh = Math.min(yE, 322);
  const R = range(yW, yh).map(y => [r1(150 + hw(y) + pad), y]);
  R.push([r1(150 + hw(yh) + pad + flare), yE]);
  const L = R.map(([x, y]) => [r1(300 - x), y]);
  return `M${L[0][0]},${yW} L${R[0][0]},${yW} ` + R.slice(1).map(q => `L${q[0]},${q[1]}`).join(' ') +
    ` Q150,${yE + hem} ${L[L.length - 1][0]},${yE} ` + L.slice(0, -1).reverse().map(q => `L${q[0]},${q[1]}`).join(' ') + ' Z';
}
function pants(yW, yE, o = {}) {
  const pad = o.pad ?? 2, fl = o.flare ?? 0, CR = 336;
  const fx = y => (fl && y > yE - 70 ? fl * (y - (yE - 70)) / 70 : 0);
  const ox = y => (y <= 318 ? 150 - hw(y) : interp(OUT, y)) - pad - fx(y);
  const ix = y => Math.min(149.5, interp(INN, y) + pad + fx(y) * .3);
  const outer = range(yW, yE, 8).map(y => [r1(ox(y)), y]);
  const inner = range(CR, yE, 8).map(y => [r1(ix(y)), y]).reverse();
  const left = [...outer, ...inner];
  const right = left.slice().reverse().map(([x, y]) => [r1(300 - x), y]);
  return 'M' + [...left, ...right].map(q => q.join(',')).join(' L') + ' Z';
}
function leg(y1, y2, pad = 0) {
  const o = range(y1, y2, 8).map(y => [r1(interp(OUT, y) - pad), y]);
  const i = range(y1, y2, 8).map(y => [r1(Math.min(150, interp(INN, y) + pad)), y]).reverse();
  return 'M' + [...o, ...i].map(q => q.join(',')).join(' L') + ' Z';
}
// left half of an open jacket / coat
function jacketHalf(y2, gap, o = {}) {
  const pad = o.pad ?? 4, flare = o.flare ?? 0, close = o.close ?? 200;
  const xo = y => 150 - hw(y) - pad - (y > 330 ? (y - 330) * flare : 0);
  const L = range(153, y2).map(y => [r1(xo(y)), y]);
  return `M${L[0][0]},153 ` + L.slice(1).map(q => `L${q[0]},${q[1]}`).join(' ') +
    ` L${150 - gap},${y2} L${150 - gap},${close} L138,151 Z`;
}

const ARM_SKIN = 'M98,163 C87,167 82,180 81,198 L73,262 L71,318 L86,320 L90,266 L103,214 L110,178 Z';
const FOOT = 'M127,522 L143,522 Q148,536 146,546 Q138,553 127,549 Q122,538 127,522 Z';
const SLV = {
  cap: 'M97,160 C86,164 81,174 80,190 L105,195 L112,175 Z',
  short: 'M97,159 C84,164 78,180 76,207 L101,213 L112,175 Z',
  elbow: 'M97,159 C84,164 78,180 77,200 L72,250 L94,253 L103,214 L112,175 Z',
  long: 'M97,159 C84,164 78,180 77,200 L69,262 L66,321 L89,323 L92,266 L104,214 L112,175 Z',
  bell: 'M97,159 C84,164 78,180 77,200 L66,262 L52,328 L98,328 L93,266 L104,214 L112,175 Z',
  puff: 'M99,157 C72,154 64,196 81,205 Q97,212 111,199 L113,174 Z',
  puffy: 'M97,156 C78,160 70,180 70,200 L61,262 L59,324 L95,326 L98,266 L109,214 L115,175 Z',
  offpuff: 'M92,176 C72,178 70,210 83,216 Q98,220 108,208 L110,184 Z',
};
const cuff = c => ln('M67,312 L89,314', c, 2, .5);

/* ---------- item registry ---------- */
const ITEMS = [];
function I(slot, id, name, tags, draw, o = {}) {
  ITEMS.push({
    slot, id, name, tags, draw,
    c1: o.c1 || '#ff4fa3', c2: o.c2 || '#ffffff', pat: o.pat || 'solid',
    price: o.price || 0, vip: !!o.vip, noPat: !!o.noPat, two: !!o.two,
    // seasonal event items unlock with that event's tokens; pass items are claimed from the Baddie Pass
    ev: o.ev || (o.brat !== undefined ? 'brat' : undefined), need: o.need ?? o.brat ?? 0,
    pass: o.pass || 0, prem: !!o.prem, fest: !!o.fest, hidesHair: !!o.hidesHair,
  });
}
// straight column skirt that starts below the hips
function straight(yW, yE, flare = 0, pad = 2) {
  const x = r1(hw(yW) + pad);
  return `M${r1(150 - x)},${yW} L${r1(150 + x)},${yW} L${r1(150 + x + flare)},${yE} Q150,${yE + 4} ${r1(150 - x - flare)},${yE} Z`;
}
// skirt with a ragged, tattered hem
function jaggedSkirt(yW, yE, flare, amp = 16) {
  const yh = Math.min(yE, 322);
  const R = range(yW, yh).map(y => [r1(150 + hw(y) + 2), y]);
  const xr = r1(150 + hw(yh) + 2 + flare);
  R.push([xr, yE]);
  const hem = [];
  for (let i = 1; i < 10; i++) hem.push([r1(xr - (2 * xr - 300) * i / 10), i % 2 ? yE - amp : yE + 4]);
  const Lr = R.map(([x, y]) => [r1(300 - x), y]).reverse();
  return 'M' + [[r1(300 - R[0][0]), yW], ...R, ...hem, ...Lr].map(q => q.join(',')).join(' L') + ' Z';
}
const bratText = (x, y, size, col, uid, mirrored) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="'Arial Narrow',Arial,Helvetica,sans-serif" font-size="${size}" fill="${col}" filter="url(#${uid}-blur)" transform="translate(${x} 0) scale(${mirrored ? -.86 : .86} 1) translate(${-x} 0)">brat</text>`;

/* ===== HAIR ===== */
const H = (id, name, tags, draw, o = {}) => I('hair', id, name, tags, draw, { noPat: true, c1: '#5a3825', ...o });
const HB = 'M115,94 Q112,42 150,42 Q188,42 185,94 Z';
const CAP_MID = 'M112,102 Q108,44 150,44 Q192,44 188,102 Q180,66 150,60 Q120,66 112,102 Z';
const CAP_SLICK = 'M114,96 Q111,44 150,42 Q189,44 186,96 Q180,62 150,57 Q120,62 114,96 Z';
const LONG_BACK = 'M113,82 Q110,40 150,40 Q190,40 187,82 L196,256 Q172,266 150,259 Q128,266 104,256 Z';
const SIDE_STRAND = 'M115,88 Q106,160 110,246 L124,240 Q119,160 123,100 Z';

H('long', 'Long & Straight', ['casual', 'elegant', 'romantic'], P => ({
  back: p(LONG_BACK, P.f),
  main: p('M113,104 Q106,44 150,42 Q194,44 187,104 Q184,76 168,63 Q150,80 121,78 Q115,90 113,104 Z', P.f) + both(p(SIDE_STRAND, P.f)) + ln('M160,66 Q140,74 124,86', P.d, 1.2, .6),
}));
H('wavy', 'Beach Waves', ['beach', 'summer', 'romantic', 'cottage'], P => ({
  back: p('M113,82 Q108,40 150,40 Q192,40 187,82 Q202,122 191,162 Q206,204 194,252 Q172,264 150,256 Q128,264 106,252 Q94,204 109,162 Q98,122 113,82 Z', P.f),
  main: p('M112,104 Q108,44 150,44 Q192,44 188,104 Q180,64 150,58 Q120,64 112,104 Z', P.f) + both(p('M114,90 Q104,130 114,165 Q104,205 112,240 L122,232 Q116,200 124,165 Q114,130 124,96 Z', P.f)),
}), { c1: '#e3b04b' });
H('curtain', 'Curtain Bangs', ['y2k', 'casual', 'elegant', 'pop'], P => ({
  back: p(LONG_BACK, P.f),
  main: p('M113,106 Q108,44 150,44 Q192,44 187,106 Q183,76 157,66 L150,72 L143,66 Q117,76 113,106 Z', P.f) + both(p(SIDE_STRAND, P.f)),
}), { c1: '#8b5a2b' });
H('bob', 'Sleek Bob', ['office', 'elegant', 'y2k'], P => ({
  back: p('M109,92 Q104,40 150,40 Q196,40 191,92 L193,148 Q150,156 107,148 Z', P.f),
  main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L186,80 Q150,86 114,80 Z', P.f) + both(p('M113,80 L109,146 L123,146 L121,86 Z', P.f)),
}), { c1: '#111111' });
H('ponytail', 'High Ponytail', ['sporty', 'pop', 'y2k', 'street'], P => ({
  back: p(HB, P.f) + p('M160,46 Q206,36 202,110 Q200,175 180,228 Q194,165 180,108 Q174,70 156,52 Z', P.f) + circ(160, 48, 7, P.c2, OL),
  main: p(CAP_SLICK, P.f),
}), { c1: '#3b2416', c2: '#ff4fa3', two: true });
H('bun', 'Ballerina Bun', ['elegant', 'formal', 'royal', 'office'], P => ({
  back: p(HB, P.f) + circ(150, 36, 20, P.f, OL) + ln('M138,30 Q150,44 162,30', P.d, 1.2, .6),
  main: p(CAP_SLICK, P.f),
}), { c1: '#5a3825' });
H('spacebuns', 'Space Buns', ['pop', 'y2k', 'cute', 'party'], P => ({
  back: p(HB, P.f) + circ(121, 50, 17, P.f, OL) + circ(179, 50, 17, P.f, OL),
  main: p(CAP_MID, P.f) + ln('M150,46 L150,60', P.d, 1.2, .6),
}), { c1: '#ff8fc8' });
H('afro', 'Big Curls', ['pop', 'party', 'casual', 'romantic'], P => ({
  back: `<ellipse cx="150" cy="86" rx="58" ry="60" fill="${P.f}" ${OL}/>` + [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => circ(r1(150 + 54 * Math.cos(a * Math.PI / 180)), r1(86 + 56 * Math.sin(a * Math.PI / 180)), 13, P.f, OL)).join(''),
  main: p('M114,90 Q112,48 150,46 Q188,48 186,90 Q170,64 150,66 Q130,64 114,90 Z', P.f) + [122, 134, 146, 158, 170, 180].map((x, i) => circ(x, 64 + (i % 2) * 4, 7, P.f)).join(''),
}), { c1: '#3b2416' });
H('braids', 'Twin Braids', ['cottage', 'cute', 'western', 'casual'], P => ({
  back: p(HB, P.f),
  main: p(CAP_MID, P.f) + both([0, 1, 2, 3, 4, 5, 6].map(i => `<ellipse cx="${118 - i}" cy="${118 + i * 20}" rx="8.5" ry="11.5" fill="${P.f}" ${OL}/>`).join('') + circ(112, 254, 5, P.c2, OL)),
}), { c1: '#b5562b', c2: '#ff8fc8', two: true });
H('pixie', 'Pixie Cut', ['edgy', 'office', 'street', 'futuristic'], P => ({
  back: p('M114,100 Q111,44 150,43 Q189,44 186,100 L182,118 L118,118 Z', P.f),
  main: p('M112,100 Q106,40 150,40 Q196,40 188,98 Q184,72 172,66 L163,76 L152,64 L141,76 L130,66 Q118,78 112,100 Z', P.f),
}), { c1: '#f0f0f0' });
H('pigtails', 'Pigtails', ['cute', 'y2k', 'pop'], P => ({
  back: p(HB, P.f) + both(p('M120,70 Q84,82 90,150 Q94,200 84,236 Q116,196 110,130 Q110,100 124,84 Z', P.f)),
  main: p(CAP_MID, P.f) + both(circ(119, 79, 5, P.c2, OL)),
}), { c1: '#e3b04b', c2: '#ff4fa3', two: true });
H('updo', 'Glam Updo', ['formal', 'royal', 'elegant', 'romantic'], P => ({
  back: p(HB, P.f) + `<ellipse cx="150" cy="38" rx="27" ry="18" fill="${P.f}" ${OL}/>` + ln('M130,36 Q150,22 170,36', P.d, 1.2, .6),
  main: p(CAP_SLICK, P.f) + both(ln('M117,92 Q112,112 118,130', P.f, 2.2, 1)),
}), { c1: '#3b2416' });
H('wolfcut', 'Wolf Cut', ['rock', 'edgy', 'street', 'goth'], P => ({
  back: p('M108,90 Q102,40 150,38 Q198,40 192,90 L198,150 L190,170 L194,200 L178,190 L172,210 L160,196 L150,210 L140,196 L128,210 L122,190 L106,200 L110,170 L102,150 Z', P.f),
  main: p('M112,104 Q106,42 150,40 Q194,42 188,104 L184,86 L176,78 L168,90 L160,76 L150,88 L140,76 L132,90 L124,78 L116,86 Z', P.f),
}), { c1: '#2a1438' });
H('bratbob', 'messy brat bob', ['brat', 'edgy', 'party', 'y2k'], P => ({
  back: p('M108,92 Q103,40 150,39 Q197,40 192,92 L195,140 L187,152 L180,141 L171,154 L161,143 L150,152 L139,143 L129,154 L120,141 L113,152 L105,140 Z', P.f),
  main: p('M112,100 Q107,43 150,43 Q193,43 188,100 L186,84 L178,76 L171,86 L162,75 L154,87 L146,76 L137,86 L129,75 L121,85 L114,80 Z', P.f) + both(p('M112,84 L106,138 L114,150 L119,138 L122,90 Z', P.f)),
}), { c1: '#111111', brat: 4 });

/* ===== FACE ===== */
const EYE = {
  'e-round': { w: 'M129,98 A7,8 0 1,0 143,98 A7,8 0 1,0 129,98 Z', lid: 'M128,95 Q136,86 144,94 M129,94 L125,91' },
  'e-almond': { w: 'M127,99 Q136,89 145,98 Q136,105 127,99 Z', lid: 'M126,99 Q136,88 146,97 M127,98 L123,95' },
  'e-cat': { w: 'M145,100 Q137,90 127,96 Q134,105 145,100 Z', lid: 'M146,100 Q137,89 126,95 L120,90' },
  'e-sleepy': { w: 'M128,99 Q136,95 144,99 Q136,105 128,99 Z', lid: 'M127,99 Q136,93 145,99', iy: 101 },
  'e-sparkle': { w: 'M127,98 A9,10.5 0 1,0 145,98 A9,10.5 0 1,0 127,98 Z', lid: 'M126,93 Q136,83 146,92 M127,92 L122,89', ir: 7, lw: 2.8 },
  'e-doe': { w: 'M128,99 A8,9 0 1,0 144,99 A8,9 0 1,0 128,99 Z', lid: 'M127,95 Q136,85 145,94 M128,94 L124,90', ir: 5.6 },
};
function eyeMarkup(P, e, onlyLeft) {
  const cid = P.uid + '-eye', iy = e.iy || 99, ir = e.ir || 4.6;
  // iris gradient, upper-lid shadow inside the eye, and a soft crease above the lid
  const one = `<path d="${e.w}" fill="#fff"/><g clip-path="url(#${cid})"><circle cx="136" cy="${iy}" r="${ir}" fill="url(#${cid}-iris)" stroke="${shade(P.c1, -45)}" stroke-width=".9"/><circle cx="136" cy="${iy}" r="${r1(ir * .48)}" fill="#140a10"/><circle cx="134.2" cy="${iy - 2.2}" r="${r1(ir * .32)}" fill="#fff"/>${ir > 6 ? `<circle cx="138.5" cy="${iy + 2.5}" r="1.3" fill="#fff"/>` : ''}<path d="${e.lid}" fill="none" stroke="#5a2a3a" stroke-opacity=".25" stroke-width="4" transform="translate(0 1.6)"/></g>` +
    `<path d="${e.lid}" fill="none" stroke="#1a1018" stroke-width="${e.lw || 2.2}" stroke-linecap="round"/><path d="${e.lid}" fill="none" stroke="#7a3a3a" stroke-opacity=".28" stroke-width="1" transform="translate(0 -4.2)"/>`;
  return `<clipPath id="${cid}"><path d="${e.w}"/></clipPath><radialGradient id="${cid}-iris" cx=".5" cy=".55" r=".55"><stop offset=".25" stop-color="${shade(P.c1, 35)}"/><stop offset=".7" stop-color="${P.c1}"/><stop offset="1" stop-color="${shade(P.c1, -40)}"/></radialGradient>` + (onlyLeft ? one : both(one));
}
const EYE_NAMES = { 'e-round': ['Round', ['cute']], 'e-almond': ['Almond', ['elegant', 'romantic']], 'e-cat': ['Cat Eye', ['edgy', 'elegant', 'goth']], 'e-sleepy': ['Sleepy', ['cozy', 'casual']], 'e-sparkle': ['Sparkle', ['cute', 'pop', 'fairy']], 'e-doe': ['Doe', ['cute', 'romantic', 'cottage']] };
for (const [id, [name, tags]] of Object.entries(EYE_NAMES)) I('eyes', id, name, tags, P => eyeMarkup(P, EYE[id]), { noPat: true, c1: '#6b4226' });
I('eyes', 'e-wink', 'Wink', ['pop', 'cute', 'party'], P => eyeMarkup(P, EYE['e-round'], true) + mir(ln('M128,99 Q136,104 144,99 M129,99 L125,96', '#1a1018', 2.2, 1)), { noPat: true, c1: '#6b4226' });

const BROWS = { 'b-natural': ['Natural', 'M127,86 Q136,80 145,83', 2.6], 'b-arched': ['Arched', 'M126,88 Q136,76 146,84', 2.6], 'b-straight': ['Straight', 'M127,84 L146,83', 2.8], 'b-thin': ['Thin', 'M126,88 Q136,77 146,84', 1.5], 'b-bold': ['Bold', 'M127,86 Q136,80 145,83', 4.4], 'b-worried': ['Soft', 'M127,83 Q137,82 145,88', 2.6] };
for (const [id, [name, d, w]] of Object.entries(BROWS)) I('brows', id, name, [], P => both(ln(d, P.c1, w, 1)), { noPat: true, c1: '#3b2416' });

const LIPS = {
  'l-smile': ['Smile', P => p('M141,119 Q150,128 159,119 Q150,122 141,119 Z', P.c1)],
  'l-pout': ['Pout', P => p('M141,121 Q145,116 150,118 Q155,116 159,121 Q150,128 141,121 Z', P.c1) + ln('M143,121 Q150,122 157,121', '#2b1a24', 1, .4)],
  'l-smirk': ['Smirk', P => p('M142,122 Q152,125 160,116 Q154,128 142,122 Z', P.c1)],
  'l-grin': ['Grin', P => p('M139,118 Q150,132 161,118 Q150,121 139,118 Z', P.c1) + p('M142,119.6 Q150,125 158,119.6 Q150,121.5 142,119.6 Z', '#fff', 'stroke-width=".6"')],
  'l-kiss': ['Kiss', P => `<ellipse cx="150" cy="121" rx="4.6" ry="5" fill="${P.c1}" ${OL}/>` + circ(150, 121, 1.6, shade(P.c1, -35))],
  'l-neutral': ['Neutral', P => p('M143,121 Q150,119 157,121 Q150,125 143,121 Z', P.c1)],
};
for (const [id, [name, draw]] of Object.entries(LIPS)) I('lips', id, name, id === 'l-pout' ? ['party', 'elegant'] : [], draw, { noPat: true, c1: '#e07a8a' });

/* ===== MAKEUP ===== */
const MK = (slot, id, name, tags, draw, o = {}) => I(slot, id, name, tags, draw, { noPat: true, ...o });
MK('shadow', 's-soft', 'Soft Shimmer', ['romantic', 'cute', 'elegant'], P => both(`<ellipse cx="136" cy="93" rx="11" ry="6.5" fill="${P.c1}" opacity=".5"/>`), { c1: '#ff8fc8' });
MK('shadow', 's-smoky', 'Smoky Eye', ['goth', 'rock', 'party', 'edgy'], P => both(`<ellipse cx="136" cy="96" rx="13" ry="10" fill="${P.c1}" opacity=".55"/>`), { c1: '#2a1438' });
MK('shadow', 's-glitter', 'Glitter Lids', ['party', 'pop', 'fairy', 'y2k'], P => both(`<ellipse cx="136" cy="93" rx="11" ry="6.5" fill="${P.c1}" opacity=".6"/><path d="${sparkle(129, 90, 2.4)}" fill="#fff"/><path d="${sparkle(142, 89, 1.8)}" fill="#fff"/><circle cx="136" cy="88" r=".9" fill="#fff"/>`), { c1: '#bf5af2' });
MK('shadow', 's-liner', 'Winged Liner', ['edgy', 'y2k', 'elegant', 'office'], P => both(p('M146,97 Q136,89 125,94 L117,88 L124,98 Z', P.c1, 'stroke-width=".6"')), { c1: '#111111' });
MK('shadow', 's-cutcrease', 'Cut Crease', ['formal', 'elegant', 'royal'], P => both(`<ellipse cx="136" cy="92" rx="11" ry="6" fill="${shade(P.c1, 40)}" opacity=".6"/>` + ln('M125,94 Q136,83 147,91', P.c1, 2.6, .9)), { c1: '#7a1f3d' });
MK('shadow', 's-graphic', 'Graphic Pop', ['pop', 'futuristic', 'party'], P => both(ln('M124,92 Q136,80 150,88', P.c1, 2.4, 1) + circ(152, 90, 1.6, P.c1)), { c1: '#2ec4b6' });
MK('shadow', 's-messy', 'messy smudged liner', ['brat', 'edgy', 'party', 'rock'], P => both(`<ellipse cx="136" cy="99" rx="12" ry="9" fill="${P.c1}" opacity=".45" filter="url(#${P.uid}-soft)"/>` + ln('M127,96 Q136,90 146,95', P.c1, 2.4, .8)), { c1: '#111111', brat: 8 });

MK('blush', 'bl-soft', 'Soft Blush', ['cute', 'romantic', 'cottage'], P => both(`<ellipse cx="128" cy="113" rx="9" ry="5.5" fill="${P.c1}" opacity=".45"/>`), { c1: '#ff8fa3' });
MK('blush', 'bl-heart', 'Heart Cheeks', ['cute', 'pop', 'romantic'], P => both(`<path d="${heart(128, 113, 4.5)}" fill="${P.c1}" opacity=".7"/>`), { c1: '#ff4fa3' });
MK('blush', 'bl-sun', 'Sunkissed', ['summer', 'beach', 'casual'], P => `<ellipse cx="150" cy="110" rx="30" ry="6" fill="${P.c1}" opacity=".35"/>`, { c1: '#ff7a59' });
MK('blush', 'bl-rosy', 'Frosty Rosy', ['winter', 'cozy'], P => both(`<ellipse cx="127" cy="113" rx="11" ry="7" fill="${P.c1}" opacity=".5"/>` + circ(124, 111, 1.4, '#fff', 'opacity=".8"')), { c1: '#e0245e' });

MK('facedeco', 'fd-freckles', 'Freckles', ['cottage', 'summer', 'casual'], () => both([[126, 108], [131, 111], [124, 113], [134, 107], [129, 115], [137, 112]].map(([x, y]) => circ(x, y, .9, '#8b5a2b', 'opacity=".7"')).join('')));
MK('facedeco', 'fd-stars', 'Star Stickers', ['pop', 'party', 'y2k'], P => both(`<path d="${star(121, 95, 3.8)}" fill="${P.c1}"/><path d="${star(127, 112, 2.2)}" fill="${P.c1}"/>`), { c1: '#ffd60a' });
MK('facedeco', 'fd-hearts', 'Heart Stickers', ['cute', 'romantic', 'pop'], P => both(`<path d="${heart(124, 112, 2.6)}" fill="${P.c1}"/>`), { c1: '#ff4fa3' });
MK('facedeco', 'fd-tears', 'Glitter Tears', ['fairy', 'party', 'pop'], P => both(`<path d="M136,108 Q133,114 136,117 Q139,114 136,108 Z" fill="${P.c1}" opacity=".85"/><path d="${sparkle(131, 118, 1.8)}" fill="#fff"/>`), { c1: '#9ad7ff' });
MK('facedeco', 'fd-gems', 'Face Gems', ['party', 'futuristic', 'pop', 'fairy'], P => both([[126, 108], [131, 110], [137, 111]].map(([x, y]) => circ(x, y, 1.6, P.c1, 'stroke="#fff" stroke-width=".6"')).join('')), { c1: '#5ab4ff' });
MK('facedeco', 'fd-mole', 'Beauty Mark', ['elegant', 'formal', 'royal'], () => circ(161, 116, 1.4, '#3b2416'));
MK('facedeco', 'fd-bandaid', 'Band-Aid', ['street', 'edgy', 'sporty', 'cute'], P => `<rect x="141" y="104" width="18" height="7" rx="3" fill="${P.c1}" transform="rotate(-12 150 107)" ${OL}/>`, { c1: '#f3c7a0' });
MK('facedeco', 'fd-bat', 'Bat Sticker', ['spooky', 'goth'], P => p('M118,112 Q122,106 126,110 Q128,104 130,110 Q134,106 138,112 Q132,110 128,116 Q124,110 118,112 Z', P.c1, 'stroke-width=".6"'), { c1: '#111111' });

/* ===== TOPS ===== */
const Tp = (id, name, tags, draw, o) => I('top', id, name, tags, draw, o);
Tp('babytee', 'Baby Tee', ['y2k', 'casual', 'cute'], P => ({ main: p(torso(160, 252, { neck: 'crew' }), P.f), arm: p(SLV.cap, P.f) }), { c1: '#ffffff' });
Tp('hearttee', 'Heart Tee', ['y2k', 'cute', 'romantic', 'casual'], P => ({ main: p(torso(160, 252, { neck: 'crew' }), P.f) + p(heart(150, 208, 11), P.c2), arm: p(SLV.cap, P.f) }), { c1: '#ffffff', c2: '#e0245e', two: true });
Tp('croptop', 'Crop Top', ['y2k', 'summer', 'casual', 'party'], P => ({ main: p(torso(162, 234, { neck: 'scoop' }), P.f), arm: p(SLV.short, P.f) }), { c1: '#ff8fc8' });
Tp('tank', 'Tank Top', ['casual', 'summer', 'sporty', 'street'], P => ({ main: p(torso(180, 272, { neck: 'scoop' }), P.f) + both(p('M119,158 L127,158 L129,184 L118,184 Z', P.f)) }), { c1: '#ffffff' });
Tp('tube', 'Tube Top', ['summer', 'party', 'y2k', 'beach'], P => ({ main: p(torso(198, 250), P.f) + ln('M106,212 Q150,219 194,212') + ln('M108,230 Q150,236 192,230') }), { c1: '#ff9500' });
Tp('corset', 'Corset', ['romantic', 'goth', 'royal', 'party', 'elegant'], P => ({ main: p(torso(194, 294, { neck: 'sweet', hem: 10 }), P.f) + ln('M150,200 L150,300', P.c2, 1.6, .9) + ln('M145,206 L155,214 L145,222 L155,230 L145,238 L155,246 L145,254 L155,262 L145,270 L155,278 L145,286', P.c2, 1.2, .9) + both(ln('M126,202 L132,292')) }), { c1: '#7a1f3d', c2: '#ffffff', two: true });
Tp('blouse', 'Ruffle Blouse', ['office', 'romantic', 'elegant', 'cottage'], P => ({ main: p(torso(160, 302, { neck: 'v', hem: 4 }), P.f) + ln('M137,161 L150,200 L163,161', P.d, 3, .5), arm: p(SLV.bell, P.f) }), { c1: '#fff3f8' });
Tp('hoodie', 'Cozy Hoodie', ['cozy', 'street', 'casual', 'sporty'], P => ({
  back: p('M116,152 Q150,124 184,152 L178,172 L122,172 Z', P.d),
  main: p(torso(156, 338, { neck: 'crew', pad: 6, hem: 2 }), P.f) + p('M120,284 L180,284 L186,322 L114,322 Z', P.f) + ln('M143,166 L141,206', P.c2, 2, .9) + ln('M157,166 L159,206', P.c2, 2, .9),
  arm: p(SLV.puffy, P.f) + ln('M60,314 L95,316', P.d, 2, .6),
}), { c1: '#c9a7ff', c2: '#ffffff' });
Tp('sweater', 'Knit Sweater', ['cozy', 'winter', 'cottage', 'casual'], P => ({ main: p(torso(158, 316, { neck: 'crew', pad: 4 }), P.f) + ln('M104,306 Q150,310 196,306', P.d, 2, .5) + ln('M138,160 Q150,172 162,160', P.d, 2, .5), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#f5e6c8' });
Tp('bikini', 'Bikini Top', ['beach', 'summer'], P => ({ main: both(p('M148,224 Q138,196 127,199 Q118,214 125,228 Z', P.f) + ln('M130,200 L140,157', P.c1, 1.6, 1)) + ln('M106,226 L194,226', P.c1, 1.8, 1) }), { c1: '#ff4fa3', pat: 'polka', c2: '#ffffff' });
Tp('shirt', 'Button-Up Shirt', ['office', 'elegant', 'casual', 'western'], P => ({ main: p(torso(158, 320, { neck: 'v', pad: 3, hem: 3 }), P.f) + both(p('M138,155 L150,184 L128,178 Z', P.f)) + [204, 228, 252, 276, 300].map(y => circ(150, y, 2.2, P.d)).join(''), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#ffffff' });
Tp('offshoulder', 'Off-Shoulder Top', ['romantic', 'summer', 'party', 'cottage'], P => ({ main: p(torso(186, 258), P.f) + p(torso(180, 200, { pad: 4 }), P.f), arm: p(SLV.offpuff, P.f) }), { c1: '#ffffff' });
Tp('meshtop', 'Mesh Top', ['goth', 'rock', 'party', 'edgy'], P => ({ main: p(torso(158, 300, { neck: 'turtle' }), P.f), arm: p(SLV.long, P.f) }), { c1: '#111111', c2: '#111111', pat: 'mesh' });
Tp('halter', 'Halter Top', ['party', 'summer', 'y2k'], P => ({ main: p(torso(190, 264, { neck: 'v' }), P.f) + both(p('M126,192 L138,140 L144,142 L136,194 Z', P.f)) }), { c1: '#d4af37' });
Tp('jersey', 'Sports Jersey', ['sporty', 'street'], P => ({ main: p(torso(160, 330, { neck: 'v', pad: 6 }), P.f) + `<text x="150" y="262" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="34" fill="${P.c2}">07</text>`, arm: p(SLV.short, P.f) + ln('M78,200 L101,206', P.c2, 3, 1) }), { c1: '#0a84ff', c2: '#ffffff', two: true });
Tp('ruffletop', 'Fairy Ruffle Top', ['fairy', 'cottage', 'cute', 'romantic'], P => ({ main: p(torso(178, 250, { neck: 'sweet' }), P.f) + range(118, 182, 8).map(x => circ(x, 253, 5, P.f, OL)).join(''), arm: p(SLV.puff, P.f) }), { c1: '#b8f2c9' });
Tp('sequintop', 'Sequin Top', ['party', 'pop', 'formal'], P => ({ main: p(torso(188, 264), P.f) + both(ln('M124,190 L128,160', P.c1, 2, 1)) }), { c1: '#c0c0c0', c2: '#ffffff', pat: 'sparkle' });
Tp('chrometop', 'Chrome Turtleneck', ['futuristic', 'edgy', 'party'], P => ({ main: p(torso(158, 300, { neck: 'turtle', pad: 3 }), P.f) + ln('M118,190 Q128,240 122,290', '#fff', 3, .5), arm: p(SLV.long, P.f) + ln('M82,200 L74,300', '#fff', 2, .5) }), { c1: '#a8b3c2' });
Tp('brattank', 'brat tank', ['brat', 'summer', 'party', 'street'], P => ({ main: p(torso(180, 272, { neck: 'scoop' }), P.f) + both(p('M119,158 L127,158 L129,184 L118,184 Z', P.f)) }), { c1: BRAT, brat: 0 });
Tp('brattee', 'brat baby tee', ['brat', 'y2k', 'street', 'party'], P => ({ main: p(torso(160, 252, { neck: 'crew' }), P.f) + bratText(150, 218, 23, P.c2, P.uid), arm: p(SLV.cap, P.f) }), { c1: BRAT, c2: '#111111', two: true, brat: 1 });
Tp('bratmesh', 'club mesh top', ['brat', 'party', 'edgy', 'rock'], P => ({ main: p(torso(158, 300, { neck: 'turtle' }), P.f), arm: p(SLV.long, P.f) }), { c1: BRAT, c2: BRAT, pat: 'mesh', brat: 10 });

/* ===== BOTTOMS ===== */
const B = (id, name, tags, draw, o) => I('bottom', id, name, tags, draw, o);
B('mini', 'Mini Skirt', ['y2k', 'party', 'summer', 'pop'], P => p(skirt(264, 350, 8), P.f), { c1: '#111111' });
B('pleated', 'Pleated Skirt', ['cute', 'y2k', 'office', 'sporty'], P => p(skirt(264, 372, 20), P.f) + [-30, -15, 0, 15, 30].map(x => ln(`M${150 + x * .6},268 L${150 + x * 1.25},370`)).join(''), { c1: '#1d3557', pat: 'plaid', c2: '#e0245e' });
B('maxiskirt', 'Maxi Skirt', ['cottage', 'elegant', 'beach', 'romantic'], P => p(skirt(264, 524, 34), P.f), { c1: '#f5e6c8' });
B('tutu', 'Tulle Tutu', ['fairy', 'cute', 'pop'], P => p(skirt(258, 352, 42, { hem: 2 }), P.f, 'fill-opacity=".7"') + p(skirt(258, 336, 30, { hem: 2 }), P.f, 'fill-opacity=".85"'), { c1: '#ff8fc8' });
B('ruffleskirt', 'Tiered Skirt', ['cottage', 'romantic', 'fairy'], P => p(skirt(264, 440, 28), P.f) + ln('M108,340 Q150,350 192,340') + ln('M100,392 Q150,404 200,392'), { c1: '#ffffff', pat: 'flowers', c2: '#ff8fc8' });
B('pencil', 'Pencil Skirt', ['office', 'elegant', 'formal'], P => p(skirt(262, 420, -6), P.f) + ln('M150,400 L150,420'), { c1: '#111111' });
B('jeans', 'Low-Rise Jeans', ['y2k', 'casual', 'street'], P => p(pants(290, 532, { flare: 8 }), P.f) + both(ln('M138,300 Q132,312 120,316', P.c2, 1.4, .8)), { c1: '#6b8fc7', c2: '#33496e', pat: 'denim' });
B('cargo', 'Cargo Pants', ['street', 'sporty', 'edgy'], P => p(pants(268, 532, { pad: 5 }), P.f) + both(p('M104,380 L120,380 L121,414 L105,414 Z', P.f)), { c1: '#8a8a5c' });
B('shorts', 'Denim Shorts', ['summer', 'beach', 'casual', 'western'], P => p(pants(266, 366, { pad: 3 }), P.f), { c1: '#8fb1e0', c2: '#4d6b99', pat: 'denim' });
B('leggings', 'Leggings', ['sporty', 'casual', 'cozy'], P => p(pants(268, 528, { pad: .5 }), P.f), { c1: '#111111' });
B('flares', 'Flare Pants', ['y2k', 'pop', 'office'], P => p(pants(266, 542, { flare: 18 }), P.f), { c1: '#ffffff' });
B('bikeshorts', 'Bike Shorts', ['sporty', 'street', 'summer'], P => p(pants(268, 398, { pad: .5 }), P.f), { c1: '#111111' });
B('leatherpants', 'Leather Pants', ['rock', 'edgy', 'goth', 'party'], P => p(pants(266, 532, { pad: 1 }), P.f) + both(ln('M114,340 Q118,420 124,500', '#fff', 2, .35)), { c1: '#111111' });
B('trackpants', 'Track Pants', ['sporty', 'street'], P => p(pants(266, 534, { pad: 4 }), P.f) + both(ln('M103,300 L123,532', P.c2, 4, 1)), { c1: '#111111', c2: '#ffffff', two: true });
B('pjpants', 'PJ Pants', ['cozy', 'cute'], P => p(pants(266, 532, { pad: 6 }), P.f), { c1: '#9ad7ff', pat: 'hearts', c2: '#ffffff' });
B('bratmini', 'lime micro mini', ['brat', 'party', 'summer', 'y2k'], P => p(skirt(288, 342, 5), P.f), { c1: BRAT, brat: 3 });
B('brattrack', 'brat track pants', ['brat', 'sporty', 'street'], P => p(pants(266, 534, { pad: 4 }), P.f) + both(ln('M103,300 L123,532', P.c2, 4, 1)), { c1: '#111111', c2: BRAT, two: true, brat: 6 });

/* ===== DRESSES ===== */
const Dr = (id, name, tags, draw, o) => I('dress', id, name, tags, draw, o);
const straps = c => both(ln('M127,188 L131,160', c, 1.8, 1));
Dr('slip', 'Slip Dress', ['party', 'elegant', 'romantic', 'y2k'], P => ({ main: p(torso(186, 264, { neck: 'v' }), P.f) + p(skirt(262, 404, 14), P.f) + straps(P.c1) }), { c1: '#e8c9ff' });
Dr('bodycon', 'Bodycon Mini', ['party', 'pop', 'y2k'], P => ({ main: p(torso(186, 350, { hem: 4 }), P.f) + straps(P.c1) }), { c1: '#e0245e' });
Dr('sundress', 'Sundress', ['summer', 'cottage', 'beach', 'casual', 'cute'], P => ({ main: p(torso(184, 262, { neck: 'sweet' }), P.f) + p(skirt(262, 410, 26), P.f) + straps(P.c1) }), { c1: '#fff3b0', pat: 'flowers', c2: '#ff8fc8' });
Dr('babydoll', 'Babydoll Dress', ['cute', 'y2k', 'cottage'], P => ({ main: p(torso(162, 214, { neck: 'scoop' }), P.f) + p(`M${r1(150 - hw(212) - 2)},212 L${r1(150 + hw(212) + 2)},212 L${r1(150 + hw(212) + 32)},340 Q150,348 ${r1(150 - hw(212) - 32)},340 Z`, P.f), arm: p(SLV.puff, P.f) }), { c1: '#ffc8e8' });
Dr('tennis', 'Tennis Dress', ['sporty', 'cute', 'elegant'], P => ({ main: p(torso(170, 262, { neck: 'v' }), P.f) + p(skirt(262, 346, 18), P.f) + [-24, -8, 8, 24].map(x => ln(`M${150 + x * .7},266 L${150 + x * 1.3},346`)).join(''), arm: p(SLV.cap, P.f) }), { c1: '#ffffff' });
Dr('maxifloral', 'Floral Maxi', ['cottage', 'romantic', 'summer', 'beach'], P => ({ main: p(torso(166, 264, { neck: 'v' }), P.f) + p(skirt(264, 530, 36), P.f), arm: p(SLV.short, P.f) }), { c1: '#b8f2c9', pat: 'flowers', c2: '#ffffff' });
Dr('witch', 'Witchy Gown', ['goth', 'spooky', 'fairy'], P => ({ main: p(torso(160, 264, { neck: 'v' }), P.f) + p(skirt(264, 548, 46, { hem: 4 }), P.f), arm: p(SLV.bell, P.f) }), { c1: '#2a1438' });
Dr('bubble', 'Bubble Dress', ['y2k', 'pop', 'party', 'cute'], P => ({ main: p(torso(182, 282), P.f) + p(skirt(280, 342, 24, { hem: -8 }), P.f) + straps(P.c1) }), { c1: '#ff4fa3' });
Dr('nightgown', 'Nightgown', ['cozy', 'cute', 'romantic'], P => ({ main: p(torso(180, 264, { neck: 'scoop' }), P.f) + p(skirt(264, 440, 20), P.f), arm: p(SLV.puff, P.f) }), { c1: '#ffffff', pat: 'hearts', c2: '#ffc8e8' });
Dr('jumpsuit', 'Space Jumpsuit', ['futuristic', 'sporty', 'edgy'], P => ({ main: p(pants(266, 532, { pad: 3 }), P.f) + p(torso(158, 300, { neck: 'turtle', pad: 3 }), P.f) + ln('M150,130 L150,330', P.d, 2, .7), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#c0c0c0', price: 350 });
Dr('column', 'Column Gown', ['formal', 'elegant', 'royal'], P => ({ main: p(torso(184, 332), P.f) + p(straight(330, 552, 14), P.f) + p('M160,184 L170,158 L178,160 L172,186 Z', P.f) }), { c1: '#111111', price: 600 });
Dr('ballgown', 'Ball Gown', ['royal', 'formal', 'elegant', 'romantic'], P => ({ main: p(torso(190, 268, { neck: 'sweet' }), P.f) + p(skirt(266, 552, 80, { hem: 8 }), P.f) + ln('M120,330 Q118,440 96,540', P.d, 1.4, .4) + ln('M180,330 Q182,440 204,540', P.d, 1.4, .4) }), { c1: '#5e5ce6', vip: true });
Dr('mermaid', 'Mermaid Gown', ['formal', 'elegant', 'party', 'royal'], P => ({ main: p(torso(186, 420, { neck: 'sweet', pad: 1 }), P.f) + p(`M${r1(150 - hw(410) - 1)},410 L${r1(150 + hw(410) + 1)},410 L240,552 Q150,562 60,552 Z`, P.f) }), { c1: '#c0c0c0', pat: 'sparkle', c2: '#ffffff', price: 900 });
Dr('bratslip', 'brat slip dress', ['brat', 'party', 'elegant', 'summer'], P => ({ main: p(torso(186, 264, { neck: 'v' }), P.f) + p(skirt(262, 404, 14), P.f) + straps(P.c1) + ln('M118,280 Q130,340 122,396', '#fff', 2, .35) }), { c1: BRAT, brat: 12 });
Dr('partygirl', 'party girl mini', ['brat', 'party', 'pop', 'y2k'], P => ({ main: p(torso(186, 344, { hem: 4 }), P.f) + straps(P.c1) }), { c1: BRAT, c2: '#ffffff', pat: 'sparkle', brat: 27 });

/* ===== OUTERWEAR ===== */
const O = (id, name, tags, draw, o) => I('outer', id, name, tags, draw, o);
O('leatherjacket', 'Leather Jacket', ['rock', 'edgy', 'street', 'goth'], P => ({ main: both(p(jacketHalf(292, 8), P.f) + p('M138,156 L143,206 L122,190 Z', P.d)), arm: p(SLV.long, P.f) + cuff('#888') }), { c1: '#1a1a1a' });
O('blazer', 'Blazer', ['office', 'elegant', 'formal'], P => ({ main: both(p(jacketHalf(334, 10, { close: 250 }), P.f) + p('M138,156 L140,240 L120,196 Z', P.d)) + circ(146, 272, 2.6, P.d), arm: p(SLV.long, P.f) }), { c1: '#1d3557' });
O('puffer', 'Puffer Jacket', ['winter', 'street', 'sporty'], P => ({ main: both(p(jacketHalf(286, 2, { pad: 9, close: 170 }), P.f) + [192, 216, 240, 264].map(y => ln(`M${r1(150 - hw(y) - 9)},${y} L148,${y}`)).join('')), arm: p(SLV.puffy, P.f) + ln('M66,240 L100,240') + ln('M61,290 L96,290') }), { c1: '#ffffff' });
O('denimjacket', 'Denim Jacket', ['casual', 'western', 'y2k', 'street'], P => ({ main: both(p(jacketHalf(296, 8), P.f) + p('M112,196 L134,196 L134,214 L112,214 Z', P.f)), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#6b8fc7', c2: '#33496e', pat: 'denim' });
O('cardigan', 'Cardigan', ['cozy', 'cottage', 'casual', 'office'], P => ({ main: both(p(jacketHalf(304, 20, { pad: 3, close: 300 }), P.f)) + [210, 240, 270].map(y => circ(128, y, 2.4, P.d)).join(''), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#ffc8e8' });
O('bolero', 'Shrug Bolero', ['elegant', 'fairy', 'romantic'], P => ({ main: both(p(jacketHalf(208, 30, { pad: 3, close: 208 }), P.f)), arm: p(SLV.long, P.f) }), { c1: '#ffffff', c2: '#ffffff', pat: 'mesh' });
O('varsity', 'Varsity Jacket', ['sporty', 'street', 'y2k'], P => ({ main: both(p(jacketHalf(292, 6, { pad: 6 }), P.f)) + `<text x="118" y="214" font-family="Georgia,serif" font-weight="700" font-size="22" fill="${P.c2}">D</text>`, arm: p(SLV.puffy, P.c2) + ln('M60,312 L96,314', P.c1, 5, 1) }), { c1: '#e0245e', c2: '#ffffff', two: true, price: 300 });
O('trench', 'Trench Coat', ['office', 'elegant', 'winter'], P => ({ main: both(p(jacketHalf(452, 6, { pad: 4, flare: .1, close: 240 }), P.f) + p(`M${r1(150 - hw(268) - 5)},266 L150,266 L150,278 L${r1(150 - hw(278) - 5)},278 Z`, P.d)), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#c8a878', price: 400 });
O('furcoat', 'Faux Fur Coat', ['winter', 'elegant', 'royal', 'party'], P => ({ main: both(p(jacketHalf(446, 16, { pad: 7, flare: .14 }), P.f) + [[138, 160], [130, 170], [124, 184], [132, 182]].map(([x, y]) => circ(x, y, 9, P.l, OL)).join('')), arm: p(SLV.puffy, P.f) + `<ellipse cx="77" cy="322" rx="20" ry="8" fill="${P.l}" ${OL}/>` }), { c1: '#f5e6c8', vip: true });
O('bratbomber', 'brat bomber', ['brat', 'street', 'party', 'edgy'], P => ({ main: both(p(jacketHalf(290, 4, { pad: 7 }), P.f) + ln(`M${r1(150 - hw(282) - 7)},282 L146,282`, '#111', 3, .6)), arm: p(SLV.puffy, P.f) + ln('M60,316 L95,318', '#111', 4, .6) }), { c1: BRAT, brat: 9 });

/* ===== SHOES (left foot, mirrored) ===== */
const S = (id, name, tags, draw, o) => I('shoes', id, name, tags, P => both(draw(P)), o);
const HEEL = 'M127,516 L144,516 L147,534 L142,558 L130,558 L125,534 Z';
const PLATFORM = P => p('M120,452 L149,452 L150,542 L120,542 Z', P.f) + p('M115,540 L154,540 L154,564 L115,564 Z', P.c2 === '#ffffff' ? P.d : P.c2) + `<rect x="122" y="470" width="26" height="5" fill="#c0c0c0" ${OL}/><rect x="122" y="500" width="26" height="5" fill="#c0c0c0" ${OL}/>`;
S('sneakers', 'Sneakers', ['sporty', 'street', 'casual'], P => p('M120,520 L146,520 L149,538 Q151,552 135,552 Q117,552 119,538 Z', P.f) + p('M117,543 Q118,555 135,555 Q152,555 151,543 Q135,548 117,543 Z', '#ffffff') + ln('M126,527 L142,527 M125,533 L143,533', P.c2, 1.6, 1), { c1: '#ffffff', c2: '#ff4fa3', two: true });
S('heels', 'Stiletto Heels', ['formal', 'party', 'elegant', 'office'], P => p(HEEL, P.f) + ln('M127,521 L144,521', P.d, 2, .9), { c1: '#e0245e' });
S('platforms', 'Platform Boots', ['y2k', 'goth', 'rock', 'edgy', 'party'], PLATFORM, { c1: '#111111' });
S('kneeboots', 'Knee Boots', ['elegant', 'winter', 'party', 'western'], P => p('M117,410 L149,410 L147,544 Q147,556 134,556 Q121,556 123,544 Z', P.f) + ln('M118,418 L148,418', P.d, 2, .7), { c1: '#5b3a29' });
S('flats', 'Ballet Flats', ['cute', 'cottage', 'office', 'elegant'], P => p('M124,530 L146,530 Q150,546 141,552 Q128,554 123,546 Z', P.f) + circ(135, 533, 2.6, P.d), { c1: '#ffc8e8' });
S('maryjanes', 'Mary Janes', ['cute', 'cottage', 'y2k', 'goth'], P => p('M124,528 L146,528 Q150,546 141,552 Q128,554 123,546 Z', P.f) + ln('M123,536 L147,536', P.d, 2.6, 1) + circ(141, 536, 1.8, '#c0c0c0'), { c1: '#111111' });
S('sandals', 'Sandals', ['beach', 'summer', 'casual'], P => p('M122,546 L149,546 L149,553 Q136,556 122,553 Z', P.d) + ln('M125,532 L145,532 M124,542 L146,542', P.c1, 3, 1), { c1: '#a2845e' });
S('combat', 'Combat Boots', ['goth', 'rock', 'edgy', 'street'], P => p('M118,470 L149,470 L150,546 L118,546 Z', P.f) + p('M115,543 L153,543 L153,557 L115,557 Z', '#222') + ln('M127,478 L141,486 M141,478 L127,486 M127,494 L141,502 M141,494 L127,502 M127,510 L141,518 M141,510 L127,518', '#ddd', 1.2, .9), { c1: '#1a1a1a' });
S('uggs', 'Cozy Boots', ['cozy', 'winter', 'casual'], P => p('M115,476 L151,476 L152,546 Q150,557 134,557 Q116,557 116,546 Z', P.f) + `<ellipse cx="133" cy="478" rx="19" ry="6" fill="${P.l}" ${OL}/>`, { c1: '#c8a878' });
S('cowboots', 'Cowboy Boots', ['western'], P => p('M118,440 L150,440 L149,536 L144,556 L128,556 Q119,546 120,532 Z', P.f) + ln('M126,456 Q134,472 142,456 M124,476 Q134,494 144,476', P.d, 1.4, .8), { c1: '#8b5a2b', price: 250 });
S('skates', 'Roller Skates', ['sporty', 'y2k', 'pop', 'cute'], P => p('M119,496 L148,496 L150,542 L118,542 Z', P.f) + `<rect x="116" y="541" width="36" height="6" fill="#c0c0c0" ${OL}/>` + circ(123, 554, 6, P.c2, OL) + circ(145, 554, 6, P.c2, OL), { c1: '#ffffff', c2: '#ff4fa3', two: true, vip: true });
S('glassheels', 'Glass Slippers', ['royal', 'fairy', 'formal'], P => p(HEEL, P.f, 'fill-opacity=".65"') + `<path d="${sparkle(132, 530, 3)}" fill="#fff"/>`, { c1: '#bfe9ff', price: 700 });
S('bratboots', 'brat platform boots', ['brat', 'party', 'edgy', 'y2k'], PLATFORM, { c1: '#111111', c2: BRAT, two: true, brat: 7 });
S('bratheels', 'lime kitten heels', ['brat', 'party', 'elegant'], P => p('M126,520 L145,520 L147,536 L142,552 L130,552 L124,536 Z', P.f) + ln('M126,525 L145,525', P.d, 2, .9), { c1: BRAT, brat: 15 });

/* ===== LEGWEAR (left leg, mirrored) ===== */
const W = (id, name, tags, draw, o) => I('legwear', id, name, tags, P => both(draw(P)), o);
const netDef = P => `<pattern id="${P.uid}-net" patternUnits="userSpaceOnUse" width="7" height="7"><path d="M0,0 L7,7 M7,0 L0,7" stroke="${P.c1}" stroke-width=".9"/></pattern>`;
W('tights', 'Sheer Tights', ['elegant', 'office', 'goth', 'cozy'], P => p(leg(318, 530, .4), P.f, 'fill-opacity=".55"') + p(FOOT, P.f, 'fill-opacity=".55"'), { c1: '#1a1a1a' });
W('fishnets', 'Fishnets', ['goth', 'rock', 'party', 'edgy'], P => netDef(P) + `<path d="${leg(318, 530, .3)}" fill="url(#${P.uid}-net)"/><path d="${FOOT}" fill="url(#${P.uid}-net)"/>`, { c1: '#111111', noPat: true });
W('stripestock', 'Striped Stockings', ['goth', 'spooky', 'cute'], P => p(leg(330, 530, .4), P.f) + p(FOOT, P.f), { c1: '#111111', c2: '#ffffff', pat: 'stripes' });
W('kneesocks', 'Knee Socks', ['cute', 'y2k', 'sporty', 'office'], P => p(leg(428, 530, .7), P.f) + p(FOOT, P.f) + ln('M120,436 L148,436', P.d, 2.5, .6), { c1: '#ffffff' });
W('thighhighs', 'Thigh Highs', ['goth', 'cute', 'y2k', 'party'], P => p(leg(372, 530, .5), P.f) + p(FOOT, P.f) + ln('M110,380 L149,380', P.c2, 3, .9), { c1: '#111111', c2: '#ffffff' });
W('legwarmers', 'Leg Warmers', ['cozy', 'y2k', 'sporty', 'winter'], P => p(leg(440, 526, 3), P.f) + range(450, 518, 10).map(y => ln(`M118,${y} Q133,${y + 3} 149,${y}`)).join(''), { c1: '#ff8fc8' });
W('slouch', 'Slouch Socks', ['y2k', 'sporty', 'casual'], P => p(leg(488, 530, 2.5), P.f) + p(FOOT, P.f) + ln('M122,496 Q134,500 146,496 M122,508 Q134,512 146,508'), { c1: '#ffffff' });
W('bratnets', 'lime fishnets', ['brat', 'party', 'edgy'], P => netDef(P) + `<path d="${leg(318, 530, .3)}" fill="url(#${P.uid}-net)"/><path d="${FOOT}" fill="url(#${P.uid}-net)"/>`, { c1: BRAT, noPat: true, brat: 18 });

/* ===== HATS ===== */
const Ht = (id, name, tags, draw, o) => I('hat', id, name, tags, draw, o);
Ht('beanie', 'Beanie', ['winter', 'cozy', 'street'], P => p('M112,80 Q110,32 150,30 Q190,32 188,80 Z', P.f) + p('M110,68 L190,68 L190,84 L110,84 Z', P.d) + circ(150, 28, 9, P.c2, OL), { c1: '#e0245e', c2: '#ffffff', two: true });
Ht('cowboy', 'Cowboy Hat', ['western', 'summer'], P => `<ellipse cx="150" cy="64" rx="64" ry="12" fill="${P.f}" ${OL}/>` + p('M118,64 Q114,26 136,26 Q150,34 164,26 Q186,26 182,64 Z', P.f) + p('M118,54 Q150,60 182,54 L182,62 Q150,68 118,62 Z', P.c2), { c1: '#a2845e', c2: '#5b3a29', two: true });
Ht('cap', 'Baseball Cap', ['sporty', 'street', 'casual'], P => p('M114,74 Q114,34 150,34 Q186,34 186,74 Z', P.f) + `<ellipse cx="150" cy="74" rx="46" ry="8" fill="${P.d}" ${OL}/>`, { c1: '#0a84ff' });
Ht('beret', 'Beret', ['elegant', 'office', 'cottage'], P => `<ellipse cx="142" cy="50" rx="48" ry="17" fill="${P.f}" transform="rotate(-8 142 50)" ${OL}/>` + circ(144, 32, 3, P.d), { c1: '#e0245e' });
Ht('bucket', 'Bucket Hat', ['street', 'y2k', 'beach'], P => p('M116,72 L122,36 Q150,28 178,36 L184,72 Z', P.f) + p('M104,80 L116,68 L184,68 L196,80 Q150,90 104,80 Z', P.f), { c1: '#fff3b0', pat: 'check', c2: '#111111' });
Ht('bunny', 'Bunny Ears', ['cute', 'pop', 'party'], P => both(`<ellipse cx="130" cy="22" rx="10" ry="28" fill="${P.f}" transform="rotate(-12 130 22)" ${OL}/><ellipse cx="130" cy="24" rx="5" ry="19" fill="${P.c2}" transform="rotate(-12 130 24)"/>`) + ln('M114,66 Q150,40 186,66', P.c1, 4, 1), { c1: '#ffffff', c2: '#ff8fc8', two: true });
Ht('catears', 'Cat Ears', ['cute', 'goth', 'spooky', 'pop'], P => both(p('M118,62 L120,30 L140,50 Z', P.f) + p('M122,56 L123,38 L134,50 Z', P.c2)) + ln('M114,64 Q150,40 186,64', P.c1, 4, 1), { c1: '#111111', c2: '#ff8fc8', two: true });
Ht('bow', 'Giant Bow', ['cute', 'romantic', 'y2k', 'pop'], P => p('M150,46 L120,30 Q110,46 120,62 Z', P.f) + p('M150,46 L180,30 Q190,46 180,62 Z', P.f) + circ(150, 46, 6, P.d, OL), { c1: '#ff4fa3' });
Ht('flowercrown', 'Flower Crown', ['cottage', 'fairy', 'romantic', 'summer'], P => range(0, 1, .125).map((t, i) => { const [x, y] = qpt([116, 66], [150, 34], [184, 66], t); return circ(r1(x), r1(y), 6.5, i % 2 ? P.c2 : P.c1, OL) + circ(r1(x), r1(y), 2, '#ffd60a'); }).join(''), { c1: '#ff8fc8', c2: '#ffffff', noPat: true, two: true });
Ht('halo', 'Angel Halo', ['fairy', 'romantic', 'royal'], P => `<ellipse cx="150" cy="26" rx="30" ry="7" fill="none" stroke="${P.c1}" stroke-width="9" opacity=".35" filter="url(#${P.uid}-soft)"/><ellipse cx="150" cy="26" rx="30" ry="7" fill="none" stroke="${P.c1}" stroke-width="4.5"/>`, { c1: '#ffd60a', noPat: true });
Ht('tiara', 'Tiara', ['royal', 'fairy', 'romantic', 'formal'], P => p('M122,66 Q150,44 178,66 L172,66 Q150,54 128,66 Z', P.f) + p('M150,36 L155,54 L145,54 Z', P.f) + both(p('M136,44 L140,58 L132,60 Z', P.f)) + circ(150, 50, 3, P.c2), { c1: '#e6e6f0', c2: '#5ab4ff', noPat: true, two: true });
Ht('witchhat', 'Witch Hat', ['spooky', 'goth', 'fairy'], P => `<ellipse cx="150" cy="62" rx="62" ry="11" fill="${P.f}" ${OL}/>` + p('M118,62 Q132,40 140,8 Q144,-2 170,14 Q156,22 160,40 Q170,52 182,62 Z', P.f) + p('M122,54 Q150,60 178,54 L180,62 Q150,68 120,62 Z', P.c2), { c1: '#2a1438', c2: '#bf5af2', two: true });
Ht('headphones', 'Headphones', ['street', 'pop', 'futuristic'], P => ln('M112,92 Q112,30 150,30 Q188,30 188,92', P.c1, 6, 1) + both(`<rect x="104" y="86" width="15" height="28" rx="7" fill="${P.f}" ${OL}/>`), { c1: '#ffffff' });
Ht('crown', 'Royal Crown', ['royal', 'formal', 'party'], P => p('M118,62 L117,34 L131,48 L140,26 L150,46 L160,26 L169,48 L183,34 L182,62 Z', P.f) + circ(150, 54, 3.5, P.c2) + circ(134, 55, 2.6, P.c2) + circ(166, 55, 2.6, P.c2), { c1: '#d4af37', c2: '#e0245e', two: true, vip: true });
Ht('brathat', 'lime bucket hat', ['brat', 'street', 'summer', 'y2k'], P => p('M116,72 L122,36 Q150,28 178,36 L184,72 Z', P.f) + p('M104,80 L116,68 L184,68 L196,80 Q150,90 104,80 Z', P.f) + bratText(150, 62, 13, '#111', P.uid), { c1: BRAT, brat: 16 });
Ht('bratcrown', 'brat crown', ['brat', 'royal', 'party'], P => p('M118,62 L117,34 L131,48 L140,26 L150,46 L160,26 L169,48 L183,34 L182,62 Z', P.f) + circ(150, 54, 3.5, '#111') + circ(134, 55, 2.6, '#111') + circ(166, 55, 2.6, '#111'), { c1: BRAT, brat: 40 });

/* ===== GLASSES ===== */
const Gs = (id, name, tags, draw, o) => I('glasses', id, name, tags, draw, o);
const bridge = c => ln('M148,96 Q150,94 152,96', c, 2, 1);
Gs('shades', 'Sunglasses', ['summer', 'beach', 'street', 'pop'], P => both(`<rect x="124" y="91" width="24" height="15" rx="6" fill="${P.f}" ${OL}/>`) + bridge('#111'), { c1: '#111111' });
Gs('roundglasses', 'Round Frames', ['cottage', 'office', 'cute'], P => both(`<circle cx="136" cy="98" r="10.5" fill="#fff" fill-opacity=".18" stroke="${P.c1}" stroke-width="2"/>`) + bridge(P.c1), { c1: '#5b3a29', noPat: true });
Gs('nerd', 'Square Frames', ['office', 'cute', 'street'], P => both(`<rect x="124" y="90" width="24" height="16" rx="3" fill="#fff" fill-opacity=".18" stroke="${P.c1}" stroke-width="2.6"/>`) + bridge(P.c1), { c1: '#111111', noPat: true });
Gs('cateye', 'Cat-Eye Shades', ['elegant', 'y2k', 'pop', 'party'], P => both(p('M121,90 Q136,88 148,94 L146,104 Q136,110 127,105 Q121,99 121,90 Z', P.f)) + bridge('#111'), { c1: '#e0245e' });
Gs('heartglasses', 'Heart Shades', ['cute', 'pop', 'y2k', 'romantic'], P => both(p(heart(136, 98, 8.5), P.f)) + bridge(P.c1), { c1: '#ff4fa3' });
Gs('starglasses', 'Star Shades', ['pop', 'party', 'y2k'], P => both(p(star(136, 98, 12), P.f)) + bridge(P.c1), { c1: '#ffd60a' });
Gs('visor', 'Cyber Visor', ['futuristic', 'party', 'edgy'], P => p('M112,90 Q150,80 188,90 L186,105 Q150,112 114,105 Z', P.f, 'fill-opacity=".85"') + ln('M122,92 Q150,86 178,92', '#fff', 2, .7), { c1: '#32ade6' });
Gs('bratshades', 'brat slim shades', ['brat', 'edgy', 'party', 'y2k', 'street'], P => both(`<rect x="123" y="93" width="25" height="8.5" rx="2" fill="${P.f}" ${OL}/>`) + bridge('#111'), { c1: '#111111', brat: 2 });

/* ===== NECK ===== */
const N = (id, name, tags, draw, o) => I('neck', id, name, tags, draw, o);
N('choker', 'Choker', ['goth', 'y2k', 'edgy', 'rock'], P => p('M137,139 Q150,145 163,139 L163,146 Q150,152 137,146 Z', P.f) + p(heart(150, 154, 3.2), P.c2), { c1: '#111111', c2: '#c0c0c0', two: true });
N('pearls', 'Pearl Necklace', ['elegant', 'royal', 'formal', 'office'], P => range(0, 1, 1 / 12).map(t => { const [x, y] = qpt([128, 160], [150, 198], [172, 160], t); return circ(r1(x), r1(y), 3, P.c1, OL); }).join(''), { c1: '#fdf6ec', noPat: true });
N('chain', 'Gold Chain', ['street', 'rock', 'party', 'pop'], P => `<path d="M132,158 Q150,196 168,158" fill="none" stroke="${P.c1}" stroke-width="2.4"/>` + circ(150, 180, 4.5, P.c2, OL), { c1: '#d4af37', c2: '#d4af37', noPat: true, two: true });
N('locket', 'Heart Locket', ['romantic', 'cute', 'cottage'], P => ln('M134,158 Q150,190 166,158', P.c1, 1.2, 1) + p(heart(150, 182, 7), P.c1), { c1: '#d4af37', noPat: true });
N('scarf', 'Scarf', ['winter', 'cozy', 'elegant'], P => p('M134,138 Q150,152 166,138 L171,162 Q150,174 129,162 Z', P.f) + p('M156,160 L172,236 L154,238 L148,166 Z', P.f), { c1: '#e0245e', pat: 'plaid', c2: '#ffd60a' });
N('bowtie', 'Bow Tie', ['formal', 'cute', 'office'], P => p('M150,158 L136,150 L136,166 Z', P.f) + p('M150,158 L164,150 L164,166 Z', P.f) + circ(150, 158, 3, P.d), { c1: '#111111' });
N('tie', 'Neck Tie', ['office', 'cute', 'rock'], P => p('M146,156 L154,156 L156,164 L144,164 Z', P.f) + p('M145,164 L155,164 L159,262 L150,272 L141,262 Z', P.f), { c1: '#e0245e', pat: 'stripes', c2: '#111111' });
N('lacecollar', 'Lace Collar', ['cottage', 'romantic', 'goth'], P => both(p('M150,156 Q138,150 128,156 Q126,168 138,174 Q148,172 150,166 Z', P.f)), { c1: '#ffffff' });
N('spiked', 'Spiked Collar', ['goth', 'rock', 'spooky', 'edgy'], P => p('M137,139 Q150,145 163,139 L163,147 Q150,153 137,147 Z', P.f) + [140, 145, 150, 155, 160].map(x => p(`M${x - 2},${x === 150 ? 151 : 149} L${x},${x === 150 ? 158 : 156} L${x + 2},${x === 150 ? 151 : 149} Z`, '#c0c0c0', 'stroke-width=".6"')).join(''), { c1: '#111111' });
N('bratchoker', 'brat chain choker', ['brat', 'edgy', 'party', 'y2k'], P => p('M137,139 Q150,145 163,139 L163,146 Q150,152 137,146 Z', P.f) + `<path d="M136,150 Q150,172 164,150" fill="none" stroke="${P.c2}" stroke-width="1.8" stroke-dasharray="3 1.5"/>`, { c1: BRAT, c2: '#c0c0c0', two: true, brat: 5 });

/* ===== EARRINGS ===== */
const E = (id, name, tags, draw, o) => I('ears', id, name, tags, P => both(draw(P)), { noPat: true, ...o });
E('hoops', 'Hoop Earrings', ['y2k', 'street', 'pop', 'party'], P => `<circle cx="115" cy="118" r="8" fill="none" stroke="${P.c1}" stroke-width="2.6"/>`, { c1: '#d4af37' });
E('studs', 'Diamond Studs', ['elegant', 'formal', 'office'], P => circ(116, 110, 2.8, P.c1, OL), { c1: '#e6f4ff' });
E('drops', 'Pearl Drops', ['elegant', 'royal', 'romantic'], P => ln('M116,108 L116,118', P.c2, 1.2, 1) + circ(116, 122, 4, P.c1, OL), { c1: '#fdf6ec', c2: '#d4af37' });
E('stararrings', 'Star Earrings', ['pop', 'party', 'y2k'], P => p(star(115, 120, 6), P.c1), { c1: '#ffd60a' });
E('cherries', 'Cherry Earrings', ['cute', 'summer', 'y2k'], P => ln('M116,108 L112,120 M116,108 L120,122', '#2d6a4f', 1.2, 1) + circ(112, 124, 4, P.c1, OL) + circ(120, 126, 4, P.c1, OL), { c1: '#e0245e' });
E('crosses', 'Cross Earrings', ['goth', 'rock', 'edgy'], P => ln('M116,110 L116,128 M111,116 L121,116', P.c1, 2.4, 1), { c1: '#c0c0c0' });

/* ===== BAGS / HAND ITEMS (held in right hand) ===== */
const Bg = (id, name, tags, draw, o) => I('bag', id, name, tags, P => ({ hand: draw(P) }), o);
const MINIBAG = P => `<path d="M64,346 Q78,318 92,346" fill="none" stroke="${P.d}" stroke-width="2.6"/><rect x="58" y="342" width="40" height="28" rx="7" fill="${P.f}" ${OL}/>` + ln('M58,352 Q78,362 98,352');
Bg('minibag', 'Mini Bag', ['y2k', 'party', 'elegant', 'cute'], MINIBAG, { c1: '#ff4fa3' });
Bg('tote', 'Tote Bag', ['casual', 'cottage', 'beach', 'office'], P => `<path d="M60,346 Q66,318 76,326 M96,346 Q90,318 80,326" fill="none" stroke="${P.d}" stroke-width="2.6"/><rect x="50" y="342" width="56" height="50" rx="4" fill="${P.f}" ${OL}/>` + `<path d="${heart(78, 366, 6)}" fill="${P.c2}"/>`, { c1: '#f5e6c8', c2: '#e0245e', two: true });
Bg('heartpurse', 'Heart Purse', ['cute', 'romantic', 'pop'], P => `<path d="M66,350 Q78,318 90,350" fill="none" stroke="${P.d}" stroke-width="2.4"/>` + p(heart(78, 362, 14), P.f), { c1: '#e0245e' });
Bg('clutch', 'Clutch', ['formal', 'elegant', 'party'], P => `<rect x="56" y="332" width="44" height="20" rx="4" fill="${P.f}" ${OL}/>` + circ(78, 336, 2.5, '#fff'), { c1: '#d4af37', c2: '#fff', pat: 'sparkle' });
Bg('phone', 'Phone', ['street', 'pop', 'y2k', 'casual'], P => `<rect x="66" y="304" width="24" height="38" rx="5" fill="${P.f}" ${OL}/>` + circ(72, 311, 2.4, '#222') + circ(72, 318, 2.4, '#222'), { c1: '#ff8fc8' });
Bg('bouquet', 'Bouquet', ['romantic', 'cottage', 'formal'], P => p('M68,334 L88,334 L80,376 L76,376 Z', '#b8f2c9') + [[70, 316], [86, 316], [78, 306], [74, 326], [84, 326]].map(([x, y], i) => circ(x, y, 7, i % 2 ? P.c2 : P.c1, OL) + circ(x, y, 2, '#ffd60a')).join(''), { c1: '#ff4fa3', c2: '#ffffff', noPat: true, two: true });
Bg('fan', 'Lace Fan', ['royal', 'elegant', 'romantic'], P => p('M78,330 L48,300 Q78,280 108,300 Z', P.f) + ln('M78,330 L60,292 M78,330 L78,286 M78,330 L96,292'), { c1: '#ffffff', c2: '#7a1f3d', pat: 'mesh' });
Bg('mic', 'Microphone', ['pop', 'party', 'rock'], P => `<rect x="74" y="300" width="8" height="34" rx="3" fill="${P.f}" ${OL}/>` + circ(78, 294, 9, '#c0c0c0', OL) + ln('M71,290 L85,298 M71,298 L85,290', '#777', 1, .8), { c1: '#111111' });
Bg('racket', 'Tennis Racket', ['sporty', 'elegant'], P => ln('M78,322 L78,356', '#222', 5, 1) + `<ellipse cx="78" cy="378" rx="15" ry="20" fill="#fff" fill-opacity=".35" stroke="${P.c1}" stroke-width="3.5"/>`, { c1: '#e0245e', noPat: true });
Bg('coffee', 'Iced Coffee', ['casual', 'street', 'office', 'cozy'], P => p('M67,310 L89,310 L86,346 L70,346 Z', '#f6efe7', 'fill-opacity=".8"') + p('M69,322 L87,322 L86,344 L70,344 Z', P.c1, 'stroke="none"') + `<rect x="65" y="306" width="26" height="5" rx="2" fill="#fff" ${OL}/>` + ln('M80,306 L84,290', '#2ec4b6', 2.5, 1), { c1: '#a2845e', noPat: true });
Bg('wand', 'Fairy Wand', ['fairy', 'cute', 'royal'], P => ln('M78,336 L78,284', '#fff', 3, 1) + p(star(78, 278, 11), P.c1), { c1: '#ffd60a', noPat: true });
Bg('pumpkin', 'Pumpkin Pail', ['spooky'], P => `<path d="M62,344 Q78,318 94,344" fill="none" stroke="#222" stroke-width="2"/><ellipse cx="78" cy="358" rx="18" ry="15" fill="${P.c1}" ${OL}/>` + p('M70,352 L74,348 L76,354 Z M86,352 L82,348 L80,354 Z M70,362 Q78,368 86,362', '#222', 'stroke-width=".5"'), { c1: '#ff9500', noPat: true });
Bg('glowsticks', 'Glow Sticks', ['party', 'futuristic', 'pop'], P => `<g filter="url(#${P.uid}-soft)" opacity=".8">${ln('M70,300 L84,346', P.c1, 8, 1)}</g>` + ln('M70,300 L84,346', P.c1, 4, 1) + ln('M86,300 L74,346', '#ff4fa3', 4, 1), { c1: '#8ACE00', noPat: true });
Bg('bratphone', 'brat phone', ['brat', 'street', 'pop', 'party'], P => `<rect x="66" y="304" width="24" height="38" rx="5" fill="${P.f}" ${OL}/>` + bratText(78, 328, 10, '#111', P.uid, true), { c1: BRAT, brat: 21 });
Bg('bratbag', 'lime mini bag', ['brat', 'party', 'y2k'], MINIBAG, { c1: BRAT, brat: 24 });

/* ===== GLOVES / ARMS ===== */
const Gl = (id, name, tags, draw, o) => I('gloves', id, name, tags, P => ({ arm: draw(P) }), o);
const WARMERS = P => p('M72,250 L70,316 L88,318 L92,252 Z', P.f) + range(258, 310, 9).map(y => ln(`M72,${y} L90,${y + 1}`)).join('');
Gl('opera', 'Opera Gloves', ['formal', 'elegant', 'royal', 'goth'], P => p('M76,232 L70,318 Q64,338 78,343 Q92,339 88,320 L94,234 Z', P.f), { c1: '#111111' });
Gl('lacegloves', 'Lace Gloves', ['romantic', 'goth', 'elegant'], P => p('M70,306 L68,320 Q65,338 78,342 Q91,338 88,320 L89,306 Z', P.f), { c1: '#ffffff', c2: '#ffffff', pat: 'mesh' });
Gl('armwarmers', 'Arm Warmers', ['y2k', 'cozy', 'goth'], WARMERS, { c1: '#ff8fc8', c2: '#111111', pat: 'stripes' });
Gl('bangles', 'Bangles', ['party', 'pop', 'beach', 'summer'], P => `<ellipse cx="79" cy="306" rx="11" ry="3" fill="none" stroke="${P.c1}" stroke-width="2.4"/><ellipse cx="79" cy="312" rx="11" ry="3" fill="none" stroke="${P.c1}" stroke-width="2.4"/>`, { c1: '#d4af37', noPat: true });
Gl('sweatbands', 'Sweatbands', ['sporty'], P => p('M70,300 L89,302 L88,316 L69,314 Z', P.f), { c1: '#ff3b30' });
Gl('bratwarmers', 'brat arm warmers', ['brat', 'edgy', 'y2k', 'party'], WARMERS, { c1: BRAT, c2: '#111111', pat: 'stripes', brat: 13 });

/* ===== BACK (wings, capes) ===== */
const Bk = (id, name, tags, draw, o) => I('back', id, name, tags, draw, o);
const FAIRY = (P, op) => both(`<path d="M132,200 Q60,110 46,170 Q44,214 132,214 Z" fill="${P.f}" fill-opacity="${op}" ${OL}/><path d="M132,218 Q70,236 78,290 Q104,300 134,226 Z" fill="${P.f}" fill-opacity="${op}" ${OL}/>`);
Bk('angel', 'Angel Wings', ['fairy', 'romantic', 'royal'], P => both(p('M126,196 Q70,128 32,96 Q18,156 42,206 Q28,236 58,260 Q50,288 88,298 Q104,256 126,236 Z', P.f) + ln('M42,206 Q80,214 120,214 M58,260 Q90,250 122,232 M40,140 Q80,170 124,200', P.d, 1.2, .5)), { c1: '#ffffff', price: 500 });
Bk('fairywings', 'Fairy Wings', ['fairy', 'cottage', 'cute'], P => FAIRY(P, .6), { c1: '#b8f2c9', c2: '#ffffff', pat: 'sparkle' });
Bk('butterfly', 'Butterfly Wings', ['fairy', 'pop', 'summer', 'cute'], P => FAIRY(P, 1), { c1: '#ff9500', c2: '#111111', pat: 'leopard' });
Bk('devil', 'Devil Wings', ['goth', 'spooky', 'edgy'], P => both(p('M128,200 L44,112 L54,166 L28,178 L60,212 L44,236 L90,238 L128,232 Z', P.f)), { c1: '#2a1438' });
Bk('cape', 'Royal Cape', ['royal', 'formal', 'spooky'], P => p('M106,160 L194,160 L236,544 Q150,558 64,544 Z', P.f), { c1: '#7a1f3d', vip: true });
Bk('glowwings', 'lime glow wings', ['brat', 'party', 'fairy', 'futuristic'], P => `<g filter="url(#${P.uid}-glow)" opacity=".7">${FAIRY(P, .9)}</g>` + FAIRY(P, .55), { c1: BRAT, noPat: true, brat: 33 });


/* ===== SWIM ===== */
Dr('swimsuit', 'One-Piece Swimsuit', ['swim', 'beach', 'summer', 'sporty'], P => ({ main: p(torso(178, 324, { neck: 'scoop', hem: 22 }), P.f) + straps(P.c1) }), { c1: '#2ec4b6' });
B('bikinibottom', 'Bikini Bottom', ['swim', 'beach', 'summer'], P => p(`M${r1(150 - hw(300) - .6)},300 L${r1(150 + hw(300) + .6)},300 L${r1(150 + hw(318) + .6)},318 L156,342 L144,342 L${r1(150 - hw(318) - .6)},318 Z`, P.f), { c1: '#ff4fa3', pat: 'polka', c2: '#ffffff' });
B('boardshorts', 'Board Shorts', ['swim', 'beach', 'summer', 'sporty'], P => p(pants(272, 392, { pad: 6 }), P.f) + both(ln('M101,280 L111,392', P.c2, 3, 1)), { c1: '#0a84ff', c2: '#ffffff', pat: 'flowers' });
B('sarong', 'Sarong Wrap', ['swim', 'beach', 'summer', 'cottage'], P => p(skirt(292, 470, 12), P.f) + p('M176,292 L194,300 L188,330 L174,318 Z', P.f) + circ(182, 300, 4, P.d), { c1: '#ff9500', c2: '#ffd60a', pat: 'flowers' });
Tp('rashguard', 'Rash Guard', ['swim', 'sporty', 'beach'], P => ({ main: p(torso(156, 300, { neck: 'crew', pad: 1 }), P.f) + ln('M104,200 L196,200', P.c2, 4, 1), arm: p(SLV.long, P.f) + ln('M78,200 L101,206', P.c2, 4, 1) }), { c1: '#1d3557', c2: '#2ec4b6', two: true });
Ht('sunhat', 'Floppy Sun Hat', ['swim', 'beach', 'summer', 'elegant'], P => `<ellipse cx="150" cy="64" rx="76" ry="14" fill="${P.f}" ${OL}/>` + p('M116,64 Q116,30 150,30 Q184,30 184,64 Z', P.f) + p('M116,54 Q150,60 184,54 L184,62 Q150,68 116,62 Z', P.c2), { c1: '#f5e6c8', c2: '#111111', two: true });
Ht('swimcap', 'Swim Cap', ['swim', 'sporty'], P => p('M112,92 Q108,36 150,34 Q192,36 188,92 Q150,80 112,92 Z', P.f) + circ(178, 52, 7, P.c2, OL) + circ(178, 52, 2.5, '#ffd60a'), { c1: '#ff8fc8', c2: '#ffffff', two: true });
Gs('goggles', 'Swim Goggles', ['swim', 'sporty'], P => both(`<rect x="124" y="90" width="23" height="15" rx="7" fill="${P.f}" fill-opacity=".75" stroke="#222" stroke-width="2"/>` + ln('M124,98 L114,96', '#222', 3, 1)) + bridge('#222'), { c1: '#5ab4ff' });
S('flipflops', 'Flip Flops', ['swim', 'beach', 'summer', 'casual'], P => p('M122,544 L148,544 L149,554 Q136,558 121,554 Z', P.f) + ln('M125,544 L135,531 L145,544', P.c2, 2.4, 1), { c1: '#ffd60a', c2: '#ff4fa3', two: true });
Bg('floatie', 'Pool Floatie', ['swim', 'beach', 'summer', 'cute'], P => `<path d="M50,356 a28,28 0 1,0 56,0 a28,28 0 1,0 -56,0 Z M66,356 a12,12 0 1,1 24,0 a12,12 0 1,1 -24,0 Z" fill="${P.f}" fill-rule="evenodd" ${OL}/>` + [[58, 344], [96, 346], [62, 372], [94, 370], [78, 332]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="6" height="2.4" rx="1" fill="${['#fff', '#ffd60a', '#5ab4ff'][i % 3]}" transform="rotate(${i * 40} ${x} ${y})"/>`).join(''), { c1: '#ff8fc8' });

/* ===== WEDDING ===== */
Dr('weddinggown', 'Wedding Gown', ['wedding', 'formal', 'elegant', 'romantic', 'royal'], P => ({
  back: `<path d="M70,520 Q150,500 230,520 L278,566 Q150,580 22,566 Z" fill="${P.f}" ${OL}/>`,
  main: p(torso(188, 270, { neck: 'sweet' }), P.f) + p(skirt(268, 556, 92, { hem: 10 }), P.f) + both(ln('M118,330 Q108,440 84,540', P.d, 1.2, .35)) + range(122, 178, 8).map(x => circ(x, 272, 1.6, '#fff', 'opacity=".9"')).join(''),
}), { c1: '#fffdf6', price: 800 });
Ht('veil', 'Bridal Veil', ['wedding', 'romantic', 'elegant'], P => ({
  back: `<path d="M118,58 Q150,40 182,58 L238,452 Q150,474 62,452 Z" fill="${P.c1}" fill-opacity=".38" stroke="#fff" stroke-width="1.2"/>`,
  main: ln('M116,62 Q150,40 184,62', P.c2, 3.4, 1) + [122, 136, 150, 164, 178].map((x, i) => circ(x, i === 2 ? 44 : (i % 2 ? 48 : 56), 4, '#fff', OL)).join(''),
}), { c1: '#ffffff', c2: '#e6e6f0', noPat: true });
Dr('bridesmaid', 'Bridesmaid Dress', ['wedding', 'romantic', 'elegant', 'formal'], P => ({ main: p(torso(184, 262, { neck: 'v' }), P.f) + p(skirt(262, 478, 26), P.f) + straps(P.c1) + ln('M150,262 Q148,380 156,476', P.d, 1.2, .35) }), { c1: '#c9a7ff' });
O('tux', 'Tuxedo Jacket', ['wedding', 'formal', 'elegant', 'office'], P => ({ main: both(p(jacketHalf(330, 8, { close: 236 }), P.f) + p('M138,152 L142,236 L120,192 Z', P.c2)) + circ(146, 262, 2.6, '#333'), arm: p(SLV.long, P.f) + ln('M66,316 L89,318', '#fff', 3, 1) }), { c1: '#111111', c2: '#2a2a2a', two: true, price: 400 });

/* ===== HOLIDAYS ===== */
Ht('santahat', 'Santa Hat', ['christmas', 'winter', 'cozy', 'cute'], P => p('M114,72 Q118,28 158,24 Q200,30 206,92 L196,94 Q192,54 176,48 Q186,58 186,72 Z', P.f) + `<rect x="108" y="64" width="84" height="16" rx="8" fill="#fff" ${OL}/>` + circ(202, 96, 9, '#fff', OL), { c1: '#e0245e' });
Ht('elfhat', 'Elf Hat', ['christmas', 'cute', 'pop'], P => p('M114,70 L192,70 Q176,40 200,18 Q160,22 140,42 Q122,54 114,70 Z', P.f) + `<rect x="110" y="64" width="84" height="12" rx="5" fill="${P.c2}" ${OL}/>` + circ(201, 18, 5, '#ffd60a', OL), { c1: '#2d6a4f', c2: '#e0245e', two: true });
Ht('antlers', 'Reindeer Antlers', ['christmas', 'cute', 'winter'], P => both(ln('M128,60 Q120,36 112,14 M120,36 Q108,32 100,22 M116,26 Q124,18 126,8', P.c1, 4.5, 1)) + ln('M114,66 Q150,42 186,66', '#222', 3.5, 1), { c1: '#8b5a2b', noPat: true });
Ht('partyhat', 'Party Hat', ['newyear', 'party', 'pop', 'cute'], P => p('M130,62 L150,6 L170,62 Z', P.f) + circ(150, 6, 6, P.c2, OL), { c1: '#bf5af2', c2: '#ffd60a', pat: 'stripes', two: true });
Ht('cloverband', 'Lucky Clover Band', ['lucky', 'cute', 'pop'], P => ln('M114,66 Q150,42 186,66', P.c1, 4, 1) + both(circ(126, 34, 6, P.c1, OL) + circ(120, 41, 6, P.c1, OL) + circ(132, 41, 6, P.c1, OL) + ln('M126,44 L128,58', P.d, 2, 1)), { c1: '#34c759', noPat: true });
Gs('nyeglasses', 'New Year Glasses', ['newyear', 'party', 'pop'], P => `<text x="150" y="108" text-anchor="middle" font-family="'Arial Black',Arial,sans-serif" font-weight="900" font-size="31" fill="${P.c1}" stroke="#222" stroke-width="1">2027</text>`, { c1: '#ffd60a', noPat: true });
Bg('candycane', 'Candy Cane', ['christmas', 'cute'], P => `<path d="M77,372 L77,300 Q77,284 92,284 Q107,284 107,300" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M77,372 L77,300 Q77,284 92,284 Q107,284 107,300" fill="none" stroke="${P.c1}" stroke-width="7" stroke-dasharray="5 6"/>`, { c1: '#e0245e', noPat: true });
Bg('giftbox', 'Gift Box', ['christmas', 'party', 'cute'], P => `<rect x="56" y="336" width="44" height="38" rx="3" fill="${P.f}" ${OL}/><rect x="74" y="336" width="8" height="38" fill="${P.c2}"/><rect x="56" y="350" width="44" height="8" fill="${P.c2}"/>` + p('M78,336 Q64,322 70,318 Q78,318 78,336 Q78,318 86,318 Q92,322 78,336 Z', P.c2), { c1: '#2d6a4f', c2: '#e0245e', two: true });
Bg('easterbasket', 'Easter Basket', ['easter', 'cottage', 'cute'], P => `<path d="M58,348 Q78,312 98,348" fill="none" stroke="${P.d}" stroke-width="3"/>` + [[66, 344, '#ff8fc8'], [78, 340, '#9ad7ff'], [90, 344, '#fff3b0']].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="8" fill="${c}" ${OL}/>`).join('') + p('M54,346 L102,346 L96,376 L60,376 Z', P.f) + ln('M56,356 L100,356 M58,366 L98,366', P.d, 1.4, .6), { c1: '#c8a878' });
Bg('lantern', 'Red Lantern', ['lunar', 'festive', 'romantic'], P => ln('M78,330 L78,346', '#222', 1.4, 1) + `<rect x="64" y="344" width="28" height="5" rx="2" fill="#d4af37"/><ellipse cx="78" cy="366" rx="20" ry="18" fill="${P.f}" ${OL}/><rect x="64" y="382" width="28" height="5" rx="2" fill="#d4af37"/>` + ln('M78,348 L78,384 M68,350 Q62,366 68,382 M88,350 Q94,366 88,382', P.d, 1, .6) + ln('M78,387 L78,402', '#ffd60a', 2.5, 1), { c1: '#e0245e' });
Bg('diya', 'Diya Lamp', ['diwali', 'desi', 'festive'], P => p('M62,318 Q78,334 94,318 Q90,312 78,314 Q66,312 62,318 Z', P.f) + `<circle cx="78" cy="302" r="10" fill="#ffd60a" opacity=".35" filter="url(#${P.uid}-soft)"/><path d="M78,312 Q72,302 78,290 Q84,302 78,312 Z" fill="#ffd60a"/>`, { c1: '#b5562b' });
Bg('sparkler', 'Sparkler', ['newyear', 'party', 'diwali'], P => ln('M78,334 L78,270', '#777', 2.4, 1) + `<g filter="url(#${P.uid}-soft)">${circ(78, 266, 9, P.c1, 'opacity=".8"')}</g><path d="${star(78, 266, 14, 3)}" fill="#fff3b0"/>`, { c1: '#ffd60a', noPat: true });
Dr('qipao', 'Qipao Dress', ['lunar', 'elegant', 'formal'], P => ({ main: p(torso(158, 332, { neck: 'turtle', pad: 1 }), P.f) + p(straight(330, 452, 4, 1), P.f) + ln('M137,136 Q146,150 152,170', P.c2, 2, 1) + [150, 160, 170].map(y => ln(`M146,${y} L156,${y + 2}`, P.c2, 2, 1)).join('') + ln('M188,420 L186,452', P.d, 1.4, .8), arm: p(SLV.cap, P.f) }), { c1: '#e0245e', c2: '#d4af37', two: true });
Dr('santadress', 'Santa Dress', ['christmas', 'party', 'cute', 'winter'], P => ({ main: p(torso(172, 262, { neck: 'sweet' }), P.f) + p(skirt(262, 352, 22), P.f) + ln(`M${r1(150 - hw(322) - 24)},350 Q150,360 ${r1(150 + hw(322) + 24)},350`, '#fff', 9, 1) + ln('M104,172 Q150,182 196,172', '#fff', 8, 1) + ln('M110,262 L190,262', '#111', 7, 1) + `<rect x="143" y="256" width="14" height="12" fill="none" stroke="#ffd60a" stroke-width="2.4"/>`, arm: p(SLV.long, P.f) + ln('M66,316 L89,318', '#fff', 7, 1) }), { c1: '#e0245e' });
Tp('uglysweater', 'Holiday Sweater', ['christmas', 'cozy', 'winter'], P => ({ main: p(torso(158, 318, { neck: 'crew', pad: 5 }), P.f) + p(star(150, 220, 12), '#ffd60a') + ln('M104,300 L196,300', P.c2, 5, 1), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#2d6a4f', c2: '#ffffff', pat: 'snow' });

/* ===== HALLOWEEN — Spooky Season (🍬 candy) ===== */
const EV = (ev, need) => ({ ev, need });
Ht('horns', 'Devil Horns', ['spooky', 'goth', 'party', 'edgy'], P => both(p('M128,60 Q114,42 120,20 Q130,40 140,54 Z', P.f)) + ln('M114,66 Q150,44 186,66', '#222', 3, 1), { c1: '#e0245e', noPat: true, ...EV('halloween', 0) });
E('candycorn', 'Candy Corn Earrings', ['spooky', 'cute'], () => p('M116,110 L110,128 L122,128 Z', '#ffffff') + p('M112,122 L120,122 L122,128 L110,128 Z', '#ffd60a') + p('M114,116 L118,116 L120,122 L112,122 Z', '#ff9500'), EV('halloween', 1));
I('lips', 'l-fangs', 'Vampire Fangs', ['spooky', 'goth'], P => p('M141,119 Q150,127 159,119 Q150,122 141,119 Z', P.c1) + p('M144,120.6 L145.6,126 L147.6,121.4 Z', '#fff', 'stroke-width=".4"') + p('M152.4,121.4 L154.4,126 L156,120.6 Z', '#fff', 'stroke-width=".4"'), { noPat: true, c1: '#7a1f3d', ...EV('halloween', 2) });
MK('facedeco', 'fd-stitches', 'Stitched Face', ['spooky', 'goth', 'edgy'], () => ln('M118,104 L140,116 M122,103 L120,109 M128,106 L126,112 M134,109 L132,115 M160,124 L176,132 M164,122 L163,128 M170,125 L169,131', '#4a1a2a', 1.4, .9), EV('halloween', 3));
W('webtights', 'Spiderweb Tights', ['spooky', 'goth', 'edgy'], P => p(leg(318, 530, .4), P.f) + p(FOOT, P.f), { c1: '#111111', c2: '#111111', pat: 'web', ...EV('halloween', 5) });
Dr('pumpkindress', 'Pumpkin Dress', ['spooky', 'cute', 'party'], P => ({ main: p(torso(178, 252, { neck: 'sweet' }), P.f) + p('M104,248 Q58,300 94,374 Q150,396 206,374 Q242,300 196,248 Z', P.f) + ln('M128,252 Q112,312 124,382 M150,252 L150,390 M172,252 Q188,312 176,382', P.d, 1.6, .6) + p('M140,176 Q150,164 160,176 Q150,184 140,176 Z', '#2d6a4f') + straps(P.c1) }), { c1: '#ff9500', ...EV('halloween', 7) });
Bk('vampcape', 'Vampire Cape', ['spooky', 'goth', 'royal', 'formal'], P => p('M104,158 L196,158 L242,544 Q150,560 58,544 Z', P.f) + both(p('M140,150 L100,96 L112,156 Z', P.c2)), { c1: '#111111', c2: '#7a1f3d', two: true, ...EV('halloween', 9) });
Dr('ghostgown', 'Ghostly Gown', ['spooky', 'fairy', 'goth'], P => ({ main: p(torso(164, 264, { neck: 'scoop' }), P.f, 'fill-opacity=".92"') + p(jaggedSkirt(262, 524, 44), P.f, 'fill-opacity=".85"'), arm: p(SLV.bell, P.f, 'fill-opacity=".85"') }), { c1: '#eef0ff', ...EV('halloween', 11) });
Dr('skeleton', 'Skeleton Bodysuit', ['spooky', 'goth', 'edgy', 'party'], P => ({ main: p(pants(266, 530, { pad: .5 }), P.f) + p(torso(158, 300, { neck: 'turtle', pad: .5 }), P.f) + ln('M150,186 L150,300', P.c2, 4, 1) + both([198, 212, 226, 240].map(y => ln(`M148,${y} Q134,${y - 5} 120,${y + 3}`, P.c2, 3, 1)).join('') + ln('M130,340 L134,518', P.c2, 4.5, 1)) + p('M134,296 Q150,312 166,296 L162,318 Q150,326 138,318 Z', P.c2), arm: p(SLV.long, P.f) + ln('M88,198 L80,314', P.c2, 3.4, 1) }), { c1: '#111111', c2: '#f4f4f8', two: true, ...EV('halloween', 13) });
S('witchboots', 'Witchy Boots', ['spooky', 'goth', 'fairy'], P => p('M120,468 L149,468 L148,542 Q146,552 136,554 L108,560 Q114,548 122,544 Z', P.f) + `<rect x="126" y="500" width="18" height="10" fill="none" stroke="#d4af37" stroke-width="2"/>`, { c1: '#2a1438', ...EV('halloween', 15) });
N('spiderneck', 'Spider Necklace', ['spooky', 'goth'], () => ln('M134,158 Q150,190 166,158', '#c0c0c0', 1.2, 1) + ln('M144,178 L138,174 M144,182 L137,183 M144,186 L139,190 M156,178 L162,174 M156,182 L163,183 M156,186 L161,190', '#111', 1.4, 1) + circ(150, 182, 6, '#111') + circ(150, 175, 3.5, '#111'), { noPat: true, ...EV('halloween', 18) });
Bg('scythe', 'Reaper Scythe', ['spooky', 'goth'], () => ln('M78,236 L78,420', '#5b3a29', 3.5, 1) + p('M78,238 Q36,232 18,268 Q44,250 78,252 Z', '#c0c0c0'), { noPat: true, ...EV('halloween', 21) });
Dr('mummy', 'Mummy Wraps', ['spooky', 'edgy'], P => {
  const t = torso(158, 352, { neck: 'crew', pad: 1 }), lg = leg(340, 528, .8);
  return {
    main: `<clipPath id="${P.uid}-mum"><path d="${t}"/><path d="${lg}"/><path d="${lg}" transform="translate(300 0) scale(-1 1)"/></clipPath>` + p(t, P.f) + both(p(lg, P.f)) +
      `<g clip-path="url(#${P.uid}-mum)">${range(160, 528, 12).map((y, i) => ln(`M90,${y} L210,${y + (i % 2 ? 9 : -6)}`, P.d, 1.3, .55)).join('')}</g>`,
    arm: p(SLV.long, P.f) + ln('M72,230 L94,236 M70,260 L92,264 M68,290 L90,294', P.d, 1.2, .55),
  };
}, { c1: '#efe6d2', ...EV('halloween', 24) });
Ht('mooncrown', 'Moon Witch Crown', ['spooky', 'fairy', 'goth', 'royal'], P => p('M118,62 L122,40 L136,52 L150,30 L164,52 L178,40 L182,62 Z', P.f) + p('M150,6 A13,13 0 1,0 163,28 A10,10 0 1,1 150,6 Z', P.c2), { c1: '#2a1438', c2: '#ffd60a', two: true, ...EV('halloween', 27) });

/* ===== NAVARATRI — Navaratri Utsav (🪔 diyas) ===== */
MK('facedeco', 'fd-bindi', 'Bindi', ['desi', 'festive', 'elegant'], P => circ(150, 80, 2.8, P.c1) + circ(150, 86, 1, '#d4af37'), { c1: '#e0245e', ...EV('navratri', 0) });
E('jhumka', 'Jhumka Earrings', ['desi', 'festive', 'elegant', 'wedding'], P => ln('M116,108 L116,114', P.c1, 1.4, 1) + p('M108,124 Q116,110 124,124 Z', P.c1) + [109, 112.5, 116, 119.5, 123].map(x => circ(x, 127.5, 1.4, P.c1)).join(''), { c1: '#d4af37', ...EV('navratri', 1) });
Gl('chooriyan', 'Glass Bangles', ['desi', 'festive', 'party'], P => [298, 302, 306, 310, 314].map((y, i) => `<ellipse cx="79" cy="${y}" rx="11" ry="2.6" fill="none" stroke="${i % 2 ? P.c2 : P.c1}" stroke-width="2.4"/>`).join(''), { c1: '#e0245e', c2: '#d4af37', two: true, noPat: true, ...EV('navratri', 2) });
Tp('kurti', 'Embroidered Kurti', ['desi', 'festive', 'casual', 'cottage'], P => ({ main: p(torso(158, 380, { neck: 'v', pad: 4 }), P.f) + ln('M137,158 L150,198 L163,158', P.c2, 2.4, 1) + ln(`M${r1(150 - hw(372) - 4)},372 L${r1(150 + hw(372) + 4)},372`, P.c2, 4, 1), arm: p(SLV.elbow, P.f) + ln('M73,246 L94,249', P.c2, 3, 1) }), { c1: '#ff9500', c2: '#d4af37', two: true, ...EV('navratri', 3) });
Ht('maangtikka', 'Maang Tikka', ['desi', 'festive', 'royal', 'wedding'], P => ln('M150,46 L150,74', P.c1, 1.6, 1) + p('M150,74 Q143,82 150,90 Q157,82 150,74 Z', P.c1) + circ(150, 82, 2.6, P.c2), { c1: '#d4af37', c2: '#e0245e', two: true, noPat: true, ...EV('navratri', 4) });
S('juttis', 'Mojari Juttis', ['desi', 'festive', 'elegant'], P => p('M124,528 L146,528 Q150,544 143,552 Q131,557 121,546 Z', P.f) + [534, 540, 546].map(y => circ(135, y, 1.2, P.c2)).join(''), { c1: '#d4af37', c2: '#e0245e', two: true, ...EV('navratri', 6) });
Dr('chaniyacholi', 'Chaniya Choli', ['desi', 'festive', 'party', 'cute'], P => ({ main: p(torso(186, 234, { neck: 'sweet' }), P.c2) + p(skirt(284, 540, 72, { hem: 6 }), P.f) + ln(`M${r1(150 - hw(322) - 72)},534 Q150,550 ${r1(150 + hw(322) + 72)},534`, P.c2, 9, 1) + ln('M110,288 L190,288', P.c2, 5, 1), arm: p(SLV.elbow, P.c2) }), { c1: '#e0245e', c2: '#ffd60a', pat: 'mirror', two: true, ...EV('navratri', 8) });
Bg('dandiya', 'Dandiya Sticks', ['desi', 'festive', 'party'], P => ln('M60,298 L96,362', P.c1, 4.5, 1) + ln('M96,298 L60,362', P.c2, 4.5, 1) + ln('M66,309 L70,316 M90,309 L86,316', '#fff', 4, .9), { c1: '#e0245e', c2: '#ffd60a', two: true, noPat: true, ...EV('navratri', 10) });
Gl('mehendi', 'Mehendi Hands', ['desi', 'festive', 'wedding', 'romantic'], P => ln('M72,324 Q78,318 84,324 M73,331 Q78,327 83,331 M74,337 L82,337 M76,300 Q79,296 82,300 M75,308 Q79,304 83,308', P.c1, 1.2, .95) + circ(78, 334, 1.6, P.c1), { c1: '#8b3a1a', noPat: true, ...EV('navratri', 12) });
Bk('dupatta', 'Dupatta', ['desi', 'festive', 'elegant', 'wedding'], P => ({ main: p('M106,162 Q84,300 96,472 L120,470 Q108,300 124,168 Z', P.f, 'fill-opacity=".9"'), front: p('M108,156 Q146,200 194,296 L204,280 Q156,186 122,150 Z', P.f, 'fill-opacity=".88"') + ln('M108,156 Q146,200 194,296', P.c2, 2.4, 1) }), { c1: '#ff4fa3', c2: '#ffd60a', pat: 'bandhani', two: true, ...EV('navratri', 14) });
MK('facedeco', 'fd-nath', 'Nath Nose Ring', ['desi', 'festive', 'wedding', 'royal'], P => `<circle cx="144" cy="113" r="5.2" fill="none" stroke="${P.c1}" stroke-width="1.4"/>` + ln('M140,111 Q126,112 117,106', P.c1, .9, 1) + circ(141, 117.5, 1.4, '#fff'), { c1: '#d4af37', ...EV('navratri', 16) });
H('gajra', 'Gajra Bun', ['desi', 'festive', 'wedding', 'elegant'], P => ({ back: p(HB, P.f) + circ(150, 36, 20, P.f, OL) + range(0, 330, 30).map(a => circ(r1(150 + 22 * Math.cos(a * Math.PI / 180)), r1(36 + 22 * Math.sin(a * Math.PI / 180)), 4.2, '#fffdf6', OL)).join(''), main: p(CAP_MID, P.f) }), { c1: '#111111', ...EV('navratri', 18) });
Dr('saree', 'Silk Saree', ['desi', 'festive', 'elegant', 'wedding', 'formal'], P => ({ main: p(torso(176, 232, { neck: 'scoop' }), P.c2) + p(skirt(278, 548, 22), P.f) + ln(`M${r1(150 - hw(322) - 24)},544 Q150,556 ${r1(150 + hw(322) + 24)},544`, P.c2, 6, 1) + [-12, 0, 12].map(x => ln(`M${150 + x},300 L${150 + x * 1.6},544`, P.d, 1.2, .5)).join('') + p('M184,152 L204,162 L198,252 L120,304 L104,288 Q164,232 184,152 Z', P.f) + ln('M104,288 L120,304 L198,252', P.c2, 4, 1), arm: p(SLV.cap, P.c2) }), { c1: '#7a1f3d', c2: '#d4af37', two: true, ...EV('navratri', 21) });
Dr('lehenga', 'Royal Lehenga', ['desi', 'festive', 'wedding', 'royal', 'formal'], P => ({ main: p(torso(186, 238, { neck: 'sweet' }), P.c2) + p(skirt(282, 552, 86, { hem: 8 }), P.f) + ln(`M${r1(150 - hw(322) - 86)},546 Q150,564 ${r1(150 + hw(322) + 86)},546`, P.c2, 10, 1) + ln(`M${r1(150 - hw(322) - 66)},500 Q150,516 ${r1(150 + hw(322) + 66)},500`, P.c2, 3, 1) + ln('M108,286 L192,286', P.c2, 6, 1), arm: p(SLV.elbow, P.c2) }), { c1: '#e0245e', c2: '#d4af37', pat: 'paisley', two: true, ...EV('navratri', 24) });
N('templeneck', 'Temple Necklace', ['desi', 'festive', 'royal', 'wedding'], P => `<path d="M130,156 Q150,196 170,156" fill="none" stroke="${P.c1}" stroke-width="4"/>` + range(.1, .9, .1).map(t => { const [x, y] = qpt([130, 156], [150, 196], [170, 156], t); return circ(r1(x), r1(y + 4), 2.4, P.c1, OL); }).join('') + p('M150,178 Q140,188 150,200 Q160,188 150,178 Z', P.c1) + circ(150, 188, 3, P.c2), { c1: '#d4af37', c2: '#e0245e', two: true, noPat: true, ...EV('navratri', 27) });
Ht('durgacrown', 'Goddess Mukut', ['desi', 'festive', 'royal'], P => ({ back: `<path d="M100,78 A50,50 0 0,1 200,78" fill="none" stroke="${P.c1}" stroke-width="6" opacity=".55"/>`, main: p('M116,66 L120,30 L132,42 L140,12 L150,32 L160,12 L168,42 L180,30 L184,66 Z', P.f) + circ(150, 50, 5, P.c2, OL) + both(circ(132, 54, 3, P.c2)) }), { c1: '#d4af37', c2: '#e0245e', two: true, ...EV('navratri', 30) });

/* ===== BADDIE PASS (season 1) ===== */
const PASS = (tier, prem) => ({ pass: tier, prem });
const LASH_EYE = { w: 'M127,99 Q136,89 145,98 Q136,105 127,99 Z', lid: 'M125,99 Q136,86 147,96 M126,98 L121,94 M129,94 L126,89 M133,91 L131,86 M138,90 L138,85 M142,92 L144,87', lw: 2.6 };
const WING = 'M126,196 Q70,128 32,96 Q18,156 42,206 Q28,236 58,260 Q50,288 88,298 Q104,256 126,236 Z';
Tp('bodysuit', 'Baddie Bodysuit', ['baddie', 'party', 'elegant', 'street', 'glam'], P => ({ main: p(torso(160, 322, { neck: 'scoop', pad: .5, hem: 16 }), P.f), arm: p(SLV.long, P.f) }), { c1: '#111111', ...PASS(1, true) });
I('eyes', 'e-lash', 'Lash Extensions', ['baddie', 'party', 'elegant', 'glam'], P => eyeMarkup(P, LASH_EYE), { noPat: true, c1: '#3b2416', ...PASS(2, false) });
Dr('snatched', 'Snatched Mini', ['baddie', 'party', 'glam'], P => ({ main: p(torso(188, 346, { neck: 'sweet', hem: 4 }), P.f) + both(ln('M126,202 L130,300', P.d, 1.2, .6)) + ln('M150,206 L150,300', P.d, 1.2, .6) }), { c1: '#e8c4a8', ...PASS(3, true) });
I('lips', 'l-gloss', 'Glossy Lips', ['baddie', 'party', 'elegant', 'glam'], P => p('M140,121 Q145,115 150,117.5 Q155,115 160,121 Q150,129 140,121 Z', P.c1) + '<ellipse cx="151" cy="124" rx="4.5" ry="1.4" fill="#fff" opacity=".7"/>', { noPat: true, c1: '#c97b6b', ...PASS(4, false) });
H('lacefront', 'Sleek Lace Front', ['baddie', 'elegant', 'party', 'glam'], P => ({ back: p('M113,82 Q110,40 150,40 Q190,40 187,82 L202,334 Q150,346 98,334 Z', P.f), main: p('M112,104 Q108,44 150,44 Q192,44 188,104 Q182,66 150,58 Q118,66 112,104 Z', P.f) + both(p('M114,88 Q104,200 108,324 L122,320 Q118,200 124,98 Z', P.f)) }), { c1: '#111111', ...PASS(4, true) });
S('thighboots', 'Thigh-High Boots', ['baddie', 'party', 'edgy', 'glam'], P => p(leg(352, 528, 1.4), P.f) + p(HEEL, P.f) + ln('M108,358 L149,358', P.l, 2, .6), { c1: '#111111', ...PASS(5, true) });
E('blinghoops', 'Bling Hoops', ['baddie', 'party', 'street', 'y2k'], P => `<circle cx="114" cy="122" r="12" fill="none" stroke="${P.c1}" stroke-width="3"/><path d="${sparkle(104, 116, 3.5)}" fill="#fff"/>`, { c1: '#d4af37', ...PASS(6, false) });
Tp('rhinecorset', 'Rhinestone Corset', ['baddie', 'party', 'glam', 'formal'], P => ({ main: p(torso(194, 294, { neck: 'sweet', hem: 10 }), P.f) + both(ln('M126,202 L132,292')) }), { c1: '#c0c0c0', c2: '#ffffff', pat: 'sparkle', ...PASS(6, true) });
Gs('shieldshades', 'Baddie Shield Shades', ['baddie', 'street', 'party', 'futuristic'], P => p('M110,90 Q150,84 190,90 L186,106 Q150,112 114,106 Z', P.f) + both(circ(118, 94, 1.8, '#d4af37')), { c1: '#111111', ...PASS(7, true) });
Ht('bandana', 'Bandana', ['baddie', 'street', 'western', 'edgy'], P => p('M112,74 Q110,40 150,38 Q190,40 188,74 Q150,64 112,74 Z', P.f) + p('M186,70 L200,82 L190,88 L184,76 Z', P.f), { c1: '#e0245e', c2: '#ffffff', pat: 'paisley', ...PASS(8, false) });
O('croppuffer', 'Cropped Puffer', ['baddie', 'street', 'winter'], P => ({ main: both(p(jacketHalf(224, 2, { pad: 10, close: 170 }), P.f) + ln(`M${r1(150 - hw(190) - 10)},190 L148,190`)), arm: p(SLV.puffy, P.f) + ln('M66,240 L100,240') + ln('M61,290 L96,290') }), { c1: '#111111', ...PASS(8, true) });
Bg('designerbag', 'Quilted Shoulder Bag', ['baddie', 'elegant', 'party', 'glam'], P => `<path d="M60,342 Q78,300 96,342" fill="none" stroke="#d4af37" stroke-width="2.4" stroke-dasharray="3 1.6"/><rect x="56" y="338" width="44" height="32" rx="5" fill="${P.f}" ${OL}/>` + ln('M56,348 L72,338 M56,360 L84,338 M64,370 L98,342 M78,370 L100,354 M100,348 L84,338 M100,360 L72,338 M92,370 L58,342', P.l, .8, .5) + circ(78, 352, 3.4, '#d4af37'), { c1: '#111111', ...PASS(9, true) });
Gl('acrylics', 'Long Acrylics', ['baddie', 'party', 'glam'], P => [72.5, 76, 79.5, 83].map(x => `<ellipse cx="${x}" cy="343" rx="1.7" ry="4.6" fill="${P.c1}" stroke="#2b1a24" stroke-opacity=".4" stroke-width=".6"/>`).join(''), { c1: '#ff4fa3', noPat: true, ...PASS(10, false) });
N('icedchain', 'Iced Out Chain', ['baddie', 'street', 'party'], P => `<path d="M130,156 Q150,200 170,156" fill="none" stroke="${P.c1}" stroke-width="3.6" stroke-dasharray="2.4 1.2"/>` + p(star(150, 186, 8), P.c1) + `<path d="${sparkle(156, 180, 3)}" fill="#fff"/>`, { c1: '#e6f4ff', noPat: true, ...PASS(10, true) });
Dr('bodyconmaxi', 'Bodycon Maxi', ['baddie', 'party', 'elegant', 'formal', 'glam'], P => ({ main: p(torso(184, 332), P.f) + p(straight(330, 548, 6), P.f) + ln('M166,430 L168,548', P.d, 1.4, .8) + straps(P.c1) }), { c1: '#7a1f3d', ...PASS(11, true) });
MK('shadow', 's-baddie', 'Baddie Beat', ['baddie', 'party', 'glam', 'elegant'], P => both(`<ellipse cx="136" cy="92" rx="12" ry="6.5" fill="${P.c1}" opacity=".6"/>` + p('M147,97 Q136,89 125,94 L116,87 L123,98 Z', '#111', 'stroke-width=".5"') + `<path d="${sparkle(140, 90, 2)}" fill="#fff"/>`), { c1: '#a2845e', ...PASS(12, false) });
Bg('blingphone', 'Rhinestone Phone', ['baddie', 'party', 'pop'], P => `<rect x="66" y="304" width="24" height="38" rx="5" fill="${P.f}" ${OL}/>` + ln('M72,342 Q70,354 76,358', '#d4af37', 1.2, 1) + p(heart(77, 361, 3), '#ff4fa3'), { c1: '#ff8fc8', c2: '#ffffff', pat: 'sparkle', ...PASS(12, true) });
Ht('furbucket', 'Fur Bucket Hat', ['baddie', 'winter', 'street', 'y2k'], P => p('M114,74 L120,34 Q150,26 180,34 L186,74 Z', P.f) + p('M102,82 L114,68 L186,68 L198,82 Q150,92 102,82 Z', P.f), { c1: '#e8c49a', c2: '#3b2416', pat: 'leopard', ...PASS(13, true) });
H('baddiebun', 'Sleek Baddie Bun', ['baddie', 'elegant', 'street', 'party'], P => ({ back: p(HB, P.f) + `<ellipse cx="150" cy="30" rx="22" ry="16" fill="${P.f}" ${OL}/>`, main: p(CAP_SLICK, P.f) + ln('M124,76 q5,3 1,8 q-3,2 -1,4 M176,76 q-5,3 -1,8 q3,2 1,4', P.d, 1.2, .9) }), { c1: '#111111', ...PASS(14, false) });
O('motojacket', 'Moto Jacket', ['baddie', 'rock', 'edgy', 'street'], P => ({ main: both(p(jacketHalf(244, 6, { pad: 4 }), P.f) + p('M138,152 L142,196 L120,184 Z', P.d)) + ln('M128,170 L160,236', '#c0c0c0', 1.6, 1), arm: p(SLV.long, P.f) + ln('M70,262 L92,266', '#c0c0c0', 1.4, 1) }), { c1: '#111111', ...PASS(14, true) });
Bk('baddiewings', 'Dark Angel Wings', ['baddie', 'goth', 'party', 'glam'], P => both(p(WING, P.f)), { c1: '#111111', c2: '#d4af37', pat: 'sparkle', ...PASS(15, true) });


/* ===== FESTIVALS OF INDIA (free pieces; some priced) ===== */
const FEST = { fest: true };
const SAREE = P => ({ main: p(torso(176, 232, { neck: 'scoop' }), P.c2) + p(skirt(278, 548, 22), P.f) + ln(`M${r1(150 - hw(322) - 24)},544 Q150,556 ${r1(150 + hw(322) + 24)},544`, P.c2, 6, 1) + [-12, 0, 12].map(x => ln(`M${150 + x},300 L${150 + x * 1.6},544`, P.d, 1.2, .5)).join('') + p('M184,152 L204,162 L198,252 L120,304 L104,288 Q164,232 184,152 Z', P.f) + ln('M104,288 L120,304 L198,252', P.c2, 4, 1), arm: p(SLV.cap, P.c2) });
// Holi
Tp('holikurta', 'Holi Kurta', ['holi', 'desi', 'festive', 'casual'], P => ({ main: p(torso(158, 380, { neck: 'v', pad: 4 }), P.f) + ln('M137,158 L150,196 L163,158', P.d, 2, .6), arm: p(SLV.elbow, P.f) }), { c1: '#ffffff', c2: '#ff4fa3', pat: 'gulal', ...FEST });
MK('facedeco', 'fd-gulal', 'Gulal Colors', ['holi', 'festive', 'party'], P => `<g filter="url(#${P.uid}-soft)" opacity=".75">${[[126, 110, '#ff4fa3', 8], [175, 108, '#34c759', 7], [150, 70, '#ffd60a', 8], [134, 124, '#5ab4ff', 5], [166, 125, '#bf5af2', 5]].map(([x, y, c, r]) => circ(x, y, r, c)).join('')}</g>`, FEST);
Bg('pichkari', 'Pichkari', ['holi', 'festive', 'cute'], P => `<rect x="46" y="320" width="44" height="12" rx="5" fill="${P.c1}" ${OL}/><rect x="38" y="323" width="9" height="6" fill="${P.d}" ${OL}/><circle cx="84" cy="314" r="9" fill="${P.c2}" ${OL}/><rect x="74" y="330" width="8" height="16" rx="3" fill="${P.d}" ${OL}/>` + [[30, 322], [21, 317], [13, 326]].map(([x, y]) => circ(x, y, 2.4, P.c2)).join(''), { c1: '#ffd60a', c2: '#ff4fa3', two: true, noPat: true, ...FEST });
// Raksha Bandhan
Gl('rakhi', 'Rakhi', ['rakhi', 'desi', 'festive', 'cute'], P => ln('M68,306 L90,308', P.c1, 2.4, 1) + [0, 72, 144, 216, 288].map(a => circ(r1(79 + 4.5 * Math.cos(a * Math.PI / 180)), r1(307 + 4.5 * Math.sin(a * Math.PI / 180)), 3, P.c2, OL)).join('') + circ(79, 307, 2.6, '#d4af37', OL), { c1: '#e0245e', c2: '#ffd60a', two: true, noPat: true, ...FEST });
Bg('thali', 'Pooja Thali', ['rakhi', 'diwali', 'desi', 'festive'], P => `<ellipse cx="78" cy="324" rx="27" ry="7.5" fill="${P.c1}" ${OL}/>` + circ(62, 320, 3.6, '#ff9500', OL) + circ(69, 317, 3.6, '#ffd60a', OL) + circ(94, 320, 3, '#e0245e', OL) + p('M76,320 Q82,326 88,320 Q86,316 82,317 Q78,316 76,320 Z', '#b5562b') + '<path d="M82,317 Q79,311 82,305 Q85,311 82,317 Z" fill="#ffd60a"/>', { c1: '#d4af37', noPat: true, ...FEST });
// Eid
Dr('sharara', 'Sharara Set', ['eid', 'desi', 'festive', 'elegant', 'wedding'], P => ({ main: p(pants(330, 542, { pad: 3, flare: 28 }), P.f) + p(torso(158, 350, { neck: 'v', pad: 4 }), P.f) + ln(`M${r1(150 - hw(344) - 4)},344 L${r1(150 + hw(344) + 4)},344`, P.c2, 4, 1) + ln('M137,158 L150,196 L163,158', P.c2, 2.4, 1), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#2d6a4f', c2: '#d4af37', two: true, ...FEST });
Ht('hijab', 'Embroidered Hijab', ['eid', 'elegant', 'festive', 'modest'], P => ({ back: p('M100,96 Q100,40 150,36 Q200,40 200,96 L208,210 Q150,226 92,210 Z', P.f), main: `<path d="M108,98 Q104,34 150,32 Q196,34 192,98 Q196,146 184,170 Q150,184 116,170 Q104,146 108,98 Z M150,62 A30,37 0 1,0 150,136 A30,37 0 1,0 150,62 Z" fill="${P.f}" fill-rule="evenodd" ${OL}/>` + ln('M122,70 Q150,56 178,70', P.c2, 2, .9) }), { c1: '#c9a7ff', c2: '#d4af37', two: true, hidesHair: true, ...FEST });
E('chaand', 'Chaand Earrings', ['eid', 'festive', 'elegant'], P => p('M114,112 A8,8 0 1,0 121,126 A6,6 0 1,1 114,112 Z', P.c1) + circ(116, 109, 1.4, P.c1), { c1: '#d4af37', ...FEST });
// Makar Sankranti / Pongal / Onam
Bg('kite', 'Patang Kite', ['harvest', 'festive', 'cute', 'desi'], P => ln('M78,330 Q58,300 70,256', '#ffffff', 1, .9) + p('M70,190 L94,222 L70,256 L46,222 Z', P.f) + ln('M70,190 L70,256 M46,222 L94,222', P.d, 1, .6) + p('M70,256 L64,268 L76,268 Z', P.c2), { c1: '#ff4fa3', c2: '#ffd60a', two: true, ...FEST });
Dr('pavadai', 'Pattu Pavadai', ['harvest', 'onam', 'desi', 'festive', 'cute'], P => ({ main: p(torso(170, 262, { neck: 'crew' }), P.c2) + p(skirt(262, 530, 40), P.f) + ln(`M${r1(150 - hw(322) - 42)},524 Q150,538 ${r1(150 + hw(322) + 42)},524`, '#d4af37', 10, 1) + ln('M112,268 L188,268', '#d4af37', 5, 1), arm: p(SLV.puff, P.c2) }), { c1: '#bf5af2', c2: '#2d6a4f', two: true, ...FEST });
Dr('kasavu', 'Kasavu Saree', ['onam', 'desi', 'festive', 'elegant'], SAREE, { c1: '#f5e6c8', c2: '#d4af37', two: true, ...FEST });
Ht('mullappoo', 'Jasmine Mullappoo', ['onam', 'desi', 'festive', 'wedding'], () => range(0, 1, 1 / 9).map(t => { const [x, y] = qpt([168, 52], [206, 92], [192, 150], t); return circ(r1(x), r1(y), 4, '#fffdf6', OL); }).join('') + circ(166, 52, 5, '#ff9500', OL), { noPat: true, ...FEST });
// Ganesh Chaturthi
Bg('modak', 'Modak Plate', ['ganesh', 'festive', 'desi'], P => `<ellipse cx="78" cy="326" rx="24" ry="6.5" fill="${P.c1}" ${OL}/>` + [[66, 320], [78, 316], [90, 320]].map(([x, y]) => p(`M${x},${y - 10} Q${x - 8},${y} ${x - 6},${y + 4} L${x + 6},${y + 4} Q${x + 8},${y} ${x},${y - 10} Z`, '#fff3d6')).join(''), { c1: '#d4af37', noPat: true, ...FEST });
Dr('nauvari', 'Nauvari Saree', ['ganesh', 'desi', 'festive', 'elegant'], P => ({ main: p(pants(276, 520, { pad: 6 }), P.f) + both(ln('M120,514 L148,514', P.c2, 6, 1)) + p(torso(176, 232, { neck: 'scoop' }), P.c2) + p('M184,152 L204,162 L196,252 L120,300 L104,286 Q164,232 184,152 Z', P.f) + ln('M104,286 L120,300 L196,252', P.c2, 4, 1), arm: p(SLV.elbow, P.c2) }), { c1: '#2d6a4f', c2: '#e0245e', two: true, ...FEST });
Ht('pheta', 'Saffron Pheta', ['ganesh', 'wedding', 'festive', 'desi'], P => p('M110,80 Q104,30 150,26 Q196,30 190,80 Q150,66 110,80 Z', P.f) + ln('M112,70 Q150,48 188,62 M114,58 Q150,36 186,50', P.d, 1.6, .6) + p('M180,40 Q210,30 214,4 Q200,22 176,30 Z', P.f), { c1: '#ff9500', c2: '#ffd60a', pat: 'bandhani', ...FEST });
// Karva Chauth
Bg('channi', 'Karva Chauth Channi', ['karva', 'desi', 'festive', 'romantic'], P => `<circle cx="78" cy="298" r="22" fill="${P.c1}" fill-opacity=".35" stroke="#d4af37" stroke-width="4"/>` + ln('M62,284 L94,312 M94,284 L62,312 M58,298 L98,298 M78,278 L78,318', '#d4af37', .8, .8), { c1: '#e0245e', noPat: true, ...FEST });
Gl('chooda', 'Bridal Chooda', ['karva', 'wedding', 'desi', 'festive'], P => range(258, 314, 5).map((y, i) => `<ellipse cx="${r1(81 - (y - 258) * .05)}" cy="${y}" rx="${r1(10.5 + (y - 258) * .02)}" ry="2.6" fill="none" stroke="${i % 3 === 2 ? '#ffffff' : P.c1}" stroke-width="3"/>`).join(''), { c1: '#c2185b', noPat: true, ...FEST });
MK('facedeco', 'fd-tikli', 'Red Bindi & Tikli', ['karva', 'wedding', 'desi', 'festive'], () => circ(150, 81, 3.6, '#e0245e') + [[143, 80], [157, 80], [150, 74]].map(([x, y]) => circ(x, y, .9, '#d4af37')).join(''), FEST);
// Lohri / Baisakhi
Bk('phulkari', 'Phulkari Dupatta', ['harvest', 'desi', 'festive', 'cottage'], P => ({ main: p('M106,162 Q84,300 96,472 L120,470 Q108,300 124,168 Z', P.f), front: p('M108,156 Q146,200 194,296 L204,280 Q156,186 122,150 Z', P.f) + ln('M108,156 Q146,200 194,296', P.c2, 2.4, 1) }), { c1: '#e0245e', c2: '#ffd60a', pat: 'phulkari', two: true, ...FEST });
B('patiala', 'Patiala Salwar', ['harvest', 'desi', 'festive', 'casual'], P => p(pants(266, 522, { pad: 10 }), P.f) + both(ln('M104,300 Q112,380 122,470 M114,300 Q120,380 128,470', P.d, 1.2, .5) + ln('M120,516 L146,516', P.d, 5, .7)), { c1: '#ffd60a', ...FEST });
H('paranda', 'Paranda Braid', ['harvest', 'desi', 'festive', 'cottage'], P => ({ back: p(HB, P.f), main: p(CAP_MID, P.f) + range(0, 10, 1).map(i => `<ellipse cx="${r1(120 - i * .6)}" cy="${118 + i * 21}" rx="8.5" ry="12" fill="${P.f}" ${OL}/>`).join('') + ln('M114,330 L112,360 M118,330 L118,364 M122,330 L124,360', P.c2, 2.4, 1) + circ(112, 362, 3.4, P.c2) + circ(118, 366, 3.4, P.c2) + circ(124, 362, 3.4, P.c2) }), { c1: '#111111', c2: '#e0245e', two: true, ...FEST });
Bg('dhol', 'Dhol', ['harvest', 'festive', 'desi', 'party'], P => `<rect x="46" y="332" width="64" height="40" rx="18" fill="${P.f}" ${OL}/><ellipse cx="46" cy="352" rx="7" ry="20" fill="#f5e6c8" ${OL}/><ellipse cx="110" cy="352" rx="7" ry="20" fill="#f5e6c8" ${OL}/>` + ln('M52,334 L104,370 M52,370 L104,334', P.c2, 1.4, .9), { c1: '#e0245e', c2: '#ffd60a', two: true, ...FEST });
// Janmashtami
Ht('morpankh', 'Peacock Feather Crown', ['krishna', 'desi', 'festive', 'royal'], P => p('M120,64 L124,44 L150,38 L176,44 L180,64 Z', P.f) + `<ellipse cx="160" cy="18" rx="9" ry="20" fill="#2d6a4f" transform="rotate(20 160 18)" ${OL}/><ellipse cx="161" cy="14" rx="5" ry="8" fill="#0a84ff" transform="rotate(20 161 14)"/>` + circ(161, 13, 2.6, '#1d3557') + circ(150, 52, 3.4, '#e0245e'), { c1: '#d4af37', noPat: true, ...FEST });
Bg('bansuri', 'Bansuri Flute', ['krishna', 'desi', 'festive'], P => `<rect x="40" y="320" width="80" height="6" rx="3" fill="${P.c1}" ${OL}/>` + [52, 60, 68, 92, 100].map(x => circ(x, 323, 1.3, '#3b2416')).join('') + ln('M106,323 L112,340', '#e0245e', 1.6, 1), { c1: '#c8a878', noPat: true, ...FEST });
Bg('matki', 'Makhan Matki', ['krishna', 'desi', 'cute'], P => `<ellipse cx="78" cy="354" rx="22" ry="20" fill="${P.f}" ${OL}/><rect x="66" y="330" width="24" height="8" rx="3" fill="${P.d}" ${OL}/>` + ln('M58,352 Q78,360 98,352', '#fff', 2, .8), { c1: '#b5562b', ...FEST });
// Bihu
Dr('mekhela', 'Mekhela Chador', ['bihu', 'desi', 'festive', 'elegant'], P => ({ main: p(torso(176, 232, { neck: 'scoop' }), P.c2) + p(skirt(276, 540, 12), P.f) + ln(`M${r1(150 - hw(322) - 14)},532 Q150,544 ${r1(150 + hw(322) + 14)},532`, P.c2, 8, 1) + p('M184,152 L204,162 L198,252 L120,304 L104,288 Q164,232 184,152 Z', P.f) + ln('M104,288 L120,304 L198,252', P.c2, 5, 1), arm: p(SLV.elbow, P.c2) }), { c1: '#f5e6c8', c2: '#c2185b', two: true, ...FEST });
N('gamosa', 'Gamosa', ['bihu', 'desi', 'festive'], P => both(p('M138,150 Q128,160 126,240 L140,240 Q140,170 150,158 Z', P.f) + ln('M126,234 L140,234', P.c2, 4, 1)), { c1: '#ffffff', c2: '#e0245e', two: true, ...FEST });
// Teej
Dr('lehariya', 'Lehariya Saree', ['teej', 'desi', 'festive', 'elegant'], SAREE, { c1: '#34c759', c2: '#ffd60a', pat: 'lehariya', two: true, ...FEST });
// Independence Day / Republic Day
N('tirangascarf', 'Tiranga Scarf', ['tiranga', 'festive', 'casual'], P => `<linearGradient id="${P.uid}-tri" x1="0" y1="0" x2="1" y2="0"><stop offset=".33" stop-color="#ff9933"/><stop offset=".33" stop-color="#ffffff"/><stop offset=".66" stop-color="#ffffff"/><stop offset=".66" stop-color="#138808"/></linearGradient>` + p('M134,138 Q150,152 166,138 L171,162 Q150,174 129,162 Z', `url(#${P.uid}-tri)`) + p('M156,160 L172,236 L154,238 L148,166 Z', `url(#${P.uid}-tri)`), { noPat: true, ...FEST });
Bg('flag', 'Tiranga Flag', ['tiranga', 'festive'], () => ln('M78,334 L78,250', '#8b5a2b', 2.4, 1) + '<rect x="78" y="250" width="42" height="9" fill="#ff9933"/><rect x="78" y="259" width="42" height="9" fill="#ffffff"/><rect x="78" y="268" width="42" height="9" fill="#138808"/><circle cx="99" cy="263.5" r="3.4" fill="none" stroke="#000080" stroke-width="1"/>', { noPat: true, ...FEST });
MK('facedeco', 'fd-tiranga', 'Tiranga Face Paint', ['tiranga', 'festive', 'sporty'], () => '<rect x="118" y="108" width="12" height="3" fill="#ff9933"/><rect x="118" y="111" width="12" height="3" fill="#ffffff"/><rect x="118" y="114" width="12" height="3" fill="#138808"/>', FEST);
// everyday festive wear
Dr('anarkali', 'Anarkali Suit', ['desi', 'festive', 'elegant', 'wedding', 'eid', 'diwali'], P => ({ main: p(torso(158, 238, { neck: 'crew' }), P.f) + p(`M${r1(150 - hw(236) - 2)},236 L${r1(150 + hw(236) + 2)},236 L${r1(150 + hw(236) + 62)},520 Q150,532 ${r1(150 - hw(236) - 62)},520 Z`, P.f) + ln(`M${r1(150 - hw(236) - 60)},512 Q150,524 ${r1(150 + hw(236) + 60)},512`, P.c2, 6, 1) + ln('M110,240 L190,240', P.c2, 4, 1), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#c2185b', c2: '#d4af37', two: true, ...FEST });
O('sherwani', 'Sherwani', ['desi', 'wedding', 'festive', 'formal', 'royal'], P => ({ main: both(p(jacketHalf(440, 1, { pad: 4, flare: .06, close: 170 }), P.f)) + range(176, 420, 22).map(y => circ(150, y, 2.4, P.c2)).join(''), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#f5e6c8', c2: '#d4af37', pat: 'paisley', two: true, price: 500, ...FEST });
O('nehru', 'Nehru Jacket', ['desi', 'festive', 'office', 'formal'], P => ({ main: both(p(jacketHalf(300, 1, { pad: 2, close: 170 }), P.f)) + range(180, 290, 22).map(y => circ(150, y, 2.2, P.c2)).join('') }), { c1: '#1d3557', c2: '#d4af37', two: true, ...FEST });
S('kolhapuri', 'Kolhapuri Chappals', ['desi', 'festive', 'casual', 'summer'], P => p('M122,546 L149,546 L149,553 Q136,556 122,553 Z', P.d) + ln('M125,536 L145,536 M124,543 L146,543', P.c1, 4, 1) + circ(128, 528, 2.4, P.c1), { c1: '#a2845e', ...FEST });
N('kundan', 'Kundan Choker', ['desi', 'wedding', 'festive', 'royal'], P => p('M134,140 Q150,150 166,140 L166,152 Q150,162 134,152 Z', P.c1) + [138, 144, 150, 156, 162].map(x => circ(x, 149, 2.2, P.c2, OL) + circ(x, 160, 1.6, '#fff')).join(''), { c1: '#d4af37', c2: '#2d6a4f', two: true, noPat: true, ...FEST });
W('payal', 'Payal Anklets', ['desi', 'festive', 'wedding'], () => ln('M124,520 Q134,524 146,520', '#e6e6f0', 1.6, 1) + [127, 131, 135, 139, 143].map(x => circ(x, 524, 1.3, '#e6e6f0')).join(''), { noPat: true, ...FEST });


/* ===== MORE HAIRSTYLES ===== */
const braidStrip = (x, y1, y2, w, f) => p(`M${x - w / 2},${y1} L${x + w / 2},${y1} L${x + w / 2 - 1},${y2} Q${x},${y2 + 4} ${x - w / 2 + 1},${y2} Z`, f) + ln(range(y1 + 6, y2 - 2, 7).map(y => `M${x - w / 2 + 1},${y} L${x + w / 2 - 1},${y + 3}`).join(' '), '#000', 1, .25);
H('halfup', 'Half-Up Half-Down', ['romantic', 'casual', 'cute', 'kpop'], P => ({ back: p(LONG_BACK, P.f) + circ(150, 40, 12, P.f, OL), main: p(CAP_SLICK, P.f) + both(p(SIDE_STRAND, P.f)) }), { c1: '#8b5a2b' });
H('hime', 'Hime Cut', ['kpop', 'elegant', 'cute', 'goth'], P => ({ back: p('M110,82 Q106,40 150,40 Q194,40 190,82 L194,262 L106,262 Z', P.f), main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L186,80 L114,80 Z', P.f) + both(p('M113,80 L110,134 L125,134 L121,84 Z', P.f)) }), { c1: '#111111' });
H('butterflycut', 'Butterfly Layers', ['kpop', 'glam', 'baddie', 'elegant'], P => ({ back: p('M112,82 Q108,40 150,40 Q192,40 188,82 Q206,120 194,150 Q210,190 196,236 Q172,250 150,244 Q128,250 104,236 Q90,190 106,150 Q94,120 112,82 Z', P.f), main: p('M113,106 Q108,44 150,44 Q192,44 187,106 Q183,76 157,66 L150,72 L143,66 Q117,76 113,106 Z', P.f) + both(p('M114,92 Q100,130 112,156 Q102,180 110,200 L122,190 Q114,170 124,150 Q114,128 124,100 Z', P.f)) }), { c1: '#5a3825' });
H('ringlets', 'Long Ringlet Curls', ['romantic', 'royal', 'cottage', 'party'], P => ({ back: p(LONG_BACK, P.f) + both(range(0, 7, 1).map(i => circ(106 - (i % 2) * 4, 108 + i * 20, 10, P.f, OL)).join('')), main: p(CAP_MID, P.f) + both(circ(116, 104, 7, P.f, OL) + circ(114, 120, 6.5, P.f, OL)) }), { c1: '#b5562b' });
H('boxbraids', 'Box Braids', ['street', 'baddie', 'casual', 'pop'], P => ({ back: p(HB, P.f) + range(104, 196, 9).map(x => braidStrip(x, 70, 300, 7, P.f)).join(''), main: p(CAP_MID, P.f) + both([114, 121].map(x => braidStrip(x, 90, 300, 7, P.f)).join('')) }), { c1: '#2a1a12' });
H('locs', 'Locs', ['street', 'casual', 'rock', 'summer'], P => ({ back: p(HB, P.f) + range(104, 196, 11).map(x => braidStrip(x, 70, 270, 9, P.f)).join(''), main: p(CAP_MID, P.f) + both(braidStrip(116, 92, 262, 9, P.f)) }), { c1: '#3b2416' });
H('sidepony', 'Side Ponytail', ['y2k', 'pop', 'cute', 'katseye'], P => ({ back: p(HB, P.f), main: p(CAP_SLICK, P.f) + p('M176,62 Q214,80 204,170 Q200,220 190,240 Q196,180 184,120 Q180,90 172,72 Z', P.f) + circ(178, 66, 6, P.c2, OL) }), { c1: '#3b2416', c2: '#ff4fa3', two: true });
H('lowpony', 'Low Sleek Pony', ['elegant', 'office', 'baddie', 'kpop'], P => ({ back: p(HB, P.f), main: p(CAP_SLICK, P.f) + p('M130,124 Q112,160 116,232 Q120,252 126,264 Q130,220 134,170 Q138,142 142,128 Z', P.f) + circ(136, 126, 4.5, P.d, OL) }), { c1: '#111111' });
H('messybun', 'Messy Bun', ['casual', 'cozy', 'street', 'olivia'], P => ({ back: p(HB, P.f) + circ(146, 36, 14, P.f, OL) + circ(160, 40, 12, P.f, OL) + circ(150, 26, 10, P.f, OL), main: p(CAP_MID, P.f) + both(ln('M118,86 Q112,110 118,132', P.f, 2.4, 1)) + ln('M160,30 Q172,20 170,12', P.f, 2, 1) }), { c1: '#8b5a2b' });
H('braidcrown', 'Braided Crown', ['cottage', 'royal', 'fairy', 'romantic'], P => ({ back: p(HB, P.f), main: p(CAP_SLICK, P.f) + range(0, 1, 1 / 10).map(t => { const [x, y] = qpt([114, 76], [150, 30], [186, 76], t); return `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="6" ry="4.5" fill="${P.f}" ${OL}/>`; }).join('') }), { c1: '#e3b04b' });
H('fishtail', 'Fishtail Braid', ['cottage', 'fairy', 'casual', 'beach'], P => ({ back: p(HB, P.f), main: p(CAP_MID, P.f) + range(0, 9, 1).map(i => `<ellipse cx="${126 + (i % 2 ? 4 : -4) + i * .6}" cy="${118 + i * 20}" rx="7" ry="11" fill="${P.f}" transform="rotate(${i % 2 ? 25 : -25} ${126 + i * .6} ${118 + i * 20})" ${OL}/>`).join('') + circ(132, 300, 4, P.c2, OL) }), { c1: '#c9a07a', c2: '#ffffff', two: true });
H('afropuffs', 'Afro Puffs', ['cute', 'pop', 'y2k', 'casual'], P => ({ back: p(HB, P.f) + both(circ(114, 50, 24, P.f, OL) + circ(106, 40, 8, P.f) + circ(122, 32, 8, P.f)), main: p(CAP_MID, P.f) }), { c1: '#2a1a12' });
H('koreanbob', 'Bob with See-Through Bangs', ['kpop', 'cute', 'y2k', 'office'], P => ({ back: p('M109,92 Q104,40 150,40 Q196,40 191,92 L193,140 Q150,148 107,140 Z', P.f), main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L184,82 L176,86 L168,80 L160,86 L150,80 L140,86 L132,80 L124,86 L116,82 Z', P.f) + both(p('M113,80 L109,138 L123,138 L121,86 Z', P.f)) }), { c1: '#3b2416' });
H('flipbob', '90s Flip Bob', ['y2k', 'olivia', 'pop', 'cute'], P => ({ back: p('M108,90 Q104,40 150,40 Q196,40 192,90 L194,136 Q208,148 200,158 Q150,150 100,158 Q92,148 106,136 Z', P.f), main: p('M113,104 Q106,44 150,42 Q194,44 187,104 Q184,76 168,63 Q150,80 121,78 Q115,90 113,104 Z', P.f) }), { c1: '#5a3825' });
H('shag', 'Curtain Shag', ['olivia', 'rock', 'edgy', 'casual'], P => ({ back: p('M110,86 Q106,40 150,40 Q194,40 190,86 L196,150 L186,168 L192,190 L176,184 L168,206 L150,196 L132,206 L124,184 L108,190 L114,168 L104,150 Z', P.f), main: p('M113,106 Q108,44 150,44 Q192,44 187,106 Q183,76 157,66 L150,72 L143,66 Q117,76 113,106 Z', P.f) + both(p('M114,92 L106,150 L118,160 L122,100 Z', P.f)) }), { c1: '#3b2416' });
H('twoblock', 'Idol Two-Block', ['kpop', 'street', 'casual', 'sporty'], P => ({ back: p('M116,96 Q114,46 150,44 Q186,46 184,96 L182,112 L118,112 Z', P.d), main: p('M114,92 Q110,44 150,40 Q190,44 186,92 L182,80 Q170,66 150,70 Q130,64 120,82 Z', P.f) + p('M120,60 Q150,50 178,62 L174,86 L162,78 L150,88 L138,78 L126,86 Z', P.f) }), { c1: '#111111' });
H('longbangs', 'Long Hair with Bangs', ['kpop', 'cute', 'romantic', 'casual'], P => ({ back: p(LONG_BACK, P.f), main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L186,80 Q150,86 114,80 Z', P.f) + both(p(SIDE_STRAND, P.f)) }), { c1: '#3b2416' });
H('hushcut', 'Hush Cut', ['kpop', 'olivia', 'edgy', 'street'], P => ({ back: p('M110,86 Q106,40 150,40 Q194,40 190,86 Q200,130 196,170 L184,176 L190,192 L172,186 L150,194 L128,186 L110,192 L116,176 L104,170 Q100,130 110,86 Z', P.f), main: p('M113,104 Q108,44 150,44 Q192,44 187,104 Q182,78 160,70 L154,80 L146,70 Q118,78 113,104 Z', P.f) + both(p('M114,90 Q104,120 110,150 L120,144 Q116,120 122,96 Z', P.f)) }), { c1: '#2a1438' });
H('slickback', 'Slicked Back', ['office', 'elegant', 'baddie', 'futuristic'], P => ({ back: p(HB, P.f), main: p('M114,90 Q110,40 150,38 Q190,40 186,90 Q178,58 150,54 Q122,58 114,90 Z', P.f) + ln('M130,50 Q140,44 150,42 M150,48 Q160,44 170,50 M124,62 Q136,52 148,50', P.l, 1, .5) }), { c1: '#111111' });
H('mullet', 'Mullet', ['rock', 'edgy', 'street', 'olivia'], P => ({ back: p('M112,92 Q108,42 150,40 Q192,42 188,92 L196,170 L184,180 L174,168 L162,178 L150,170 L138,178 L126,168 L116,180 L104,170 Z', P.f), main: p('M112,98 Q106,42 150,40 Q194,42 188,98 L184,80 L174,72 L166,82 L156,70 L146,82 L136,72 L126,82 L116,78 Z', P.f) }), { c1: '#8b5a2b' });
H('cornrowpony', 'Cornrow Ponytail', ['street', 'sporty', 'baddie', 'katseye'], P => ({ back: p(HB, P.f) + p('M160,46 Q206,36 202,110 Q200,175 180,228 Q194,165 180,108 Q174,70 156,52 Z', P.f), main: p(CAP_SLICK, P.f) + ln([-24, -14, -5, 5, 14, 24].map(dx => `M${150 + dx},${84 - Math.abs(dx) * .6} Q${150 + dx * 1.05},58 ${150 + dx * .5},40`).join(' '), P.d, 3, .7) }), { c1: '#2a1a12' });
H('twinribbons', 'Twin Ribbon Buns', ['kpop', 'cute', 'pop', 'y2k'], P => ({ back: p(HB, P.f) + both(circ(122, 48, 14, P.f, OL) + p('M110,62 L98,56 L100,70 Z', P.c2) + p('M116,64 L108,74 L120,72 Z', P.c2)), main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L186,80 Q150,86 114,80 Z', P.f) }), { c1: '#e3b04b', c2: '#ff4fa3', two: true });
H('splitdye', 'Split Dye', ['edgy', 'y2k', 'olivia', 'kpop'], P => ({
  back: p('M150,40 Q110,40 113,82 L104,256 Q128,266 150,259 Z', P.c1) + mir(p('M150,40 Q110,40 113,82 L104,256 Q128,266 150,259 Z', P.c2)),
  main: p('M150,42 Q106,44 113,104 Q115,90 121,78 Q138,76 150,70 Z', P.c1) + mir(p('M150,42 Q106,44 113,104 Q115,90 121,78 Q138,76 150,70 Z', P.c2)) + p(SIDE_STRAND, P.c1) + mir(p(SIDE_STRAND, P.c2)),
}), { c1: '#111111', c2: '#ff4fa3', two: true });
H('moneypiece', 'Money Piece Highlights', ['baddie', 'y2k', 'pop', 'glam'], P => ({ back: p(LONG_BACK, P.f), main: p(CAP_MID, P.f) + both(p('M115,86 Q106,160 110,246 L124,240 Q119,160 123,96 Z', P.c2)) }), { c1: '#3b2416', c2: '#f3e2a9', two: true });

/* ===== KATSEYE update (🐾 paw prints) ===== */
MK('shadow', 's-catwing', 'Sharp Cat Wing', ['katseye', 'edgy', 'glam', 'kpop'], P => both(p('M148,98 Q136,88 124,93 L110,82 L122,99 Q136,101 148,98 Z', P.c1, 'stroke-width=".5"')), { c1: '#111111', ...EV('katseye', 0) });
Tp('dancecrop', 'Dance Crop Top', ['katseye', 'dance', 'sporty', 'street'], P => ({ main: p(torso(182, 234, { neck: 'v' }), P.f) + both(ln('M127,184 L133,158', P.c1, 2.4, 1)) + ln('M106,226 L194,226', P.c2, 3, 1) }), { c1: '#111111', c2: '#ffffff', two: true, ...EV('katseye', 1) });
B('dancecargo', 'Baggy Dance Cargos', ['katseye', 'dance', 'street', 'sporty'], P => p(pants(292, 540, { pad: 12, flare: 8 }), P.f) + both(p('M98,384 L116,384 L117,420 L99,420 Z', P.f) + ln('M106,330 Q96,360 108,396', P.c2, 1.6, 1)), { c1: '#9aa0a6', c2: '#111111', ...EV('katseye', 2) });
H('stagepony', 'Sleek Stage Pony', ['katseye', 'kpop', 'dance', 'glam'], P => ({ back: p(HB, P.f) + p('M156,44 Q212,40 206,130 Q204,220 186,300 Q198,210 186,120 Q178,74 152,52 Z', P.f), main: p(CAP_SLICK, P.f) + both(ln('M118,86 Q114,112 120,134', P.f, 1.8, 1)) }), { c1: '#111111', ...EV('katseye', 3) });
S('dancesneakers', 'Chunky Dance Sneakers', ['katseye', 'dance', 'street', 'sporty'], P => p('M118,516 L148,516 L151,538 Q153,556 134,556 Q114,556 116,538 Z', P.f) + p('M113,542 Q114,562 134,562 Q154,562 153,542 Q134,550 113,542 Z', '#ffffff') + ln('M122,524 L146,530 M121,532 L148,538', P.c2, 2, 1), { c1: '#ffffff', c2: '#ff4fd8', two: true, ...EV('katseye', 4) });
N('silverchains', 'Layered Silver Chains', ['katseye', 'street', 'edgy', 'kpop'], P => `<path d="M132,158 Q150,190 168,158" fill="none" stroke="${P.c1}" stroke-width="1.6"/><path d="M128,160 Q150,212 172,160" fill="none" stroke="${P.c1}" stroke-width="2.2" stroke-dasharray="2 1"/>` + p(heart(150, 186, 3.6), P.c1), { c1: '#c0c0c0', noPat: true, ...EV('katseye', 5) });
Ht('catbeanie', 'Cat Ear Beanie', ['katseye', 'cute', 'street', 'winter'], P => p('M112,80 Q110,32 150,30 Q190,32 188,80 Z', P.f) + both(p('M116,52 L118,22 L138,38 Z', P.f)) + p('M110,68 L190,68 L190,84 L110,84 Z', P.d), { c1: '#111111', ...EV('katseye', 6) });
Gl('dancesleeves', 'Mesh Arm Sleeves', ['katseye', 'dance', 'edgy'], P => p('M78,198 L70,300 L90,302 L100,206 Z', P.f), { c1: '#111111', c2: '#111111', pat: 'mesh', ...EV('katseye', 7) });
Dr('stagesparkle', 'Rhinestone Stage Set', ['katseye', 'party', 'glam', 'kpop'], P => ({ main: p(torso(184, 236, { neck: 'sweet' }), P.f) + both(ln('M127,186 L131,160', P.c1, 1.8, 1)) + p(skirt(284, 346, 10), P.f) }), { c1: '#c0c0c0', c2: '#ffffff', pat: 'sparkle', ...EV('katseye', 9) });
O('motobomber', 'Oversized Moto Bomber', ['katseye', 'street', 'edgy', 'dance'], P => ({ main: both(p(jacketHalf(272, 4, { pad: 10 }), P.f)), arm: p(SLV.puffy, P.f) + ln('M71,200 L64,320', P.c2, 3, 1) }), { c1: '#111111', c2: '#ff4fd8', two: true, ...EV('katseye', 11) });
I('ears', 'headsetmic', 'Stage Headset Mic', ['katseye', 'kpop', 'pop', 'dance'], () => circ(116, 103, 4, '#333', OL) + ln('M117,108 Q120,122 138,123', '#333', 1.6, 1) + circ(139, 123, 2.4, '#222'), { noPat: true, ...EV('katseye', 13) });
Tp('gnarlytee', 'Oversized Graphic Tee', ['katseye', 'street', 'edgy', 'casual'], P => ({ main: p(torso(158, 330, { neck: 'crew', pad: 8 }), P.f) + p('M156,190 L136,230 L150,230 L142,268 L166,220 L152,220 L160,190 Z', P.c2), arm: p(SLV.short, P.f) }), { c1: '#ffffff', c2: '#ff4fd8', two: true, ...EV('katseye', 16) });
Dr('debutsuit', 'Debut Stage Suit', ['katseye', 'formal', 'glam', 'office'], P => ({ main: p(pants(266, 540, { pad: 3, flare: 6 }), P.f) + p(torso(158, 322, { neck: 'v', pad: 4 }), P.f) + both(p('M137,158 L148,206 L126,184 Z', P.c2)), arm: p(SLV.long, P.f) }), { c1: '#111111', c2: '#ffffff', two: true, ...EV('katseye', 20) });
Ht('catcrown', 'Cat Ear Crown', ['katseye', 'royal', 'glam', 'party'], P => p('M118,64 L116,28 L134,50 L150,40 L166,50 L184,28 L182,64 Z', P.f) + circ(150, 54, 3.4, P.c2) + both(circ(130, 56, 2.4, P.c2)), { c1: '#e6e6f0', c2: '#ff4fd8', two: true, ...EV('katseye', 24) });

/* ===== OLIVIA RODRIGO update — GUTS & SOUR eras (🦋 butterflies) ===== */
Ht('butterflyclips', 'Butterfly Clips', ['olivia', 'y2k', 'cute', 'fairy'], P => [[124, 60], [138, 52], [162, 52], [176, 60]].map(([x, y], i) => `<path d="M${x},${y} Q${x - 7},${y - 7} ${x - 6},${y + 1} Q${x - 6},${y + 6} ${x},${y} Q${x + 6},${y + 6} ${x + 6},${y + 1} Q${x + 7},${y - 7} ${x},${y} Z" fill="${i % 2 ? P.c2 : P.c1}" ${OL}/>`).join(''), { c1: '#c77dff', c2: '#9ad7ff', two: true, noPat: true, ...EV('olivia', 0) });
MK('shadow', 's-purpleglitter', 'Purple Glitter Lids', ['olivia', 'party', 'y2k', 'glam'], P => both(`<ellipse cx="136" cy="93" rx="12" ry="6.5" fill="${P.c1}" opacity=".6"/><path d="${sparkle(130, 90, 2.4)}" fill="#fff"/><path d="${sparkle(142, 88, 1.8)}" fill="#fff"/><circle cx="127" cy="104" r=".9" fill="#fff"/>`), { c1: '#9b5de5', ...EV('olivia', 1) });
B('plaidmini', 'Purple Plaid Mini', ['olivia', 'rock', 'cute', 'y2k'], P => p(skirt(266, 350, 14), P.f) + [-24, -8, 8, 24].map(x => ln(`M${150 + x * .7},270 L${150 + x * 1.3},350`)).join(''), { c1: '#5e2a84', c2: '#111111', pat: 'plaid', ...EV('olivia', 2) });
Tp('lacecami', 'Lace Trim Cami', ['olivia', 'romantic', 'goth', 'y2k'], P => ({ main: p(torso(194, 282, { neck: 'v' }), P.f) + range(108, 192, 7).map(x => circ(x, 196 + Math.abs(150 - x) * -.05, 3, P.c2, 'opacity=".9"')).join('') + both(ln('M127,194 L131,160', P.c1, 1.6, 1)) }), { c1: '#111111', c2: '#c77dff', two: true, ...EV('olivia', 3) });
W('purpleknee', 'Striped Knee Socks', ['olivia', 'cute', 'y2k', 'rock'], P => p(leg(428, 530, .7), P.f) + p(FOOT, P.f) + ln('M120,436 L148,436 M120,444 L148,444', P.c2, 2.6, 1), { c1: '#ffffff', c2: '#9b5de5', two: true, ...EV('olivia', 4) });
S('maryplatforms', 'Platform Mary Janes', ['olivia', 'y2k', 'goth', 'cute'], P => p('M122,520 L148,520 L150,540 L120,540 Z', P.f) + p('M116,538 L154,538 L154,556 L116,556 Z', P.d) + ln('M121,528 L149,528', P.d, 3, 1) + circ(144, 528, 2, '#c0c0c0'), { c1: '#111111', ...EV('olivia', 6) });
Dr('sequinbody', 'Purple Sequin Bodysuit', ['olivia', 'party', 'glam', 'pop'], P => ({ main: p(torso(160, 322, { neck: 'v', pad: .5, hem: 18 }), P.f), arm: p(SLV.long, P.f) }), { c1: '#7b2cbf', c2: '#e0aaff', pat: 'sparkle', ...EV('olivia', 8) });
O('flannel', 'Grunge Flannel', ['olivia', 'rock', 'casual', 'autumn'], P => ({ main: both(p(jacketHalf(330, 10, { pad: 5, close: 240 }), P.f)), arm: p(SLV.long, P.f) + cuff(P.c2) }), { c1: '#5e2a84', c2: '#111111', pat: 'plaid', ...EV('olivia', 10) });
S('purplecombat', 'Purple Combat Boots', ['olivia', 'rock', 'goth', 'edgy'], P => p('M118,470 L149,470 L150,546 L118,546 Z', P.f) + p('M115,543 L153,543 L153,557 L115,557 Z', '#222') + ln('M127,478 L141,486 M141,478 L127,486 M127,494 L141,502 M141,494 L127,502', '#ddd', 1.2, .9), { c1: '#5e2a84', ...EV('olivia', 12) });
Bg('guitar', 'Purple Electric Guitar', ['olivia', 'rock', 'pop'], P => `<rect x="74" y="250" width="8" height="90" fill="#3b2416" ${OL}/><rect x="72" y="238" width="12" height="14" rx="2" fill="#111" ${OL}/>` + p('M60,336 Q50,350 58,366 Q50,384 66,394 Q78,402 90,394 Q106,384 98,366 Q106,350 96,336 Q88,330 84,340 L72,340 Q68,330 60,336 Z', P.f) + `<rect x="70" y="360" width="16" height="6" fill="#ddd"/>`, { c1: '#9b5de5', c2: '#ffffff', pat: 'sparkle', ...EV('olivia', 14) });
H('grungewaves', 'Grunge Waves', ['olivia', 'rock', 'romantic', 'casual'], P => ({ back: p('M113,82 Q108,40 150,40 Q192,40 187,82 Q202,122 191,162 Q206,204 194,262 Q172,272 150,264 Q128,272 106,262 Q94,204 109,162 Q98,122 113,82 Z', P.f), main: p('M113,106 Q108,44 150,44 Q192,44 187,106 Q183,76 157,66 L150,72 L143,66 Q117,76 113,106 Z', P.f) + both(p('M114,90 Q104,130 114,165 Q104,205 112,248 L122,240 Q116,200 124,165 Q114,130 124,96 Z', P.f)) }), { c1: '#3b2416', ...EV('olivia', 16) });
MK('facedeco', 'fd-ostickers', 'Star & Heart Stickers', ['olivia', 'y2k', 'cute', 'pop'], P => p(star(124, 112, 4), P.c1, 'stroke-width=".4"') + p(star(130, 96, 2.4), P.c1, 'stroke-width=".4"') + p(heart(176, 112, 3), P.c2, 'stroke-width=".4"') + circ(170, 102, .9, '#fff') + circ(122, 102, .8, '#fff'), { c1: '#9b5de5', c2: '#ff4fa3', ...EV('olivia', 18) });
N('brokenheart', 'Broken Heart Choker', ['olivia', 'goth', 'rock', 'romantic'], P => p('M137,139 Q150,145 163,139 L163,146 Q150,152 137,146 Z', '#111') + p(heart(150, 158, 6), P.c1) + ln('M150,153 L147,157 L152,160 L149,165', '#111', 1.2, 1), { c1: '#9b5de5', noPat: true, ...EV('olivia', 21) });
Dr('purpleslip', 'Purple Lace Slip Dress', ['olivia', 'romantic', 'party', 'goth'], P => ({ main: p(torso(186, 264, { neck: 'v' }), P.f) + p(skirt(262, 410, 14), P.f) + straps(P.c1) + range(102, 198, 8).map(x => circ(x, 410 + (Math.abs(150 - x) < 30 ? 4 : 1), 3.4, P.c2, 'opacity=".9"')).join('') }), { c1: '#7b2cbf', c2: '#111111', two: true, ...EV('olivia', 24) });
Bk('glitterwings', 'Glitter Butterfly Wings', ['olivia', 'fairy', 'party', 'y2k'], P => FAIRY(P, .85), { c1: '#c77dff', c2: '#ffffff', pat: 'sparkle', ...EV('olivia', 27) });

/* ===== K-POP IDOLS update (💫 stars) ===== */
MK('facedeco', 'fd-idol', 'Idol Glitter & Bandaid', ['kpop', 'cute', 'party'], P => both(`<path d="${sparkle(128, 108, 2)}" fill="#fff"/>` + circ(133, 110, .9, P.c1) + circ(124, 112, .8, P.c1)) + `<rect x="168" y="112" width="11" height="4.5" rx="2" fill="#f3c7a0" transform="rotate(-20 173 114)" ${OL}/>`, { c1: '#ff8fc8', ...EV('kpop', 0) });
Bg('lightstick', 'Lightstick', ['kpop', 'party', 'pop'], P => `<rect x="74" y="296" width="8" height="42" rx="3" fill="#fff" ${OL}/><g filter="url(#${P.uid}-glow)" opacity=".8">${circ(78, 282, 16, P.c1)}</g>` + circ(78, 282, 14, P.c1, OL) + circ(74, 278, 4, '#fff', 'opacity=".7"'), { c1: '#7df9ff', noPat: true, ...EV('kpop', 1) });
B('tennisskirt', 'Pleated Tennis Skirt', ['kpop', 'sporty', 'cute', 'y2k'], P => p(skirt(266, 352, 18), P.f) + ln(`M${r1(150 - hw(322) - 19)},344 Q150,354 ${r1(150 + hw(322) + 19)},344`, P.c2, 3, 1) + [-24, -8, 8, 24].map(x => ln(`M${150 + x * .7},270 L${150 + x * 1.3},352`)).join(''), { c1: '#ffffff', c2: '#0a84ff', two: true, ...EV('kpop', 2) });
H('ombre', 'Idol Ombre Hair', ['kpop', 'pop', 'y2k', 'glam'], P => {
  const g = `url(#${P.uid}-omb)`;
  return { back: `<linearGradient id="${P.uid}-omb" gradientUnits="userSpaceOnUse" x1="0" y1="60" x2="0" y2="250"><stop offset="0" stop-color="${P.c1}"/><stop offset="1" stop-color="${P.c2}"/></linearGradient>` + p(LONG_BACK, g), main: p('M113,98 Q108,44 150,44 Q192,44 187,98 L184,82 L176,86 L168,80 L160,86 L150,80 L140,86 L132,80 L124,86 L116,82 Z', P.c1) + both(p(SIDE_STRAND, g)) };
}, { c1: '#3b2416', c2: '#ff8fc8', two: true, ...EV('kpop', 3) });
Ht('idolribbon', 'Satin Hair Ribbon', ['kpop', 'cute', 'romantic', 'y2k'], P => p('M176,54 L158,40 Q154,54 160,64 Z', P.f) + p('M176,54 L196,42 Q200,56 192,66 Z', P.f) + p('M174,56 L166,86 L172,86 Z M178,56 L186,86 L180,86 Z', P.f) + circ(176, 54, 4.5, P.d, OL), { c1: '#ffffff', ...EV('kpop', 4) });
Tp('sailortop', 'Sailor Uniform Top', ['kpop', 'cute', 'office', 'y2k'], P => ({ main: p(torso(158, 276, { neck: 'v' }), P.f) + both(p('M137,154 L150,198 L102,176 L100,160 Z', P.c2) + ln('M108,166 L144,190', '#fff', 1.4, 1)) + p('M150,198 L140,210 L150,206 L160,210 Z', '#e0245e'), arm: p(SLV.short, P.f) + ln('M77,203 L101,209', P.c2, 3, 1) }), { c1: '#ffffff', c2: '#1d3557', two: true, ...EV('kpop', 5) });
S('chainboots', 'Stage Boots with Chains', ['kpop', 'party', 'edgy', 'glam'], P => p('M117,420 L149,420 L147,544 Q147,556 134,556 Q121,556 123,544 Z', P.f) + ln('M118,470 Q132,482 148,470', '#c0c0c0', 1.8, 1) + ln('M118,430 L148,430', P.d, 2, .6), { c1: '#ffffff', ...EV('kpop', 6) });
Tp('cropjersey', 'Cropped Jersey', ['kpop', 'sporty', 'street', 'y2k'], P => ({ main: p(torso(160, 238, { neck: 'v', pad: 4 }), P.f) + `<text x="150" y="226" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="24" fill="${P.c2}">99</text>`, arm: p(SLV.short, P.f) + ln('M78,200 L101,206', P.c2, 3, 1) }), { c1: '#e0245e', c2: '#ffffff', two: true, ...EV('kpop', 8) });
O('denimset', 'Oversized Denim Jacket', ['kpop', 'y2k', 'casual', 'street'], P => ({ main: both(p(jacketHalf(320, 6, { pad: 9 }), P.f) + p('M110,196 L134,196 L134,214 L110,214 Z', P.f)), arm: p(SLV.puffy, P.f) + cuff(P.c2) }), { c1: '#8fb1e0', c2: '#4d6b99', pat: 'denim', ...EV('kpop', 10) });
Dr('stagecorset', 'Corset & Chains Stage Look', ['kpop', 'party', 'glam', 'edgy'], P => ({ main: p(torso(194, 294, { neck: 'sweet', hem: 10 }), P.f) + p(skirt(290, 352, 16), P.f) + ln('M108,300 Q150,316 192,300 M112,308 Q150,330 188,308', '#c0c0c0', 1.6, 1) + both(ln('M126,202 L132,292')) }), { c1: '#111111', ...EV('kpop', 12) });
E('inear', 'In-Ear Monitor', ['kpop', 'pop', 'party'], () => circ(116, 104, 3, '#e6f4ff', OL) + ln('M116,107 Q112,130 120,150', '#e6f4ff', 1.2, .9), { ...EV('kpop', 14) });
O('airportcoat', 'Airport Long Coat', ['kpop', 'elegant', 'office', 'winter', 'autumn'], P => ({ main: both(p(jacketHalf(460, 8, { pad: 5, flare: .12, close: 240 }), P.f) + p('M138,152 L142,236 L120,192 Z', P.d)), arm: p(SLV.long, P.f) + cuff(P.d) }), { c1: '#c8a878', ...EV('kpop', 16) });
Dr('pastelsuit', 'Pastel Idol Suit', ['kpop', 'formal', 'elegant', 'pop'], P => ({ main: p(pants(266, 540, { pad: 3 }), P.f) + p(torso(158, 322, { neck: 'v', pad: 5 }), P.f) + both(p('M137,158 L148,206 L126,184 Z', P.d)) + circ(146, 268, 2.4, P.d), arm: p(SLV.long, P.f) }), { c1: '#c9a7ff', ...EV('kpop', 18) });
Bg('crystalmic', 'Crystal Stage Mic', ['kpop', 'glam', 'party'], P => `<rect x="74" y="300" width="8" height="34" rx="3" fill="${P.f}" ${OL}/>` + circ(78, 294, 9, '#e6f4ff', OL) + `<path d="${sparkle(75, 291, 3)}" fill="#fff"/>`, { c1: '#c0c0c0', c2: '#ffffff', pat: 'sparkle', ...EV('kpop', 21) });
Dr('awardgown', 'Award Show Gown', ['kpop', 'formal', 'glam', 'royal'], P => ({ back: `<path d="M104,170 L196,170 L250,560 Q150,574 50,560 Z" fill="${P.c2}" fill-opacity=".35" ${OL}/>`, main: p(torso(188, 420, { neck: 'sweet', pad: 1 }), P.f) + p(`M${r1(150 - hw(410) - 1)},410 L${r1(150 + hw(410) + 1)},410 L236,552 Q150,562 64,552 Z`, P.f) }), { c1: '#c0c0c0', c2: '#e6f4ff', pat: 'sparkle', ...EV('kpop', 24) });
Bk('holocape', 'Holographic Cape', ['kpop', 'futuristic', 'party', 'glam'], P => `<linearGradient id="${P.uid}-holo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd1f7"/><stop offset=".35" stop-color="#bde0fe"/><stop offset=".65" stop-color="#caffbf"/><stop offset="1" stop-color="#e0aaff"/></linearGradient>` + p('M106,160 L194,160 L236,544 Q150,558 64,544 Z', `url(#${P.uid}-holo)`, 'fill-opacity=".85"'), { noPat: true, ...EV('kpop', 27) });
Ht('idolcrown', 'Idol Visual Crown', ['kpop', 'royal', 'glam', 'cute'], P => p('M124,64 Q150,46 176,64 L170,64 Q150,54 130,64 Z', P.f) + [130, 140, 150, 160, 170].map((x, i) => p(star(x, i === 2 ? 40 : 50, i === 2 ? 7 : 4.5), P.f)).join('') + circ(150, 40, 2, P.c2), { c1: '#e6e6f0', c2: '#ff8fc8', two: true, ...EV('kpop', 30) });

/* extra tags so older pieces fit the new themes */
const TAG_ADD = {
  bikini: ['swim'], tube: ['swim'], shades: ['swim'], sandals: ['swim'], wavy: ['swim'], bucket: ['swim'],
  ballgown: ['wedding'], column: ['wedding'], pearls: ['wedding'], drops: ['wedding'], studs: ['wedding'], tiara: ['wedding'], bouquet: ['wedding', 'easter'], opera: ['wedding'], updo: ['wedding'], lacegloves: ['wedding'], slip: ['wedding'], bowtie: ['wedding'],
  scarf: ['christmas'], beanie: ['christmas'], uggs: ['christmas'], furcoat: ['christmas', 'baddie'], sweater: ['christmas', 'autumn'],
  sequintop: ['newyear'], bodycon: ['newyear', 'baddie'], glowsticks: ['newyear'], starglasses: ['newyear'], clutch: ['newyear'], mermaid: ['newyear'],
  bunny: ['easter'], babydoll: ['easter'], sundress: ['easter'], flowercrown: ['easter'], hearttee: ['easter'],
  corset: ['baddie'], hoops: ['baddie'], chain: ['baddie'], leatherpants: ['baddie'], cargo: ['baddie'], fishnets: ['baddie'], 's-liner': ['baddie'], 'l-pout': ['baddie'],
  bangles: ['desi', 'festive', 'karva'], 'fd-bindi': ['karva', 'diwali'], jhumka: ['diwali', 'eid'], lantern: ['eid'], diya: ['karva'], sparkler: ['tiranga'], kurti: ['holi', 'rakhi', 'teej'], chooriyan: ['teej', 'karva', 'rakhi'], mehendi: ['eid', 'teej', 'karva', 'rakhi'], dupatta: ['rakhi', 'teej', 'eid'], saree: ['diwali', 'karva'], lehenga: ['diwali', 'karva', 'eid'], chaniyacholi: ['teej'], juttis: ['eid', 'rakhi', 'harvest'], 'fd-nath': ['karva', 'teej'], gajra: ['onam', 'ganesh'], templeneck: ['onam', 'diwali'], maangtikka: ['karva', 'eid'], dandiya: ['holi'], halo: ['festive'],
  cardigan: ['autumn'], beret: ['autumn'], kneeboots: ['autumn'], trench: ['autumn'], coffee: ['autumn'], cowboots: ['autumn'], 'fd-freckles': ['autumn'],
  witch: ['halloween'], witchhat: ['halloween'], pumpkin: ['halloween'],
};
for (const [id, t] of Object.entries(TAG_ADD)) ITEMS.find(i => i.id === id)?.tags.push(...t);

const ITEMS_BY_ID = Object.fromEntries(ITEMS.map(it => [it.id, it]));

/* ---------- poses ---------- */
const POSES = {
  idle: { name: 'Stand', l: 0, r: 0 },
  tada: { name: 'Ta-da!', l: 24, r: 24 },
  wave: { name: 'Wave', l: 150, r: 4 },
  victory: { name: 'Victory', l: 155, r: 155 },
  diva: { name: 'Diva', l: 168, r: -12, t: -2 },
  point: { name: 'Point', l: -6, r: 96 },
  sassy: { name: 'Sassy', l: -16, r: 38, t: 3 },
  superstar: { name: 'Superstar', l: 122, r: 40, t: -2 },
  shy: { name: 'Shy', l: -20, r: -20 },
};

/* ---------- renderer ---------- */
const DRAW_SLOTS = ['back', 'hair', 'legwear', 'bottom', 'shoes', 'top', 'dress', 'neck', 'outer', 'gloves', 'bag', 'shadow', 'eyes', 'brows', 'lips', 'blush', 'facedeco', 'ears', 'hat', 'glasses'];
const LAYERS = ['back', 'hair:back', 'hat:back', 'top:back', 'dress:back', 'BODY', 'legwear', 'bottom', 'shoes', 'top', 'dress', 'neck', 'outer', 'back:front', 'ARMS', 'shadow', 'eyes', 'brows', 'lips', 'blush', 'facedeco', 'ears', 'hair', 'hat', 'glasses'];
// layers that get soft 3D shading in full-size renders
const SHADED = new Set(['back', 'hair:back', 'top:back', 'dress:back', 'BODY', 'legwear', 'bottom', 'shoes', 'top', 'dress', 'outer', 'back:front', 'ARMS', 'hair', 'hat']);
let UID = 0;

// inner shadow on the lower-right edges + a soft highlight on the upper-left, so flat shapes read as rounded
const shadeFilter = id => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">` +
  '<feComponentTransfer in="SourceAlpha" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>' +
  '<feGaussianBlur in="inv" stdDeviation="4.5" result="ib"/>' +
  '<feOffset in="ib" dx="-3.5" dy="-2.5" result="ibs"/><feFlood flood-color="#2a0f1f" flood-opacity=".42"/><feComposite in2="ibs" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="sh"/>' +
  '<feOffset in="ib" dx="3" dy="3" result="ibh"/><feFlood flood-color="#ffffff" flood-opacity=".3"/><feComposite in2="ibh" operator="in"/><feComposite in2="SourceAlpha" operator="in" result="hl"/>' +
  '<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge></filter>';

function renderCharacter(o, opt = {}) {
  const uid = 'c' + (++UID), s = o.slots || {}, parts = {}, defs = [];
  const hq = !opt.flat && !/thumb|head/.test(opt.cls || '');
  const add = (k, v) => { if (v) (parts[k] ||= []).push(v); };
  const skin = o.skin || '#F1C19F';
  for (const slot of DRAW_SLOTS) {
    const inst = s[slot];
    if (!inst) continue;
    if (s.dress && (slot === 'top' || slot === 'bottom')) continue;
    if (slot === 'hair' && s.hat && ITEMS_BY_ID[s.hat.id]?.hidesHair) continue;
    const it = ITEMS_BY_ID[inst.id];
    if (!it) continue;
    const c1 = inst.c1 || it.c1, c2 = inst.c2 || it.c2, pat = it.noPat ? 'solid' : (inst.pat || it.pat || 'solid');
    let f = c1;
    if (pat !== 'solid') { const pid = `${uid}-${slot}`; defs.push(patternDef(pid, pat, c1, c2)); f = `url(#${pid})`; }
    const out = it.draw({ f, c1, c2, d: shade(c1, -28), l: shade(c1, 30), uid, skin });
    const r = typeof out === 'string' ? { main: out } : (out || {});
    add(slot + ':back', r.back); add(slot, r.main); add(slot + ':front', r.front); add('arm', r.arm); add('hand', r.hand);
  }
  const g = k => (parts[k] || []).join('');
  const pose = POSES[o.pose] || POSES.idle;
  const arm = `<path d="${ARM_SKIN}" fill="${skin}" ${OL}/><ellipse cx="78" cy="329" rx="8.5" ry="11" fill="${skin}" ${OL}/>` + (hq ? ln('M74,336 Q78,339 82,336', shade(skin, -25), 1, .5) : '') + g('arm');
  const ARMS = `<g transform="rotate(${pose.l} 102 170)">${arm}</g>` + mir(`<g transform="rotate(${pose.r} 102 170)">${arm}${g('hand')}</g>`);
  const skinD = shade(skin, -22);
  const BODY =
    both(p(leg(312, 530, 0), skin) + p(FOOT, skin)) +
    `<rect x="139" y="116" width="22" height="46" fill="${skin}" ${OL}/>` +
    (hq ? `<path d="M139,128 Q150,140 161,128 L161,142 Q150,150 139,142 Z" fill="${skinD}" opacity=".35"/>` : '') +
    p(torso(156, 332, { pad: 0, neck: 'shoulder' }), skin) +
    (hq ? ln('M126,166 Q137,171 146,166 M154,166 Q163,171 174,166', skinD, 1.2, .55) + ln('M150,274 l0,3', skinD, 1.6, .6) + both(ln('M123,430 q7,3 14,0', skinD, 1.1, .4)) : '') +
    p(torso(198, 224, { pad: .6, neck: 'sweet' }), '#efe3ea', 'stroke-width="1"') +
    p(`M${r1(150 - hw(296))},296 L${r1(150 + hw(296))},296 L${r1(150 + hw(322))},322 L156,340 L144,340 L${r1(150 - hw(322))},322 Z`, '#efe3ea', 'stroke-width="1"') +
    both(`<ellipse cx="116" cy="101" rx="5.5" ry="9" fill="${skin}" ${OL}/>` + (hq ? ln('M117,96 Q113,101 117,106', skinD, 1, .5) : '')) +
    `<ellipse cx="150" cy="95" rx="34" ry="40" fill="${skin}" ${OL}/>` +
    (hq ? `<ellipse cx="150" cy="95" rx="34" ry="40" fill="url(#${uid}-face)"/>` : '') +
    ln('M149,104 Q146,111 151,112', skinD, 1.6, .7) +
    (hq ? ln('M145,113 Q150,115 155,113', skinD, 1, .45) + ln('M145.5,110 q-1.5,1.5 0,2.6 M154.5,110 q1.5,1.5 0,2.6', skinD, 1.1, .55) + '<path d="M150.5,92 L151,106" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>' + both(`<ellipse cx="124" cy="116" rx="9" ry="5" fill="${skinD}" opacity=".14"/>`) : '');
  const L = { BODY, ARMS };
  // hair strand texture: a fine strand pattern masked to the hair silhouette
  const strands = (c, k) => `<mask id="${uid}-m${k}" maskUnits="userSpaceOnUse" x="0" y="-40" width="300" height="620"><g filter="url(#${uid}-white)">${c}</g></mask><rect x="40" y="-20" width="220" height="420" fill="url(#${uid}-strand)" mask="url(#${uid}-m${k})"/>`;
  const extra = {
    lips: hq && s.lips ? '<ellipse cx="152.5" cy="119.6" rx="3" ry="1.1" fill="#fff" opacity=".45"/>' : '',
    hair: hq && s.hair ? '<path d="M128,58 Q150,46 172,58" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="4.5" stroke-linecap="round"/>' : '',
  };
  const inner = LAYERS.map(k => {
    const c = L[k] ?? g(k);
    const texture = c && hq && (k === 'hair' || k === 'hair:back') ? strands(c, k === 'hair' ? 'h' : 'hb') : '';
    return (c && hq && SHADED.has(k) ? `<g filter="url(#${uid}-shade)">${c}</g>` : c) + texture + (extra[k] || '');
  }).join('');
  const h = o.height || 1, tilt = pose.t || 0;
  const vb = opt.vb || '0 0 300 580';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${opt.cls || 'char'}" preserveAspectRatio="${opt.par || 'xMidYMax meet'}">` +
    `<defs><filter id="${uid}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7"/></filter>` +
    `<filter id="${uid}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8"/></filter>` +
    `<filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>` +
    (hq ? shadeFilter(`${uid}-shade`) +
      `<filter id="${uid}-white"><feFlood flood-color="#fff"/><feComposite in2="SourceAlpha" operator="in"/></filter>` +
      `<pattern id="${uid}-strand" patternUnits="userSpaceOnUse" width="7" height="64"><path d="M2,0 Q4.5,32 2,64" stroke="#000" stroke-opacity=".2" stroke-width=".9" fill="none"/><path d="M5.2,0 Q3.4,32 5.6,64" stroke="#fff" stroke-opacity=".14" stroke-width=".7" fill="none"/></pattern>` +
      `<radialGradient id="${uid}-face" cx=".5" cy=".42" r=".6"><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#5a2a1a" stop-opacity=".16"/></radialGradient>` : '') +
    `${defs.join('')}</defs>` +
    (opt.noShadow ? '' : '<ellipse cx="150" cy="560" rx="64" ry="9" fill="#000" opacity=".18"/>') +
    `<g transform="translate(150 556) rotate(${tilt}) scale(${h}) translate(-150 -556)">${inner}</g></svg>`;
}
