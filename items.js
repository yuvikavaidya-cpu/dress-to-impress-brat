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
const PATTERNS = ['solid', 'stripes', 'diag', 'polka', 'check', 'plaid', 'leopard', 'zebra', 'hearts', 'stars', 'flowers', 'sparkle', 'denim', 'mesh'];

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
    price: o.price || 0, vip: !!o.vip, brat: o.brat, noPat: !!o.noPat, two: !!o.two,
  });
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
  'e-cat': { w: 'M127,100 Q135,90 145,96 Q138,105 127,100 Z', lid: 'M126,100 Q135,89 146,95 L151,90' },
  'e-sleepy': { w: 'M128,99 Q136,95 144,99 Q136,105 128,99 Z', lid: 'M127,99 Q136,93 145,99', iy: 101 },
  'e-sparkle': { w: 'M127,98 A9,10.5 0 1,0 145,98 A9,10.5 0 1,0 127,98 Z', lid: 'M126,93 Q136,83 146,92 M127,92 L122,89', ir: 7, lw: 2.8 },
  'e-doe': { w: 'M128,99 A8,9 0 1,0 144,99 A8,9 0 1,0 128,99 Z', lid: 'M127,95 Q136,85 145,94 M128,94 L124,90 M130,107 L128,110 M134,108 L133,111', ir: 5.6 },
};
function eyeMarkup(P, e, onlyLeft) {
  const cid = P.uid + '-eye', iy = e.iy || 99, ir = e.ir || 4.6;
  const one = `<path d="${e.w}" fill="#fff"/><g clip-path="url(#${cid})"><circle cx="136" cy="${iy}" r="${ir}" fill="${P.c1}"/><circle cx="136" cy="${iy}" r="${r1(ir * .48)}" fill="#140a10"/><circle cx="134.2" cy="${iy - 2.2}" r="${r1(ir * .32)}" fill="#fff"/>${ir > 6 ? `<circle cx="138.5" cy="${iy + 2.5}" r="1.3" fill="#fff"/>` : ''}</g><path d="${e.lid}" fill="none" stroke="#1a1018" stroke-width="${e.lw || 2.2}" stroke-linecap="round"/>`;
  return `<clipPath id="${cid}"><path d="${e.w}"/></clipPath>` + (onlyLeft ? one : both(one));
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
MK('shadow', 's-liner', 'Winged Liner', ['edgy', 'y2k', 'elegant', 'office'], P => both(p('M126,97 Q136,89 147,94 L155,88 L148,98 Z', P.c1, 'stroke-width=".6"')), { c1: '#111111' });
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
Dr('column', 'Column Gown', ['formal', 'elegant', 'royal'], P => ({ main: p(torso(184, 332), P.f) + p(skirt(330, 552, 14), P.f) + p('M160,184 L170,158 L178,160 L172,186 Z', P.f) }), { c1: '#111111', price: 600 });
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
const LAYERS = ['back', 'hair:back', 'top:back', 'BODY', 'legwear', 'bottom', 'shoes', 'top', 'dress', 'neck', 'outer', 'ARMS', 'shadow', 'eyes', 'brows', 'lips', 'blush', 'facedeco', 'ears', 'hair', 'hat', 'glasses'];
let UID = 0;

function renderCharacter(o, opt = {}) {
  const uid = 'c' + (++UID), s = o.slots || {}, parts = {}, defs = [];
  const add = (k, v) => { if (v) (parts[k] ||= []).push(v); };
  const skin = o.skin || '#F1C19F';
  for (const slot of DRAW_SLOTS) {
    const inst = s[slot];
    if (!inst) continue;
    if (s.dress && (slot === 'top' || slot === 'bottom')) continue;
    const it = ITEMS_BY_ID[inst.id];
    if (!it) continue;
    const c1 = inst.c1 || it.c1, c2 = inst.c2 || it.c2, pat = it.noPat ? 'solid' : (inst.pat || it.pat || 'solid');
    let f = c1;
    if (pat !== 'solid') { const pid = `${uid}-${slot}`; defs.push(patternDef(pid, pat, c1, c2)); f = `url(#${pid})`; }
    const out = it.draw({ f, c1, c2, d: shade(c1, -28), l: shade(c1, 30), uid, skin });
    const r = typeof out === 'string' ? { main: out } : (out || {});
    add(slot + ':back', r.back); add(slot, r.main); add('arm', r.arm); add('hand', r.hand);
  }
  const g = k => (parts[k] || []).join('');
  const pose = POSES[o.pose] || POSES.idle;
  const arm = `<path d="${ARM_SKIN}" fill="${skin}" ${OL}/><ellipse cx="78" cy="329" rx="8.5" ry="11" fill="${skin}" ${OL}/>` + g('arm');
  const ARMS = `<g transform="rotate(${pose.l} 102 170)">${arm}</g>` + mir(`<g transform="rotate(${pose.r} 102 170)">${arm}${g('hand')}</g>`);
  const skinD = shade(skin, -22);
  const BODY =
    both(p(leg(312, 530, 0), skin) + p(FOOT, skin)) +
    `<rect x="139" y="116" width="22" height="46" fill="${skin}" ${OL}/>` +
    p(torso(156, 332, { pad: 0, neck: 'shoulder' }), skin) +
    p(torso(198, 224, { pad: .6, neck: 'sweet' }), '#efe3ea', 'stroke-width="1"') +
    p(`M${r1(150 - hw(296))},296 L${r1(150 + hw(296))},296 L${r1(150 + hw(322))},322 L156,340 L144,340 L${r1(150 - hw(322))},322 Z`, '#efe3ea', 'stroke-width="1"') +
    both(`<ellipse cx="116" cy="101" rx="5.5" ry="9" fill="${skin}" ${OL}/>`) +
    `<ellipse cx="150" cy="95" rx="34" ry="40" fill="${skin}" ${OL}/>` +
    ln('M149,104 Q146,111 151,112', skinD, 1.6, .7);
  const L = { BODY, ARMS };
  const inner = LAYERS.map(k => L[k] ?? g(k)).join('');
  const h = o.height || 1, tilt = pose.t || 0;
  const vb = opt.vb || '0 0 300 580';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${opt.cls || 'char'}" preserveAspectRatio="${opt.par || 'xMidYMax meet'}">` +
    `<defs><filter id="${uid}-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".7"/></filter>` +
    `<filter id="${uid}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.8"/></filter>` +
    `<filter id="${uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>${defs.join('')}</defs>` +
    (opt.noShadow ? '' : '<ellipse cx="150" cy="560" rx="64" ry="9" fill="#000" opacity=".18"/>') +
    `<g transform="translate(150 556) rotate(${tilt}) scale(${h}) translate(-150 -556)">${inner}</g></svg>`;
}
