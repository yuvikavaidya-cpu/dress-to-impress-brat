'use strict';
/* ==========================================================
   Dress to Impress — fan-made
   Flow: title → menu → lobby (theme) → dressing room → runway
   (vote) → results.  Plus seasonal events (Spooky Season,
   Navaratri, brat runway), the Baddie Pass, wardrobe, VIP, codes.
   ========================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const clone = o => JSON.parse(JSON.stringify(o));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- themes ---------- */
const THEMES = [
  { id: 'y2k', name: 'Y2K It Girl', emoji: '💿', tags: { y2k: 3, pop: 1, party: 1, cute: 1 }, colors: ['#ff8fc8', '#5ab4ff', '#c0c0c0', '#bf5af2'], desc: 'Low-rise, baby tees, butterfly clips energy.' },
  { id: 'goth', name: 'Goth Night', emoji: '🦇', tags: { goth: 3, spooky: 1, rock: 1, edgy: 1 }, colors: ['#111111', '#7a1f3d', '#2a1438'], desc: 'Dark, dramatic and a little bit haunted.' },
  { id: 'beach', name: 'Beach Day', emoji: '🏖️', tags: { beach: 3, summer: 2, swim: 1, casual: 1 }, colors: ['#ffd60a', '#2ec4b6', '#ff9500', '#ffffff'], desc: 'Sun, sand and something cute to swim in.' },
  { id: 'pool', name: 'Pool Party', emoji: '🏊', tags: { swim: 3, summer: 2, party: 1, beach: 1 }, colors: ['#2ec4b6', '#ff8fc8', '#ffd60a', '#5ab4ff'], desc: 'Floaties, swimsuits and cannonballs.' },
  { id: 'swimteam', name: 'Swim Team', emoji: '🥽', tags: { swim: 3, sporty: 3 }, colors: ['#0a84ff', '#1d3557', '#ffffff'], desc: 'Caps, goggles and race-day energy.' },
  { id: 'tropical', name: 'Tropical Vacation', emoji: '🌺', tags: { beach: 2, swim: 2, summer: 2, cottage: 1 }, colors: ['#ff9500', '#2ec4b6', '#ff4fa3', '#34c759'], desc: 'Island resort, sarongs and sun hats.' },
  { id: 'royal', name: 'Royalty', emoji: '👑', tags: { royal: 3, formal: 2, elegant: 2 }, colors: ['#d4af37', '#7a1f3d', '#5e5ce6', '#ffffff'], desc: 'Dress like you own the kingdom.' },
  { id: 'fairy', name: 'Fairycore', emoji: '🧚', tags: { fairy: 3, cottage: 1, cute: 1 }, colors: ['#b8f2c9', '#ffc8e8', '#c9a7ff'], desc: 'Wings, sparkles and enchanted forest vibes.' },
  { id: 'sporty', name: 'Sporty Chic', emoji: '🏃', tags: { sporty: 3, street: 1, casual: 1 }, colors: ['#ffffff', '#ff3b30', '#0a84ff', '#111111'], desc: 'Athletic but make it fashion.' },
  { id: 'redcarpet', name: 'Red Carpet', emoji: '✨', tags: { formal: 3, elegant: 2, party: 1, glam: 1 }, colors: ['#e0245e', '#111111', '#d4af37', '#c0c0c0'], desc: 'Cameras flashing. Serve a gown moment.' },
  { id: 'popstar', name: 'Pop Star', emoji: '🎤', tags: { pop: 3, party: 2, y2k: 1 }, colors: ['#bf5af2', '#ff4fa3', '#c0c0c0'], desc: 'Sold-out stadium tour outfit.' },
  { id: 'western', name: 'Cowgirl', emoji: '🤠', tags: { western: 3, casual: 1, summer: 1 }, colors: ['#a2845e', '#ffffff', '#e0245e', '#6b8fc7'], desc: 'Yeehaw, but couture.' },
  { id: 'sleepover', name: 'Sleepover', emoji: '🛌', tags: { cozy: 3, cute: 2 }, colors: ['#ffc8e8', '#9ad7ff', '#ffffff'], desc: 'Comfy, cute and ready for pillow fights.' },
  { id: 'office', name: 'Office Siren', emoji: '💼', tags: { office: 3, elegant: 2, formal: 1 }, colors: ['#111111', '#ffffff', '#c0c0c0', '#7a1f3d'], desc: 'Corporate, but dangerously chic.' },
  { id: 'cottage', name: 'Cottagecore', emoji: '🌼', tags: { cottage: 3, romantic: 1, fairy: 1 }, colors: ['#f5e6c8', '#b8f2c9', '#ffc8e8', '#ffffff'], desc: 'Picnic in a meadow, baking bread.' },
  { id: 'rock', name: 'Rockstar', emoji: '🎸', tags: { rock: 3, edgy: 2, goth: 1 }, colors: ['#111111', '#ff3b30', '#c0c0c0'], desc: 'Leather, studs and loud guitars.' },
  { id: 'pinkdoll', name: 'Pink Dream Doll', emoji: '🎀', tags: { cute: 2, pop: 1, y2k: 1 }, colors: ['#ff4fa3', '#ff8fc8', '#ffc8e8'], colorWeight: 2.2, desc: 'Everything. Must. Be. Pink.' },
  { id: 'baddie', name: 'Baddie', emoji: '💅', tags: { baddie: 3, glam: 2, party: 1, street: 1 }, colors: ['#111111', '#e8c4a8', '#d4af37', '#ffffff'], desc: 'Snatched, glossy, lashes on, phone out.' },
  { id: 'winter', name: 'Winter Wonderland', emoji: '❄️', tags: { winter: 3, cozy: 2, elegant: 1 }, colors: ['#ffffff', '#9ad7ff', '#c0c0c0'], desc: 'Snowflakes, fur and frosty glam.' },
  { id: 'prom', name: 'Prom Night', emoji: '💃', tags: { formal: 3, romantic: 2, party: 1 }, colors: ['#e8c9ff', '#e0245e', '#5ab4ff', '#d4af37'], desc: 'Main character at the dance.' },
  { id: 'weddingguest', name: 'Wedding Guest', emoji: '💐', tags: { wedding: 2, formal: 2, elegant: 2, romantic: 1 }, colors: ['#c9a7ff', '#b8f2c9', '#ffc8e8', '#5ab4ff'], desc: "Fancy, pretty — and don't upstage the bride!" },
  { id: 'bride', name: 'Here Comes the Bride', emoji: '👰', tags: { wedding: 3, formal: 2, romantic: 2 }, colors: ['#ffffff', '#fffdf6', '#e6e6f0', '#f5e6c8'], colorWeight: 1.6, desc: 'Gowns, veils and something sparkly.' },
  { id: 'future', name: 'Futuristic', emoji: '🚀', tags: { futuristic: 3, edgy: 1, party: 1 }, colors: ['#c0c0c0', '#32ade6', '#bf5af2'], desc: 'Fashion from the year 3025.' },
  { id: 'valentine', name: "Valentine's Date", emoji: '💘', tags: { romantic: 3, cute: 2 }, colors: ['#e0245e', '#ff8fc8', '#ffffff'], desc: 'Hearts, blush and butterflies.' },
  { id: 'halloween', name: 'Halloween Monster', emoji: '🎃', tags: { spooky: 3, goth: 2 }, colors: ['#ff9500', '#111111', '#2a1438'], desc: 'Scary-cute or scary-scary.' },
  { id: 'christmas', name: 'Christmas Party', emoji: '🎄', tags: { christmas: 3, winter: 2, party: 1, cozy: 1 }, colors: ['#e0245e', '#2d6a4f', '#ffffff', '#d4af37'], desc: 'Santa hats, sweaters and sparkle.' },
  { id: 'nye', name: "New Year's Eve", emoji: '🎆', tags: { newyear: 3, party: 3, glam: 1 }, colors: ['#d4af37', '#c0c0c0', '#111111'], desc: 'Countdown glam — sequins required.' },
  { id: 'easter', name: 'Easter Brunch', emoji: '🐣', tags: { easter: 3, cute: 2, cottage: 1 }, colors: ['#ffc8e8', '#9ad7ff', '#fff3b0', '#b8f2c9'], desc: 'Pastels, bunny ears and a basket of eggs.' },
  { id: 'lunar', name: 'Lunar New Year', emoji: '🧧', tags: { lunar: 3, elegant: 2, festive: 1 }, colors: ['#e0245e', '#d4af37'], colorWeight: 1.6, desc: 'Lucky red and gold, lanterns glowing.' },
  { id: 'diwali', name: 'Diwali Night', emoji: '🪔', tags: { diwali: 3, desi: 2, festive: 2, formal: 1 }, colors: ['#d4af37', '#ff9500', '#e0245e', '#7a1f3d'], desc: 'Festival of lights — diyas, gold and sparkle.' },
  { id: 'stpatricks', name: "St. Patrick's Day", emoji: '🍀', tags: { lucky: 3, casual: 1, party: 1 }, colors: ['#34c759', '#2d6a4f', '#ffffff'], colorWeight: 2, desc: 'Wear green or get pinched!' },
  { id: 'autumn', name: 'Autumn Harvest', emoji: '🍂', tags: { autumn: 3, cozy: 2, cottage: 1 }, colors: ['#ff9500', '#a2845e', '#7a1f3d', '#f5e6c8'], desc: 'Pumpkin spice and cozy knits.' },
  { id: 'oldmoney', name: 'Old Money', emoji: '🥂', tags: { elegant: 3, office: 1, formal: 1 }, colors: ['#f5e6c8', '#1d3557', '#ffffff', '#2d6a4f'], desc: 'Quiet luxury at the country club.' },
  { id: 'street', name: 'Streetwear', emoji: '🧢', tags: { street: 3, sporty: 1, edgy: 1 }, colors: ['#111111', '#ffffff', '#ff9500'], desc: 'Fresh fits for the city.' },
  { id: 'sea', name: 'Under the Sea', emoji: '🐚', tags: { beach: 2, fairy: 2, swim: 1 }, colors: ['#2ec4b6', '#5ab4ff', '#bf5af2', '#c9a7ff'], colorWeight: 1.6, desc: 'Mermaid-adjacent shimmer.' },
  { id: 'festival', name: 'Music Festival', emoji: '🎡', tags: { party: 2, summer: 2, y2k: 1, fairy: 1 }, colors: ['#ff9500', '#bf5af2', '#2ec4b6'], desc: 'Glitter, sunnies and main-stage vibes.' },
];
const BRAT_THEMES = [
  { id: 'bratsummer', name: 'brat summer', emoji: '💚', tags: { brat: 3, party: 2, summer: 2, edgy: 1 }, colors: [BRAT, '#111111'], colorWeight: 1.5, desc: 'lime green, sunglasses at night, zero rules.' },
  { id: 'clubclassics', name: 'club classics', emoji: '🪩', tags: { party: 3, brat: 2, edgy: 2, rock: 1 }, colors: ['#111111', BRAT, '#c0c0c0'], desc: 'dress for the sweatiest club of your life.' },
  { id: 'limelight', name: 'lime light', emoji: '🟩', tags: { brat: 3 }, colors: [BRAT], colorWeight: 2.6, desc: 'wear as much brat green as humanly possible.' },
  { id: 'partygirl', name: 'party girl', emoji: '🥂', tags: { party: 3, pop: 2, brat: 2, y2k: 1 }, colors: [BRAT, '#111111', '#ff4fa3'], desc: 'last one to leave, first one in the photos.' },
  { id: 'messy', name: 'messy & iconic', emoji: '🖤', tags: { edgy: 3, street: 2, brat: 2, y2k: 1 }, colors: ['#111111', '#ffffff', BRAT], desc: 'smudged liner, effortless, a little chaotic.' },
  { id: 'sunrise', name: 'rave til sunrise', emoji: '🌅', tags: { party: 3, futuristic: 2, brat: 2 }, colors: [BRAT, '#c0c0c0', '#111111'], desc: 'glow sticks, visors, still dancing at 6am.' },
  { id: 'itgirl', name: 'it girl', emoji: '✨', tags: { y2k: 2, brat: 2, pop: 2, elegant: 1 }, colors: [BRAT, '#111111', '#ffffff'], desc: 'everyone wants to be you tonight.' },
  { id: 'bratsport', name: 'brat & sporty', emoji: '🏟️', tags: { sporty: 3, brat: 2, street: 2 }, colors: [BRAT, '#111111', '#ffffff'], desc: 'track pants, sneakers, lime everything.' },
];
const SPOOKY_THEMES = [
  { id: 'vampball', name: 'Vampire Ball', emoji: '🧛', tags: { spooky: 3, goth: 2, formal: 2, royal: 1 }, colors: ['#111111', '#7a1f3d', '#e0245e'], desc: 'Velvet, capes and a little bit of bite.' },
  { id: 'coven', name: "Witches' Coven", emoji: '🧙', tags: { spooky: 3, fairy: 2, goth: 1 }, colors: ['#2a1438', '#2d6a4f', '#111111'], desc: 'Brew something wicked.' },
  { id: 'trickortreat', name: 'Trick or Treat', emoji: '🍬', tags: { spooky: 3, cute: 2, party: 1 }, colors: ['#ff9500', '#111111', '#bf5af2'], desc: 'Costume time — cute, scary or both.' },
  { id: 'zombieprom', name: 'Zombie Prom', emoji: '🧟', tags: { spooky: 3, formal: 2, romantic: 1, edgy: 1 }, colors: ['#2d6a4f', '#7a1f3d', '#c0c0c0'], desc: 'Undead and overdressed.' },
  { id: 'haunted', name: 'Haunted Mansion', emoji: '👻', tags: { spooky: 3, elegant: 2, goth: 1 }, colors: ['#eef0ff', '#111111', '#5e2a84'], desc: 'Ghostly, glam and a little see-through.' },
  { id: 'spookycute', name: 'Spooky Cute', emoji: '🎃', tags: { spooky: 2, cute: 3, pop: 1 }, colors: ['#ff9500', '#ff8fc8', '#111111'], desc: 'Pastel goth, pumpkins and bows.' },
  { id: 'graveyard', name: 'Graveyard Glam', emoji: '🪦', tags: { goth: 3, spooky: 2, party: 1, glam: 1 }, colors: ['#111111', '#c0c0c0', '#5e2a84'], desc: 'Midnight at the cemetery, but couture.' },
  { id: 'monstermash', name: 'Monster Mash', emoji: '🕸️', tags: { spooky: 3, party: 2, edgy: 1 }, colors: ['#34c759', '#bf5af2', '#ff9500'], desc: 'Monster costume party on the dance floor.' },
];
const NAV_THEMES = [
  { id: 'garba', name: 'Garba Night', emoji: '💃', tags: { desi: 3, festive: 2, party: 2, cute: 1 }, colors: ['#e0245e', '#ffd60a', '#ff9500'], desc: 'Twirl-ready chaniya cholis & mirror work.' },
  { id: 'dandiya', name: 'Dandiya Raas', emoji: '🥢', tags: { desi: 3, festive: 2, party: 2 }, colors: ['#ff4fa3', '#2ec4b6', '#ffd60a'], desc: 'Sticks up — dress to dance all night.' },
  { id: 'durgapuja', name: 'Durga Puja Glam', emoji: '🔱', tags: { desi: 3, royal: 2, elegant: 2, festive: 1 }, colors: ['#e0245e', '#ffffff', '#d4af37'], desc: 'Red-and-white saree elegance with gold.' },
  { id: 'royalred', name: 'Royal Red Night', emoji: '❤️', tags: { desi: 3, festive: 2, royal: 1 }, colors: ['#e0245e', '#7a1f3d'], colorWeight: 2, desc: "Tonight's color is red — go all in." },
  { id: 'peacock', name: 'Peacock Green Night', emoji: '🦚', tags: { desi: 3, festive: 2, elegant: 1 }, colors: ['#2d6a4f', '#2ec4b6', '#0a84ff'], colorWeight: 2, desc: 'Peacock greens and blues.' },
  { id: 'marigold', name: 'Marigold Yellow Night', emoji: '🌼', tags: { desi: 3, festive: 2, cute: 1 }, colors: ['#ffd60a', '#ff9500'], colorWeight: 2, desc: 'Sunny yellows like marigold garlands.' },
  { id: 'mirrorwork', name: 'Mirror-Work Magic', emoji: '🪞', tags: { desi: 3, festive: 2, party: 1 }, colors: ['#e0245e', '#bf5af2', '#c0c0c0'], desc: 'Shine like a thousand tiny mirrors.' },
  { id: 'goldendiya', name: 'Golden Diya Night', emoji: '🪔', tags: { desi: 3, festive: 2, formal: 1, diwali: 2 }, colors: ['#d4af37', '#ff9500', '#7a1f3d'], desc: 'Gold, glow and lamps everywhere.' },
];

const FESTIVAL_THEMES = [
  { id: 'holi', name: 'Holi Hai!', emoji: '🎨', tags: { holi: 3, festive: 2, casual: 1, desi: 1 }, colors: ['#ffffff', '#ff4fa3', '#34c759', '#ffd60a', '#5ab4ff'], desc: 'Festival of colors — wear white and get splashed.' },
  { id: 'diwali', name: 'Diwali Night', emoji: '🪔', tags: { diwali: 3, desi: 2, festive: 2, formal: 1 }, colors: ['#d4af37', '#ff9500', '#e0245e', '#7a1f3d'], desc: 'Festival of lights — diyas, gold and sparkle.' },
  { id: 'rakhi', name: 'Raksha Bandhan', emoji: '🧵', tags: { rakhi: 3, desi: 2, festive: 2, cute: 1 }, colors: ['#e0245e', '#ffd60a', '#ff9500'], desc: 'Rakhi, thali and sibling photoshoots.' },
  { id: 'eid', name: 'Eid Mubarak', emoji: '🌙', tags: { eid: 3, elegant: 2, festive: 2, desi: 1 }, colors: ['#2d6a4f', '#ffffff', '#d4af37', '#c9a7ff'], desc: 'Moon-sighting glam — sharara, chaand and mehendi.' },
  { id: 'sankranti', name: 'Makar Sankranti & Pongal', emoji: '🪁', tags: { harvest: 3, festive: 2, desi: 1, cute: 1 }, colors: ['#ffd60a', '#ff9500', '#34c759', '#bf5af2'], desc: 'Kites in the sky, pongal in the pot.' },
  { id: 'onam', name: 'Onam', emoji: '🌸', tags: { onam: 3, desi: 2, festive: 1, elegant: 1 }, colors: ['#f5e6c8', '#d4af37', '#ffffff'], colorWeight: 2, desc: 'Kasavu cream & gold, jasmine in the hair.' },
  { id: 'ganesh', name: 'Ganesh Chaturthi', emoji: '🐘', tags: { ganesh: 3, desi: 2, festive: 2 }, colors: ['#ff9500', '#e0245e', '#ffd60a', '#2d6a4f'], desc: 'Nauvari, pheta and plates of modak.' },
  { id: 'karva', name: 'Karva Chauth', emoji: '🌕', tags: { karva: 3, wedding: 2, romantic: 2, desi: 1 }, colors: ['#e0245e', '#c2185b', '#d4af37'], colorWeight: 1.6, desc: 'Bridal red, chooda and the moon through a channi.' },
  { id: 'lohri', name: 'Lohri Bonfire', emoji: '🔥', tags: { harvest: 3, winter: 1, desi: 2, festive: 1 }, colors: ['#e0245e', '#ff9500', '#ffd60a'], desc: 'Phulkari, paranda and dancing by the fire.' },
  { id: 'baisakhi', name: 'Baisakhi', emoji: '🌾', tags: { harvest: 3, desi: 2, festive: 2, party: 1 }, colors: ['#ffd60a', '#ff9500', '#34c759'], desc: 'Harvest season bhangra — dhol, patiala & phulkari.' },
  { id: 'janmashtami', name: 'Janmashtami', emoji: '🦚', tags: { krishna: 3, desi: 2, festive: 1, royal: 1 }, colors: ['#0a84ff', '#ffd60a', '#2d6a4f'], desc: 'Peacock feathers, flute and makhan matki.' },
  { id: 'bihu', name: 'Rongali Bihu', emoji: '🥁', tags: { bihu: 3, desi: 2, festive: 1, cottage: 1 }, colors: ['#f5e6c8', '#c2185b', '#ffffff'], colorWeight: 1.6, desc: 'Mekhela chador, gamosa and spring dancing.' },
  { id: 'teej', name: 'Hariyali Teej', emoji: '🌿', tags: { teej: 3, desi: 2, festive: 2, romantic: 1 }, colors: ['#34c759', '#2d6a4f', '#ffd60a'], colorWeight: 2, desc: 'Green lehariya, bangles and monsoon swings.' },
  { id: 'independence', name: 'Independence Day', emoji: '🇮🇳', tags: { tiranga: 3, festive: 1, casual: 1, desi: 1 }, colors: ['#ff9933', '#ffffff', '#138808'], colorWeight: 2.2, desc: 'Saffron, white and green with pride.' },
  { id: 'ugadi', name: 'Ugadi & Gudi Padwa', emoji: '🌼', tags: { desi: 3, festive: 2, cottage: 1, harvest: 1 }, colors: ['#ffd60a', '#2d6a4f', '#e0245e'], desc: 'New year, new silk, mango leaves at the door.' },
];

/* ---------- seasonal events ---------- */
const look = (skin, slots, pose = 'victory') => ({ skin, height: 1, pose, slots });
const EVENTS = {
  halloween: {
    id: 'halloween', name: 'Spooky Season', short: 'Halloween', sub: 'Halloween 2026 · limited season', token: '🍬', tokenName: 'candy',
    themes: SPOOKY_THEMES, music: 'spooky', badge: 'NOW', icon: '🎃', blurb: 'Spooky themes · earn 🍬 candy for the Halloween collection',
    crowd: ['🎃', '👻', '🦇', '🕷️', '💀', '🧛', '🍬', '😱'],
    hero: look('#E3A87E', { hair: { id: 'wolfcut', c1: '#2a1438' }, eyes: { id: 'e-cat', c1: '#e0245e' }, brows: { id: 'b-arched', c1: '#111111' }, lips: { id: 'l-fangs', c1: '#7a1f3d' }, shadow: { id: 's-smoky', c1: '#2a1438' }, dress: { id: 'witch', c1: '#2a1438' }, back: { id: 'vampcape', c1: '#111111', c2: '#7a1f3d' }, hat: { id: 'mooncrown', c1: '#2a1438', c2: '#ffd60a' }, legwear: { id: 'webtights', c1: '#111111', c2: '#111111', pat: 'web' }, shoes: { id: 'witchboots', c1: '#2a1438' }, neck: { id: 'spiderneck' }, bag: { id: 'pumpkin', c1: '#ff9500' } }, 'superstar'),
  },
  navratri: {
    id: 'navratri', name: 'Navaratri Utsav', short: 'Navaratri', sub: '9 nights of garba & dandiya', token: '🪔', tokenName: 'diyas',
    themes: NAV_THEMES, music: 'garba', badge: 'NOW', icon: '🪔', blurb: 'Garba & dandiya nights · earn 🪔 diyas for festive pieces',
    crowd: ['🪔', '💃', '🥢', '🌼', '✨', '🙌', '😍', '🎉'],
    hero: look('#B97E52', { hair: { id: 'gajra', c1: '#111111' }, eyes: { id: 'e-doe', c1: '#3b2416' }, brows: { id: 'b-arched', c1: '#111111' }, lips: { id: 'l-smile', c1: '#c2185b' }, facedeco: { id: 'fd-bindi', c1: '#e0245e' }, dress: { id: 'chaniyacholi', c1: '#e0245e', c2: '#ffd60a', pat: 'mirror' }, back: { id: 'dupatta', c1: '#ff4fa3', c2: '#ffd60a', pat: 'bandhani' }, ears: { id: 'jhumka', c1: '#d4af37' }, hat: { id: 'maangtikka', c1: '#d4af37', c2: '#e0245e' }, gloves: { id: 'chooriyan', c1: '#e0245e', c2: '#d4af37' }, bag: { id: 'dandiya', c1: '#e0245e', c2: '#ffd60a' }, shoes: { id: 'juttis', c1: '#d4af37', c2: '#e0245e' } }, 'wave'),
  },
  brat: {
    id: 'brat', name: 'brat runway', short: 'brat', sub: '2025 brat collection', token: '💚', tokenName: 'brat tokens',
    themes: BRAT_THEMES, music: 'brat', badge: 'EVENT', icon: '💚', blurb: '2025 brat collection · earn 💚 to unlock',
    crowd: ['💚', '🪩', '🕶️', '😎', '🔥', '📸', '🤩', '💅'],
    hero: look('#E3A87E', { hair: { id: 'bratbob', c1: '#111111' }, eyes: { id: 'e-cat', c1: '#3b2416' }, brows: { id: 'b-straight', c1: '#111111' }, lips: { id: 'l-pout', c1: '#c2185b' }, shadow: { id: 's-messy', c1: '#111111' }, glasses: { id: 'bratshades', c1: '#111111' }, top: { id: 'brattee', c1: '#111111', c2: BRAT }, bottom: { id: 'bratmini', c1: BRAT }, outer: { id: 'leatherjacket', c1: '#1a1a1a' }, legwear: { id: 'bratnets', c1: '#111111' }, shoes: { id: 'bratboots', c1: '#111111', c2: BRAT }, neck: { id: 'bratchoker', c1: BRAT, c2: '#c0c0c0' }, bag: { id: 'bratphone', c1: BRAT } }),
  },
};
for (const ev of Object.values(EVENTS)) ev.themes.forEach(t => { t.ev = ev.id; });
const EVENT_QUESTS = [
  { id: 'walk1', text: 'Walk your first {short} runway', reward: 3, done: s => s.rounds >= 1 },
  { id: 'walk5', text: 'Walk 5 {short} runways', reward: 8, done: s => s.rounds >= 5 },
  { id: 'top3', text: 'Place top 3', reward: 5, done: s => s.top3 >= 1 },
  { id: 'win', text: 'Win a {short} runway', reward: 8, done: s => s.wins >= 1 },
  { id: 'five', text: 'Score 4.5★ or higher', reward: 10, done: s => s.five >= 1 },
  { id: 'fullfit', text: 'Walk wearing 5+ {short} collection pieces', reward: 6, done: s => s.fullfit >= 1 },
];

/* ---------- baddie pass ---------- */
const PASS_XP = 100, PASS_PRICE = 1000, PASS_TIERS = 15;
const passReward = (t, prem) => {
  const it = ITEMS.find(i => i.pass === t && i.prem === prem);
  if (it) return { item: it.id };
  return prem ? { coins: 300 } : { coins: 50 + t * 25, title: t === PASS_TIERS ? 'Certified Baddie' : null };
};

const NPC_NAMES = ['xX_glamQueen_Xx', 'slayyy2011', 'bunnyberry', 'lilmissvogue', 'noobfit404', 'starlightzz', 'ur_fav_model', 'cherrybomb07', 'kawaii_koi', 'lime_lover', 'couture_kid', 'runwayrae', 'velvetvibes', 'mochi_mia', 'sparkle_sav', 'itgirl_ivy', 'goth_gremlin', 'pixie_pop', 'fashionista99', 'dollface_dee', 'moonlit_mae', 'tiny_trendy', 'sk8r_sofi', 'peachyjules', 'catwalk_cass', 'boujee_bea', 'raver_rory', 'honey_hana', 'garba_queen', 'spooky_sana', 'baddie_bree', 'ananya_xo'];
const RANKS = [[0, 'Fashion Newbie'], [100, 'Fashion Enthusiast'], [300, 'Trendsetter'], [700, 'Fashion Influencer'], [1200, 'Runway Diva'], [2000, 'Fashion Icon'], [3500, 'Top Model']];
const CODES = {
  WELCOME: { coins: 500 }, IMPRESS: { coins: 300 }, RUNWAY: { coins: 200 }, SLAY: { coins: 150 },
  BRATSUMMER: { tokens: { brat: 10 } }, LIMEGREEN: { tokens: { brat: 5 } }, CLUBCLASSICS: { tokens: { brat: 5 } },
  SPOOKY: { tokens: { halloween: 10 } }, TRICKORTREAT: { tokens: { halloween: 5 } },
  GARBA: { tokens: { navratri: 10 } }, DANDIYA: { tokens: { navratri: 5 } },
  BADDIE: { passXp: 150 }, HOLI: { tokens: { navratri: 5 } }, UTSAV: { coins: 250 },
};
const REMOVABLE = new Set(['top', 'bottom', 'dress', 'outer', 'shoes', 'legwear', 'hat', 'glasses', 'neck', 'ears', 'bag', 'gloves', 'back', 'shadow', 'blush', 'facedeco']);
const SLOT_LABEL = { hair: 'Hair', eyes: 'Eyes', brows: 'Brows', lips: 'Lips', shadow: 'Eyeshadow & Liner', blush: 'Blush', facedeco: 'Face Details', top: 'Tops', bottom: 'Bottoms', dress: 'Dresses & Sets', outer: 'Outerwear', shoes: 'Shoes', legwear: 'Socks & Tights', hat: 'Hats & Headwear', glasses: 'Glasses', neck: 'Necklaces', ears: 'Earrings', bag: 'Bags & Props', gloves: 'Gloves, Bangles & Nails', back: 'Wings, Capes & Drapes' };
const CATS = [
  { id: 'hair', icon: '💇', name: 'Hair', slots: ['hair'] },
  { id: 'face', icon: '👁️', name: 'Face', slots: ['eyes', 'brows', 'lips'] },
  { id: 'makeup', icon: '💄', name: 'Makeup', slots: ['shadow', 'blush', 'facedeco'] },
  { id: 'tops', icon: '👚', name: 'Tops', slots: ['top'] },
  { id: 'bottoms', icon: '👖', name: 'Bottoms', slots: ['bottom'] },
  { id: 'dresses', icon: '👗', name: 'Dresses', slots: ['dress'] },
  { id: 'outer', icon: '🧥', name: 'Jackets', slots: ['outer'] },
  { id: 'shoes', icon: '👠', name: 'Shoes', slots: ['shoes'] },
  { id: 'legwear', icon: '🧦', name: 'Legwear', slots: ['legwear'] },
  { id: 'hats', icon: '👒', name: 'Hats', slots: ['hat'] },
  { id: 'glasses', icon: '🕶️', name: 'Glasses', slots: ['glasses'] },
  { id: 'jewelry', icon: '💎', name: 'Jewelry', slots: ['neck', 'ears'] },
  { id: 'bags', icon: '👜', name: 'Bags', slots: ['bag', 'gloves'] },
  { id: 'back', icon: '🪽', name: 'Wings', slots: ['back'] },
  { id: 'body', icon: '🎨', name: 'Skin & Body' },
  { id: 'pose', icon: '💃', name: 'Poses' },
  { id: 'seasonal', icon: '🎟️', name: 'Seasons', special: true },
];
const THUMB_VB = { hair: '72 18 156 250', eyes: '104 66 92 66', brows: '104 66 92 66', lips: '116 96 68 46', shadow: '104 66 92 66', blush: '96 66 108 74', facedeco: '96 60 108 84', top: '46 128 208 222', bottom: '60 250 180 300', dress: '24 128 252 440', outer: '30 128 240 340', shoes: '86 420 128 150', legwear: '86 300 128 262', hat: '50 -6 200 160', glasses: '100 66 100 64', neck: '96 110 108 132', ears: '94 66 112 84', bag: '150 230 140 200', gloves: '40 150 220 210', back: '0 60 300 420' };

/* ---------- save ---------- */
const SAVE_KEY = 'dti-brat-save-v1';
const DEFAULT_SAVE = {
  name: '', coins: 250, xp: 0, vip: false, owned: [], redeemed: [], claimed: [], outfits: [null, null, null, null, null, null],
  look: null, lastPose: 'tada', title: '',
  tokens: { brat: 0, halloween: 0, navratri: 0 },
  evStats: {},
  pass: { xp: 0, premium: false, claimed: [] },
  stats: { rounds: 0, wins: 0, top3: 0, bestStars: 0 },
  settings: { time: 180, muted: false, vol: .6 },
};
function migrate(s) {
  s.tokens = { ...DEFAULT_SAVE.tokens, ...(s.tokens || {}) };
  if (s.bratTokens) { s.tokens.brat = Math.max(s.tokens.brat, s.bratTokens); delete s.bratTokens; }
  s.evStats = s.evStats || {};
  for (const k of Object.keys(EVENTS)) s.evStats[k] = { rounds: 0, wins: 0, top3: 0, five: 0, fullfit: 0, ...(s.evStats[k] || {}) };
  const st = s.stats || {};
  if (st.bratRounds !== undefined) {
    const b = s.evStats.brat;
    b.rounds = Math.max(b.rounds, st.bratRounds || 0); b.wins = Math.max(b.wins, st.bratWins || 0); b.top3 = Math.max(b.top3, st.bratTop3 || 0);
    b.five = Math.max(b.five, st.bratFive || 0); b.fullfit = Math.max(b.fullfit, st.bratFullFit || 0);
    ['bratRounds', 'bratWins', 'bratTop3', 'bratFive', 'bratFullFit'].forEach(k => delete st[k]);
  }
  s.claimed = (s.claimed || []).map(c => c.includes(':') ? c : 'brat:' + c);
  s.pass = { ...DEFAULT_SAVE.pass, ...(s.pass || {}) };
  return s;
}
let save = loadSave();
function loadSave() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s) return migrate({ ...clone(DEFAULT_SAVE), ...s, stats: { ...DEFAULT_SAVE.stats, ...(s.stats || {}) }, settings: { ...DEFAULT_SAVE.settings, ...(s.settings || {}) } });
  } catch (e) { /* fresh start */ }
  return migrate(clone(DEFAULT_SAVE));
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* storage blocked */ } }

const rankOf = xp => { let r = RANKS[0]; for (const x of RANKS) if (xp >= x[0]) r = x; return r; };
function rankProgress(xp) {
  const i = RANKS.findIndex(r => r === rankOf(xp)), next = RANKS[i + 1];
  return next ? (xp - RANKS[i][0]) / (next[0] - RANKS[i][0]) : 1;
}
const passLevel = () => Math.min(PASS_TIERS, Math.floor(save.pass.xp / PASS_XP));

function lockInfo(it) {
  if (save.owned.includes(it.id)) return null;
  if (it.pass) return { type: 'pass', tier: it.pass, prem: it.prem };
  if (it.ev && (save.tokens[it.ev] || 0) < it.need) return { type: 'ev', ev: it.ev, need: it.need };
  if (it.vip && !save.vip) return { type: 'vip' };
  if (it.price) return { type: 'price', price: it.price };
  return null;
}

/* ---------- audio (WebAudio synth, no files needed) ---------- */
const Sound = (() => {
  let ctx = null, master = null, timer = null, song = null, step = 0, nextT = 0, noiseBuf = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function init() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.connect(ctx.destination);
        noiseBuf = ctx.createBuffer(1, ctx.sampleRate * .5, ctx.sampleRate);
        const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      } catch (e) { return; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    setVol();
  }
  function setVol() { if (master) master.gain.value = save.settings.muted ? 0 : save.settings.vol * .55; }
  function tone(t, freq, dur, type = 'sine', vol = .15, cutoff = 0, attack = .005) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
    let node = o;
    if (cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cutoff; f.Q.value = 6; o.connect(f); node = f; }
    node.connect(g).connect(master); o.start(t); o.stop(t + dur + .05);
  }
  function kick(t, v = .9, f0 = 150) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(42, t + .13);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + .32);
    o.connect(g).connect(master); o.start(t); o.stop(t + .35);
  }
  function noise(t, dur, vol, hp = 7000, type = 'highpass') {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = type; f.frequency.value = hp;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    s.connect(f).connect(g).connect(master); s.start(t); s.stop(t + dur + .02);
  }
  const SONGS = {
    chill: {
      bpm: 98, chords: [[65, 69, 72, 76], [64, 67, 71, 74], [62, 65, 69, 72], [60, 64, 67, 71]],
      play(t, s, bar) {
        const ch = this.chords[bar % 4];
        if (s === 0 || s === 10) kick(t, .45);
        if (s % 4 === 2) noise(t, .04, .05);
        if (s === 0) ch.forEach(n => tone(t, mtof(n), 1.9, 'triangle', .035, 0, .08));
        if (s % 4 === 0) tone(t, mtof(ch[0] - 24), .35, 'sine', .16);
        if ([0, 3, 6, 8, 11, 14].includes(s)) tone(t, mtof(ch[(s * 7 + bar) % 4] + 12), .3, 'sine', .04);
      },
    },
    runway: {
      bpm: 118, chords: [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]],
      play(t, s, bar) {
        const ch = this.chords[bar % 4];
        if (s % 4 === 0) kick(t, .8);
        if (s % 4 === 2) noise(t, .06, .09);
        if (s === 4 || s === 12) noise(t, .14, .18, 1500, 'bandpass');
        if ([0, 3, 6, 10, 14].includes(s)) tone(t, mtof(ch[0] - 12), .22, 'sawtooth', .09, 600);
        if (s === 2 || s === 10) ch.forEach(n => tone(t, mtof(n + 12), .18, 'square', .025, 2400));
      },
    },
    brat: {
      bpm: 132, bass: [0, 0, 12, 0, 0, 10, 0, 7, 0, 0, 12, 0, 3, 0, 10, 7], roots: [45, 45, 43, 41],
      play(t, s, bar) {
        const root = this.roots[bar % 4];
        if (s % 4 === 0) kick(t, 1);
        if (s % 4 === 2) noise(t, .09, .14, 6000);
        if (s % 2 === 1) noise(t, .03, .04, 9000);
        if (s === 4 || s === 12) noise(t, .16, .22, 1800, 'bandpass');
        const cut = 500 + 1800 * (0.5 + 0.5 * Math.sin((bar * 16 + s) / 10));
        tone(t, mtof(root + this.bass[s]), .13, 'sawtooth', .11, cut);
        if (s === 6 || s === 14) [0, 7, 12].forEach(n => tone(t, mtof(root + 24 + n), .12, 'square', .03, 3000));
      },
    },
    // minor-key organ + music box bells
    spooky: {
      bpm: 92, chords: [[57, 60, 64], [53, 57, 60], [55, 58, 62], [52, 56, 59]], bell: [76, 72, 69, 72, 75, 72, 68, 64],
      play(t, s, bar) {
        const ch = this.chords[bar % 4];
        if (s === 0) ch.forEach(n => tone(t, mtof(n - 12), 1.9, 'sawtooth', .025, 900, .2));
        if (s === 0 || s === 8) kick(t, .5, 90);
        if (s % 4 === 2) noise(t, .05, .04, 8000);
        if (s % 2 === 0) tone(t, mtof(this.bell[(s / 2 + bar * 3) % 8]), .5, 'triangle', .045);
        if (s === 12 && bar % 2) tone(t, mtof(ch[0] - 24), 1, 'sine', .14);
      },
    },
    // dhol-style groove with a raag-flavoured melody
    garba: {
      bpm: 120, scale: [60, 61, 64, 65, 67, 68, 71, 72], mel: [0, 2, 3, 4, 4, 3, 2, 1, 0, 2, 4, 5, 6, 5, 4, 2],
      play(t, s, bar) {
        if ([0, 3, 6, 8, 11, 14].includes(s)) kick(t, .75, 110);
        if ([2, 5, 10, 13].includes(s)) tone(t, 420, .08, 'triangle', .12);
        if (s % 2 === 1) noise(t, .03, .05, 6000);
        if (s === 4 || s === 12) noise(t, .1, .12, 2500, 'bandpass');
        if (s % 2 === 0) tone(t, mtof(this.scale[this.mel[(s / 2 + bar * 4) % 16 % 8]] + (bar % 2 ? 12 : 0)), .22, 'sawtooth', .035, 1600, .02);
        if (s === 0) tone(t, mtof(48), 1.8, 'sawtooth', .03, 500, .1);
      },
    },
  };
  function tick() {
    if (!song || !ctx) return;
    const sp = 60 / song.bpm / 4;
    while (nextT < ctx.currentTime + .12) {
      try { song.play(nextT, step % 16, Math.floor(step / 16)); } catch (e) { /* ignore */ }
      nextT += sp; step++;
    }
  }
  return {
    init, setVol,
    music(id) {
      init(); if (!ctx) return;
      if (song === SONGS[id]) return;
      song = SONGS[id] || null; step = 0; nextT = ctx.currentTime + .05;
      clearInterval(timer); if (song) timer = setInterval(tick, 25);
    },
    sfx(kind) {
      if (!ctx || save.settings.muted) return;
      const t = ctx.currentTime;
      switch (kind) {
        case 'click': tone(t, 880, .06, 'triangle', .08); break;
        case 'pick': tone(t, 660, .07, 'sine', .12); tone(t + .05, 990, .09, 'sine', .1); break;
        case 'star': tone(t, 1320, .12, 'triangle', .1); tone(t + .06, 1760, .16, 'triangle', .08); break;
        case 'flash': noise(t, .18, .3, 3000); break;
        case 'lock': tone(t, 220, .15, 'square', .06, 900); break;
        case 'tick': tone(t, 1500, .04, 'square', .04); break;
        case 'coin': tone(t, 988, .08, 'square', .05); tone(t + .08, 1319, .2, 'square', .05); break;
        case 'win': [72, 76, 79, 84].forEach((n, i) => tone(t + i * .12, mtof(n), .35, 'triangle', .12)); break;
        case 'spin': tone(t, 600 + Math.random() * 600, .05, 'sine', .05); break;
      }
    },
  };
})();
const sfx = k => Sound.sfx(k);

/* ---------- ui helpers ---------- */
function setMode(id) { document.body.dataset.mode = id || ''; }
function show(id) {
  $$('.screen').forEach(s => { s.hidden = s.id !== id; });
  document.body.dataset.screen = id;
  $('#hud').hidden = id === 'scr-title';
  renderHud();
  window.scrollTo(0, 0);
}
function toast(msg, cls = '') {
  const el = document.createElement('div');
  el.className = 'toast ' + cls; el.innerHTML = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3100);
}
let modalResolve = null;
function modal(html, buttons = [{ label: 'OK' }], opts = {}) {
  return new Promise(res => {
    const m = $('#modal');
    if (modalResolve) modalResolve(null);
    modalResolve = res;
    $('#modal-body').innerHTML = html;
    const bar = $('#modal-actions'); bar.innerHTML = '';
    buttons.forEach((b, i) => {
      const el = document.createElement('button');
      el.className = 'btn ' + (b.cls || (i === buttons.length - 1 ? 'primary' : ''));
      el.textContent = b.label;
      el.onclick = () => { sfx('click'); closeModal(b.value ?? i); };
      bar.appendChild(el);
    });
    m.className = 'modal ' + (opts.cls || '');
    m.hidden = false;
    if (opts.onOpen) opts.onOpen($('#modal-body'));
  });
}
function closeModal(v = null) {
  $('#modal').hidden = true;
  const r = modalResolve; modalResolve = null;
  if (r) r(v);
}
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(null); });

function renderHud() {
  const [, rank] = rankOf(save.xp);
  $('#hud').innerHTML = `
    <div class="hud-left">
      <button class="hud-home" id="hud-home" title="Menu">🏠</button>
      <div class="hud-who"><b class="${save.vip ? 'vipname' : ''}">${esc(save.name || 'model')}</b><span class="rank">${save.title ? `${esc(save.title)} · ` : ''}${rank}</span>
        <div class="xpbar" title="${save.xp} XP"><i style="width:${Math.round(rankProgress(save.xp) * 100)}%"></i></div></div>
    </div>
    <div class="hud-right">
      <span class="pill coins" title="Coins">🪙 <b>${save.coins}</b></span>
      <span class="pill tokens" title="Season tokens">${Object.values(EVENTS).map(e => `${e.token}<b>${save.tokens[e.id]}</b>`).join(' ')}</span>
      <button class="pill passpill" id="hud-pass" title="Baddie Pass">💅 <b>Lv ${passLevel()}</b></button>
      ${save.vip ? '<span class="pill vip">👑 VIP</span>' : ''}
      <button class="icon-btn" id="hud-mute" title="Sound">${save.settings.muted ? '🔇' : '🔊'}</button>
      <button class="icon-btn" id="hud-settings" title="Settings">⚙️</button>
    </div>`;
  $('#hud-home').onclick = () => leaveToMenu();
  $('#hud-pass').onclick = () => leaveTo(openPass);
  $('#hud-mute').onclick = () => { save.settings.muted = !save.settings.muted; persist(); Sound.init(); Sound.setVol(); renderHud(); };
  $('#hud-settings').onclick = openSettings;
}

/* ---------- outfits ---------- */
function baseLook() {
  return {
    skin: '#F1C19F', height: 1, pose: 'idle',
    slots: { hair: { id: 'long', c1: '#5a3825' }, eyes: { id: 'e-round', c1: '#6b4226' }, brows: { id: 'b-natural', c1: '#3b2416' }, lips: { id: 'l-smile', c1: '#e07a8a' } },
  };
}
// keep skin/face/hair from the player's last look, clothes start empty (like the real game)
function startingOutfit() {
  const b = baseLook();
  if (save.look) {
    b.skin = save.look.skin || b.skin; b.height = save.look.height || 1;
    for (const k of ['hair', 'eyes', 'brows', 'lips']) {
      const v = save.look.slots?.[k];
      if (v && ITEMS_BY_ID[v.id] && !lockInfo(ITEMS_BY_ID[v.id])) b.slots[k] = v;
    }
  }
  b.pose = save.lastPose || 'tada';
  return b;
}
const tagFit = (it, theme) => it.tags.reduce((s, t) => s + (theme.tags[t] || 0), 0);
function hexDist(a, b) {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  return Math.hypot((x >> 16) - (y >> 16), ((x >> 8) & 255) - ((y >> 8) & 255), (x & 255) - (y & 255));
}
const OPT_SLOTS = { outer: .3, legwear: .3, hat: .3, glasses: .25, neck: .45, ears: .5, bag: .45, gloves: .18, back: .08, shadow: .6, blush: .55, facedeco: .25 };
function genOutfit(theme, skill, o = {}) {
  const out = { skin: o.skin || pick(SKIN_TONES.slice(0, 10)), height: o.height || +(rand(.95, 1.05).toFixed(2)), pose: 'idle', slots: {} };
  const ok = it => o.respectLocks ? !lockInfo(it)
    : it.pass ? !!o.allowPass
      : !it.ev || it.ev === o.allowEv;
  const pool = slot => ITEMS.filter(it => it.slot === slot && ok(it));
  const put = slot => {
    const list = pool(slot); if (!list.length) return;
    let it;
    if (theme && Math.random() < skill) {
      const sample = shuffle(list).slice(0, 3 + Math.round(skill * 6));
      it = sample.sort((a, b) => tagFit(b, theme) - tagFit(a, theme))[0];
    } else it = pick(list);
    let c1 = it.c1, c2 = it.c2, pat = it.pat;
    if (slot === 'hair') c1 = pick(HAIR_COLORS);
    else if (slot === 'eyes') c1 = pick(EYE_COLORS);
    else if (slot === 'brows') c1 = '#3b2416';
    else if (slot === 'lips') c1 = pick(LIP_COLORS);
    else if (!it.ev && !it.pass) {
      if (theme && Math.random() < skill * .85) c1 = pick(theme.colors);
      else if (Math.random() < .45) c1 = pick(PALETTE);
      if (Math.random() < .3) c2 = pick(PALETTE);
      if (!it.noPat && Math.random() < .15) pat = pick(PATTERNS.filter(x => x !== 'mesh' && x !== 'web'));
    }
    out.slots[slot] = { id: it.id, c1, c2, pat };
  };
  ['hair', 'eyes', 'brows', 'lips'].forEach(put);
  if (Math.random() < .45) put('dress');
  else { put('top'); if (skill > .12 || Math.random() < .6) put('bottom'); }
  if (Math.random() < .9) put('shoes');
  for (const [slot, pr] of Object.entries(OPT_SLOTS)) if (Math.random() < pr * (o.extra || 1) + skill * .15) put(slot);
  out.pose = pick(Object.keys(POSES).filter(k => k !== 'idle'));
  return out;
}

function evaluate(outfit, theme) {
  const s = outfit.slots;
  const worn = Object.entries(s).filter(([k, v]) => v && ITEMS_BY_ID[v.id] && !(s.dress && (k === 'top' || k === 'bottom'))).map(([k, v]) => ({ slot: k, inst: v, it: ITEMS_BY_ID[v.id] }));
  let tag = 0;
  for (const w of worn) tag += Math.min(tagFit(w.it, theme), 5);
  const hasBody = !!(s.dress || (s.top && s.bottom));
  let base = hasBody ? 3 : (s.top || s.bottom ? -3 : -8);
  const shoes = !!s.shoes; if (shoes) base += 1.5;
  const acc = ['outer', 'legwear', 'hat', 'glasses', 'neck', 'ears', 'bag', 'gloves', 'back'].filter(k => s[k]).length;
  base += Math.min(acc, 5) * .6;
  const makeup = ['shadow', 'blush', 'facedeco'].filter(k => s[k]).length;
  base += Math.min(makeup, 3) * .4;
  let color = 0;
  const cw = theme.colorWeight || 1;
  for (const w of worn) {
    if (['eyes', 'brows', 'lips', 'shadow', 'blush', 'facedeco'].includes(w.slot)) continue;
    const c = w.inst.c1 || w.it.c1;
    if (theme.colors.some(tc => hexDist(c, tc) < 95)) color += .7 * cw;
  }
  color = Math.min(color, 4 * cw);
  const pats = worn.filter(w => !w.it.noPat && (w.inst.pat || 'solid') !== 'solid').length;
  const patScore = Math.min(pats, 3) * .3;
  const evCount = theme.ev ? worn.filter(w => w.it.ev === theme.ev).length : 0;
  const raw = tag + base + color + patScore;
  const stars = clamp(1 + 4 * (1 - Math.exp(-Math.max(0, raw - 4) / 26)), 1, 5);
  return { stars, raw, tag, color, hasBody, shoes, acc, makeup, evCount };
}
function feedback(ev, theme) {
  const f = [];
  if (ev.tag >= 22) f.push(`Totally on theme — the judges <b>felt</b> the “${esc(theme.name)}” vibe!`);
  else if (ev.tag >= 10) f.push('Pretty on theme, but you could lean in harder.');
  else f.push(`Hmm… nobody was sure how this fits “${esc(theme.name)}”.`);
  if (ev.color >= 2.5) f.push('Your color palette was spot on 🎨');
  else if (ev.color < .8) f.push('Try colors that match the theme next time.');
  if (!ev.hasBody) f.push('You forgot some clothes… 😳');
  if (!ev.shoes) f.push('No shoes?! Bold choice.');
  if (ev.acc >= 4) f.push('Accessories were serving ✨');
  if (ev.makeup >= 2) f.push('Love the glam 💄');
  if (theme.ev && ev.evCount >= 3) f.push({ brat: 'so brat. so iconic. 💚', halloween: 'Spooktacular costume! 🎃', navratri: 'Garba-ready and gorgeous! 🪔' }[theme.ev]);
  return f;
}

/* ==========================================================
   TITLE + MENU
   ========================================================== */
function initTitle() {
  $('#name-input').value = save.name || '';
  const models = [genOutfit(pick(THEMES), .8), clone(EVENTS.halloween.hero), genOutfit(pick(NAV_THEMES), .9, { allowEv: 'navratri' })];
  $('#title-models').innerHTML = models.map((m, i) => `<div class="tm tm${i}">${renderCharacter(m)}</div>`).join('');
  $('#name-form').onsubmit = e => {
    e.preventDefault();
    const n = $('#name-input').value.trim().slice(0, 18);
    save.name = n || pick(['glam_newbie', 'runway_rookie', 'baddie_in_training']);
    persist(); Sound.init(); Sound.music('chill'); sfx('pick');
    goMenu();
  };
}
function goMenu() {
  stopDressTimer();
  if (G) G.aborted = true;
  G = null;
  setMode('');
  show('scr-menu');
  Sound.music('chill');
  const card = (act, cls, inner) => `<button class="menu-card ${cls}" data-act="${act}">${inner}</button>`;
  const ev = e => card('ev:' + e.id, 'evcard ev-' + e.id, `<span class="mc-badge">${e.badge}</span><span class="mc-icon">${e.icon}</span><b class="ev-font">${esc(e.name)}</b><small>${esc(e.blurb)}</small><span class="mc-tok">${e.token} ${save.tokens[e.id]}</span>`);
  $('#menu-grid').innerHTML =
    card('classic', 'classic', `<span class="mc-icon">👗</span><b>Classic Runway</b><small>${THEMES.length} themes · swim, weddings & holidays · 7 rivals</small>`) +
    ev(EVENTS.halloween) + ev(EVENTS.navratri) +
    card('festivals', 'festcard', `<span class="mc-badge">NEW</span><span class="mc-icon">🇮🇳</span><b>Festivals of India</b><small>${FESTIVAL_THEMES.length} festivals · Holi, Eid, Onam, Diwali, Bihu… · earn 🪔 diyas</small>`) +
    card('pass', 'passcard', `<span class="mc-badge">SEASON 1</span><span class="mc-icon">💅</span><b>Baddie Pass</b><small>Level ${passLevel()}/${PASS_TIERS} · ${save.pass.premium ? 'Premium unlocked' : 'free + premium rewards'}</small>`) +
    ev(EVENTS.brat) +
    card('free', '', '<span class="mc-icon">🪞</span><b>Wardrobe</b><small>Free play · no timer · photo mode</small>') +
    card('vip', '', '<span class="mc-icon">👑</span><b>VIP Lounge</b><small>VIP pieces · double coins</small>') +
    card('codes', '', '<span class="mc-icon">🎟️</span><b>Codes</b><small>Redeem free rewards</small>') +
    card('howto', '', '<span class="mc-icon">❓</span><b>How to Play</b><small>Rules, stars, seasons & pass</small>');
  $$('.menu-card').forEach(b => b.onclick = () => {
    sfx('click');
    const a = b.dataset.act;
    if (a.startsWith('ev:')) return openEventHub(a.slice(3));
    ({ classic: () => startRound('classic'), festivals: () => startRound('festivals'), pass: openPass, free: () => enterDress(true), vip: openVip, codes: openCodes, howto: openHowTo })[a]();
  });
  const st = save.stats;
  $('#menu-stats').innerHTML = `<span>🏁 ${st.rounds} rounds</span><span>🏆 ${st.wins} wins</span><span>🥉 ${st.top3} podiums</span><span>⭐ best ${st.bestStars.toFixed(1)}</span>`;
}
async function leaveTo(fn) {
  if (G && !G.aborted && ['scr-dress', 'scr-runway', 'scr-lobby'].includes(document.body.dataset.screen)) {
    const r = await modal('<h2>Leave this round?</h2><p>Your outfit won\'t be judged and you won\'t earn rewards.</p>', [{ label: 'Stay', value: false, cls: '' }, { label: 'Leave', value: true }]);
    if (!r) return;
  }
  stopDressTimer();
  if (G) G.aborted = true;
  G = null;
  fn();
}
const leaveToMenu = () => leaveTo(goMenu);

function openSettings() {
  modal(`<h2>⚙️ Settings</h2>
    <label class="field">Dressing time
      <select id="set-time">${[[120, '2 minutes'], [180, '3 minutes'], [300, '5 minutes'], [480, '8 minutes']].map(([v, l]) => `<option value="${v}" ${save.settings.time === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="field">Music & sound volume <input id="set-vol" type="range" min="0" max="1" step=".05" value="${save.settings.vol}"></label>
    <label class="field">Model name <input id="set-name" maxlength="18" value="${esc(save.name)}"></label>
    <details class="danger"><summary>Danger zone</summary><button class="btn" id="set-reset">Reset all progress</button></details>`,
    [{ label: 'Done' }], {
      onOpen: body => {
        $('#set-time', body).onchange = e => { save.settings.time = +e.target.value; persist(); };
        $('#set-vol', body).oninput = e => { save.settings.vol = +e.target.value; Sound.setVol(); persist(); };
        $('#set-name', body).onchange = e => { save.name = e.target.value.trim().slice(0, 18) || save.name; persist(); renderHud(); };
        $('#set-reset', body).onclick = async () => {
          const r = await modal('<h2>Reset everything?</h2><p>Coins, ranks, unlocked items, the Baddie Pass, saved outfits and season tokens will be wiped. This can\'t be undone.</p>', [{ label: 'Cancel', value: false, cls: '' }, { label: 'Reset', value: true, cls: 'danger' }]);
          if (r) { save = migrate(clone(DEFAULT_SAVE)); persist(); location.reload(); }
        };
      },
    });
}
const itemThumb = (it, extra = {}) => renderCharacter({ skin: '#F1C19F', slots: { ...extra, [it.slot]: { id: it.id } } }, { vb: THUMB_VB[it.slot], cls: 'thumb', noShadow: true, par: 'xMidYMid meet' });
const FACE_DEMO = { eyes: { id: 'e-almond', c1: '#3b2416' }, brows: { id: 'b-arched', c1: '#3b2416' }, lips: { id: 'l-smile', c1: '#c2185b' }, hair: { id: 'bun', c1: '#3b2416' } };
const demoFor = it => ['hat', 'glasses', 'ears', 'shadow', 'hair', 'eyes', 'lips', 'facedeco', 'blush'].includes(it.slot) ? FACE_DEMO : {};
function openVip() {
  if (save.vip) return modal('<h2>👑 VIP Lounge</h2><p>You\'re VIP! All VIP pieces are unlocked and you earn <b>double coins</b> every round.</p>', [{ label: 'Slay' }]);
  const vipItems = ITEMS.filter(i => i.vip);
  modal(`<h2>👑 VIP Lounge</h2><p>Get VIP with in-game coins to unlock:</p>
    <div class="mini-grid">${vipItems.map(it => `<div class="mini-tile">${itemThumb(it, demoFor(it))}<span>${esc(it.name)}</span></div>`).join('')}</div>
    <p>…plus <b>2× coins</b> from every runway.</p><p class="price-line">Price: 🪙 1500 (you have ${save.coins})</p>`,
    [{ label: 'Maybe later', value: false, cls: '' }, { label: 'Buy VIP 🪙1500', value: true }]).then(r => {
      if (!r) return;
      if (save.coins < 1500) { sfx('lock'); return toast('Not enough coins yet — walk more runways! 🪙', 'bad'); }
      save.coins -= 1500; save.vip = true; persist(); renderHud(); sfx('win'); toast('👑 Welcome to VIP!', 'good');
    });
}
function openCodes() {
  modal(`<h2>🎟️ Codes</h2><p>Enter a code to claim free rewards. <span class="hint">Psst — try <b>WELCOME</b>, <b>SPOOKY</b>, <b>GARBA</b> or <b>BADDIE</b>.</span></p>
    <input id="code-in" class="code-in" placeholder="ENTER CODE" maxlength="20">`,
    [{ label: 'Close', value: null, cls: '' }, { label: 'Redeem', value: 'go' }], { onOpen: b => $('#code-in', b).focus() }).then(r => {
      if (r !== 'go') return;
      redeem(($('#code-in')?.value || '').trim().toUpperCase());
    });
  $('#code-in').addEventListener('keydown', e => { if (e.key === 'Enter') { const code = e.target.value.trim().toUpperCase(); closeModal(null); redeem(code); } });
}
function redeem(code) {
  const c = CODES[code];
  if (!c) { sfx('lock'); return toast('Invalid code 😢', 'bad'); }
  if (save.redeemed.includes(code)) { sfx('lock'); return toast('Code already redeemed!', 'bad'); }
  save.redeemed.push(code);
  const got = [];
  if (c.coins) { save.coins += c.coins; got.push(`+${c.coins} 🪙`); }
  for (const [ev, n] of Object.entries(c.tokens || {})) { addTokens(ev, n); got.push(`+${n} ${EVENTS[ev].token}`); }
  if (c.passXp) { addPassXp(c.passXp); got.push(`+${c.passXp} 💅 pass XP`); }
  persist(); renderHud(); sfx('coin');
  toast(`Code redeemed! ${got.join(' ')}`, 'good');
  if (document.body.dataset.screen === 'scr-menu') goMenu();
}
function openHowTo() {
  modal(`<h2>❓ How to play</h2>
  <ol class="howto">
    <li><b>Get a theme.</b> Every round spins a random theme — Pool Party, Here Comes the Bride, Christmas Party, Goth Night…</li>
    <li><b>Dress up before the timer ends.</b> Pick hair, face, makeup, clothes, shoes & accessories. Tap a piece twice to take it off. Change colors and patterns in the panel.</li>
    <li><b>Walk the runway.</b> Everyone struts one by one. Rate each rival 1–5 ⭐. On your turn, hit a pose (keys 1–8)!</li>
    <li><b>Get judged.</b> Pieces that match the theme, theme colors, a complete look (top+bottom or a dress, shoes) and accessories all score.</li>
    <li><b>Earn rewards.</b> Coins buy locked pieces 🪙, XP ranks you up from <i>Fashion Newbie</i> to <i>Top Model</i>.</li>
    <li><b>Seasons 🎃 🪔 💚</b> Walk seasonal runways to earn candy, diyas or brat tokens and unlock each season's collection. Finish quests for bonus tokens.</li>
    <li><b>Festivals of India 🇮🇳</b> Holi, Diwali, Raksha Bandhan, Eid, Onam, Ganesh Chaturthi, Karva Chauth, Lohri, Baisakhi, Bihu, Teej, Independence Day and more — each with festive outfits. Earns 🪔 diyas too!</li>
    <li><b>Baddie Pass 💅</b> Every runway earns pass XP. Claim free rewards each level — or unlock Premium for the full baddie collection.</li>
  </ol>`, [{ label: 'Got it!' }]);
}

/* ==========================================================
   ROUND: LOBBY
   ========================================================== */
let G = null;
const themesFor = mode => mode === 'classic' ? THEMES : mode === 'festivals' ? FESTIVAL_THEMES : EVENTS[mode].themes;
// Festivals of India borrows the Navaratri look, music and diya rewards
const lookFor = mode => EVENTS[mode] || (mode === 'festivals' ? EVENTS.navratri : null);
function startRound(mode) {
  const theme = pick(themesFor(mode));
  const ev = EVENTS[mode];
  const names = shuffle(NPC_NAMES).slice(0, 7);
  const npcs = names.map(n => {
    const skill = clamp(Math.pow(Math.random(), .6) + (/noob/.test(n) ? -.6 : 0), 0, 1);
    const evPool = ev ? ev.id : mode === 'festivals' ? 'navratri' : null;
    return { name: n, npc: true, skill, harsh: rand(-.45, .3), outfit: genOutfit(theme, skill, { allowEv: evPool && Math.random() < .75 ? evPool : null, allowPass: Math.random() < .3 }) };
  });
  G = { mode, theme, players: [{ name: save.name, me: true }, ...npcs], votes: {}, fast: false, aborted: false };
  const lk = lookFor(mode);
  setMode(lk ? lk.id : '');
  show('scr-lobby');
  Sound.music(lk ? lk.music : 'chill');
  $('#lobby-sub').textContent = ev ? `${ev.name} · ${ev.sub}` : mode === 'festivals' ? '🇮🇳 Festivals of India · 8 models' : 'Classic runway · 8 models';
  const me = startingOutfit();
  $('#lobby-players').innerHTML = G.players.map((pl, i) => {
    const lk = pl.me ? me : pl.outfit;
    return `<div class="lp ${pl.me ? 'me' : ''}" style="animation-delay:${i * 80}ms">${headSvg(lk)}<span>${esc(pl.name)}${pl.me ? ' (you)' : ''}</span></div>`;
  }).join('');
  spinTheme();
}
const headSvg = lk => renderCharacter({ skin: lk.skin, slots: { hair: lk.slots.hair, eyes: lk.slots.eyes, brows: lk.slots.brows, lips: lk.slots.lips } }, { vb: '84 26 132 124', cls: 'head', noShadow: true, par: 'xMidYMid meet' });
async function spinTheme() {
  const list = themesFor(G.mode);
  const el = $('#theme-spin'), btn = $('#btn-start-dress'), g = G;
  btn.hidden = true; $('#theme-spin-desc').textContent = '';
  el.classList.add('spinning');
  for (let i = 0; i < 22; i++) {
    const t = list[(i * 7 + Math.floor(Math.random() * 3)) % list.length];
    el.textContent = `${t.emoji} ${t.name}`;
    sfx('spin');
    await sleep(60 + i * 9);
    if (g !== G) return;
  }
  el.classList.remove('spinning');
  el.textContent = `${G.theme.emoji} ${G.theme.name}`;
  $('#theme-spin-desc').textContent = G.theme.desc;
  sfx('win');
  btn.hidden = false;
  btn.onclick = () => { sfx('click'); enterDress(false); };
}

/* ==========================================================
   DRESSING ROOM
   ========================================================== */
const D = { outfit: null, cat: 'tops', active: 'top', history: [], free: false, zoom: false, timeLeft: 0, timer: null };
function enterDress(free) {
  D.free = free;
  if (free) { G = null; setMode(''); Sound.music('chill'); }
  D.outfit = startingOutfit();
  if (free && save.look) D.outfit = clone(save.look);
  D.history = []; D.zoom = false;
  show('scr-dress');
  $('#scr-dress').classList.toggle('free', free);
  if (free) {
    $('#dress-theme-label').textContent = 'WARDROBE';
    $('#dress-theme').textContent = '🪞 Free play';
    $('#dress-theme-desc').textContent = 'No timer, no judges — just vibes. Save outfits & take photos.';
    $('#dress-timer').hidden = true;
    $('#others').innerHTML = '';
  } else {
    const ev = EVENTS[G.mode];
    $('#dress-theme-label').textContent = ev ? `${ev.name} theme` : G.mode === 'festivals' ? 'Festivals of India' : 'THEME';
    $('#dress-theme').textContent = `${G.theme.emoji} ${G.theme.name}`;
    $('#dress-theme-desc').textContent = G.theme.desc;
    $('#dress-timer').hidden = false;
    D.timeLeft = save.settings.time;
    renderOthers();
    startDressTimer();
  }
  $('#btn-ready').hidden = free;
  renderCats();
  selectCat(free ? 'hair' : (G && lookFor(G.mode) ? 'seasonal' : 'tops'));
  updatePreview();
}
function renderOthers() {
  if (!G) return;
  const total = save.settings.time;
  $('#others').innerHTML = G.players.filter(p => p.npc).map(pl => {
    const ready = D.timeLeft < total * (1 - pl.skill * .5) - 20;
    return `<div class="other ${ready ? 'ready' : ''}" title="${esc(pl.name)}">${headSvg(pl.outfit)}<i>${ready ? '✔' : '…'}</i></div>`;
  }).join('');
}
function startDressTimer() {
  stopDressTimer();
  const tick = () => {
    const m = Math.floor(D.timeLeft / 60), s = D.timeLeft % 60;
    const el = $('#dress-timer');
    el.textContent = `${m}:${String(s).padStart(2, '0')}`;
    el.classList.toggle('urgent', D.timeLeft <= 20);
    if (D.timeLeft <= 10 && D.timeLeft > 0) sfx('tick');
    if (D.timeLeft % 5 === 0) renderOthers();
    if (D.timeLeft <= 0) { stopDressTimer(); finishDressing(); return; }
    D.timeLeft--;
  };
  tick();
  D.timer = setInterval(tick, 1000);
}
function stopDressTimer() { clearInterval(D.timer); D.timer = null; }

function renderCats() {
  $('#cats').innerHTML = CATS.map(c => `<button class="cat ${c.special ? 'cat-season' : ''}" data-cat="${c.id}" title="${c.name}"><span>${c.icon}</span><small>${c.name}</small></button>`).join('');
  $$('.cat').forEach(b => b.onclick = () => { sfx('click'); selectCat(b.dataset.cat); });
}
function selectCat(id) {
  D.cat = id;
  const c = CATS.find(x => x.id === id);
  D.active = c.slots ? c.slots[0] : null;
  $$('.cat').forEach(b => b.classList.toggle('on', b.dataset.cat === id));
  renderGrid(); renderCustom();
  $('#grid').scrollTop = 0;
}
function thumbOutfit(slot, inst) {
  const o = { skin: D.outfit.skin, height: 1, pose: 'idle', slots: {} };
  if (['eyes', 'brows', 'lips', 'shadow', 'blush', 'facedeco', 'hat', 'glasses', 'ears', 'hair'].includes(slot)) for (const k of ['eyes', 'brows', 'lips']) o.slots[k] = D.outfit.slots[k];
  if (['hat', 'glasses', 'ears'].includes(slot)) o.slots.hair = D.outfit.slots.hair;
  o.slots[slot] = inst;
  return o;
}
function lockBadge(lock) {
  if (lock.type === 'ev') return `<em class="lk ev-${lock.ev}">${EVENTS[lock.ev].token}${lock.need}</em>`;
  if (lock.type === 'pass') return `<em class="lk pass">💅${lock.tier}${lock.prem ? '+' : ''}</em>`;
  if (lock.type === 'vip') return '<em class="lk vip">👑</em>';
  return `<em class="lk">🪙${lock.price}</em>`;
}
function tileHtml(it) {
  const cur = D.outfit.slots[it.slot];
  const on = cur && cur.id === it.id;
  const lock = lockInfo(it);
  const inst = on ? cur : { id: it.id };
  const badge = lock ? lockBadge(lock) : it.vip ? '<em class="tag vip">VIP</em>' : it.ev ? `<em class="tag ev-${it.ev}">${EVENTS[it.ev].token}</em>` : it.pass ? '<em class="tag pass">💅</em>' : '';
  return `<button class="tile ${on ? 'on' : ''} ${lock ? 'locked' : ''}" data-id="${it.id}" title="${esc(it.name)}">${renderCharacter(thumbOutfit(it.slot, inst), { vb: THUMB_VB[it.slot], cls: 'thumb', noShadow: true, par: 'xMidYMid meet' })}<span>${esc(it.name)}</span>${badge}</button>`;
}
function renderGrid() {
  const grid = $('#grid');
  const c = CATS.find(x => x.id === D.cat);
  let html = '';
  if (c.id === 'body') {
    html = `<h3>Skin tone</h3><div class="swatches big">${SKIN_TONES.map(s => `<button class="sw ${D.outfit.skin === s ? 'on' : ''}" data-skin="${s}" style="background:${s}"></button>`).join('')}</div>
      <h3>Height</h3><input type="range" id="height" min=".9" max="1.08" step=".01" value="${D.outfit.height || 1}">
      <p class="hint">Tip: fantasy skin tones (blue, lilac, lime, pink) are great for Fairycore & Halloween!</p>`;
  } else if (c.id === 'pose') {
    html = `<h3>Runway pose</h3><p class="hint">This is the pose you'll strike at the end of the runway. You can also switch poses live with keys 1–8.</p><div class="grid">` +
      Object.entries(POSES).filter(([k]) => k !== 'idle').map(([k, ps]) => `<button class="tile pose ${D.outfit.pose === k ? 'on' : ''}" data-pose="${k}">${renderCharacter({ ...D.outfit, pose: k }, { cls: 'thumb', noShadow: true, par: 'xMidYMid meet', vb: '0 0 300 580' })}<span>${ps.name}</span></button>`).join('') + '</div>';
  } else if (c.id === 'seasonal') {
    const order = G && EVENTS[G.mode] ? [G.mode, ...Object.keys(EVENTS).filter(k => k !== G.mode)] : Object.keys(EVENTS);
    for (const k of order) {
      const ev = EVENTS[k], items = ITEMS.filter(i => i.ev === k).sort((a, b) => a.need - b.need);
      html += `<div class="season-banner ev-${k}"><b class="ev-font">${ev.icon} ${esc(ev.name)}</b><small>${items.filter(i => !lockInfo(i)).length}/${items.length} unlocked · you have ${ev.token} ${save.tokens[k]}</small></div><div class="grid">${items.map(tileHtml).join('')}</div>`;
    }
    const festItems = ITEMS.filter(i => i.fest);
    const festHtml = `<div class="season-banner festbanner"><b>🇮🇳 Festivals of India</b><small>${festItems.length} festive pieces · Holi, Eid, Onam, Diwali & more</small></div><div class="grid">${festItems.map(tileHtml).join('')}</div>`;
    html = G && G.mode === 'festivals' ? festHtml + html : html + festHtml;
    const passItems = ITEMS.filter(i => i.pass).sort((a, b) => a.pass - b.pass);
    html += `<div class="season-banner passbanner"><b>💅 Baddie Pass</b><small>Level ${passLevel()} · claim rewards in the pass</small></div><div class="grid">${passItems.map(tileHtml).join('')}</div>`;
  } else {
    for (const slot of c.slots) {
      const items = ITEMS.filter(i => i.slot === slot);
      html += `<h3>${SLOT_LABEL[slot]}</h3><div class="grid">`;
      if (REMOVABLE.has(slot)) html += `<button class="tile none ${!D.outfit.slots[slot] ? 'on' : ''}" data-none="${slot}"><b>✕</b><span>None</span></button>`;
      html += items.map(tileHtml).join('') + '</div>';
    }
  }
  grid.innerHTML = html;
  $$('.tile[data-id]', grid).forEach(b => b.onclick = () => equip(b.dataset.id));
  $$('.tile[data-none]', grid).forEach(b => b.onclick = () => { pushHistory(); D.outfit.slots[b.dataset.none] = null; D.active = b.dataset.none; sfx('click'); refresh(); });
  $$('[data-skin]', grid).forEach(b => b.onclick = () => { pushHistory(); D.outfit.skin = b.dataset.skin; sfx('pick'); refresh(); });
  $$('[data-pose]', grid).forEach(b => b.onclick = () => { D.outfit.pose = b.dataset.pose; save.lastPose = b.dataset.pose; persist(); sfx('flash'); refresh(); });
  const h = $('#height', grid);
  if (h) { h.onchange = () => pushHistory(); h.oninput = () => { D.outfit.height = +h.value; updatePreview(); }; }
}
function renderCustom() {
  const box = $('#custom');
  const slot = D.active, inst = slot && D.outfit.slots[slot];
  if (!inst || !ITEMS_BY_ID[inst.id]) { box.innerHTML = '<div class="custom-empty">Pick an item to customize its colors & patterns 🎨</div>'; return; }
  const it = ITEMS_BY_ID[inst.id];
  const pal = slot === 'hair' ? HAIR_COLORS : slot === 'eyes' ? EYE_COLORS : slot === 'lips' ? LIP_COLORS : PALETTE;
  const pat = inst.pat || it.pat || 'solid';
  const showC2 = it.two || (!it.noPat && pat !== 'solid');
  const sw = (key, list) => `<div class="swatches">${list.map(c => `<button class="sw ${(inst[key] || it[key]) === c ? 'on' : ''}" data-k="${key}" data-c="${c}" style="background:${c}" title="${c}"></button>`).join('')}<label class="sw custom-c" title="Custom color"><input type="color" data-k="${key}" value="${inst[key] || it[key]}"></label></div>`;
  box.innerHTML = `<div class="custom-head"><b>${esc(it.name)}</b><span>${SLOT_LABEL[slot]}</span>${REMOVABLE.has(slot) ? '<button class="btn small" id="c-remove">Remove</button>' : ''}<button class="btn small" id="c-default">Default colors</button></div>
    <div class="clabel">Color${showC2 ? ' 1' : ''}</div>${sw('c1', pal)}
    ${showC2 ? `<div class="clabel">Color 2 ${!it.noPat && pat !== 'solid' ? '(pattern)' : ''}</div>${sw('c2', PALETTE)}` : ''}
    ${it.noPat ? '' : `<div class="clabel">Pattern</div><div class="patterns">${PATTERNS.map(pt => `<button class="pt ${pat === pt ? 'on' : ''}" data-pat="${pt}" title="${pt}"><svg viewBox="0 0 30 30"><defs>${patternDef('pp-' + pt, pt, inst.c1 || it.c1, inst.c2 || it.c2)}</defs><rect width="30" height="30" rx="6" fill="${pt === 'solid' ? (inst.c1 || it.c1) : `url(#pp-${pt})`}"/></svg><span>${pt}</span></button>`).join('')}</div>`}`;
  $$('.sw[data-c]', box).forEach(b => b.onclick = () => { pushHistory(); inst[b.dataset.k] = b.dataset.c; sfx('pick'); refresh(); });
  $$('input[type=color]', box).forEach(inp => {
    inp.onchange = () => { refresh(); };
    inp.oninput = () => { if (!inp._pushed) { pushHistory(); inp._pushed = true; } inst[inp.dataset.k] = inp.value; updatePreview(); };
  });
  $$('.pt', box).forEach(b => b.onclick = () => { pushHistory(); inst.pat = b.dataset.pat; sfx('pick'); refresh(); });
  const rm = $('#c-remove', box); if (rm) rm.onclick = () => { pushHistory(); D.outfit.slots[slot] = null; sfx('click'); refresh(); };
  $('#c-default', box).onclick = () => { pushHistory(); inst.c1 = it.c1; inst.c2 = it.c2; inst.pat = it.pat; sfx('click'); refresh(); };
}
function equip(id) {
  const it = ITEMS_BY_ID[id];
  const lock = lockInfo(it);
  if (lock) return showLock(it, lock);
  pushHistory();
  const slot = it.slot, cur = D.outfit.slots[slot];
  if (cur && cur.id === id && REMOVABLE.has(slot)) {
    D.outfit.slots[slot] = null;
    sfx('click');
  } else {
    D.outfit.slots[slot] = { id, c1: it.c1, c2: it.c2, pat: it.pat };
    if (slot === 'dress') { D.outfit.slots.top = null; D.outfit.slots.bottom = null; }
    if (slot === 'top' || slot === 'bottom') D.outfit.slots.dress = null;
    sfx('pick');
  }
  D.active = slot;
  refresh();
}
function showLock(it, lock) {
  sfx('lock');
  const thumb = renderCharacter(thumbOutfit(it.slot, { id: it.id }), { vb: THUMB_VB[it.slot], cls: 'thumb', noShadow: true, par: 'xMidYMid meet' });
  const goEv = evId => () => (D.free ? (stopDressTimer(), openEventHub(evId)) : leaveTo(() => openEventHub(evId)));
  if (lock.type === 'ev') {
    const ev = EVENTS[lock.ev];
    return modal(`<div class="lock-pop"><div class="lock-thumb ev-bg-${ev.id}">${thumb}</div><h2>${esc(it.name)}</h2><p>Part of the <b>${esc(ev.name)}</b> collection. Unlocks at <b>${ev.token} ${lock.need}</b> ${ev.tokenName} — you have ${ev.token} ${save.tokens[ev.id]}.</p><p class="hint">Walk ${esc(ev.short)} runways & finish quests to earn ${ev.tokenName}.</p></div>`,
      [{ label: 'OK', value: null, cls: '' }, { label: `Go to ${ev.short} ${ev.icon}`, value: 'hub' }]).then(r => { if (r === 'hub') goEv(ev.id)(); });
  }
  if (lock.type === 'pass') {
    return modal(`<div class="lock-pop"><div class="lock-thumb passbg">${thumb}</div><h2>${esc(it.name)}</h2><p><b>💅 Baddie Pass</b> reward — level ${lock.tier}${lock.prem ? ' (Premium track)' : ' (free track)'}. You're level ${passLevel()}.</p><p class="hint">Earn pass XP from every runway, then claim it in the pass.</p></div>`,
      [{ label: 'OK', value: null, cls: '' }, { label: 'Open Baddie Pass 💅', value: 'pass' }]).then(r => { if (r === 'pass') (D.free ? (stopDressTimer(), openPass()) : leaveTo(openPass)); });
  }
  if (lock.type === 'vip') {
    return modal(`<div class="lock-pop"><div class="lock-thumb">${thumb}</div><h2>${esc(it.name)}</h2><p>This is a <b>👑 VIP</b> item.</p></div>`, [{ label: 'OK', value: null, cls: '' }, { label: 'VIP Lounge', value: 'vip' }]).then(r => { if (r === 'vip') openVip(); });
  }
  return modal(`<div class="lock-pop"><div class="lock-thumb">${thumb}</div><h2>${esc(it.name)}</h2><p>Buy for <b>🪙 ${lock.price}</b>? You have 🪙 ${save.coins}.</p></div>`,
    [{ label: 'Cancel', value: false, cls: '' }, { label: `Buy 🪙${lock.price}`, value: true }]).then(r => {
      if (!r) return;
      if (save.coins < lock.price) { sfx('lock'); return toast('Not enough coins 🪙', 'bad'); }
      save.coins -= lock.price; save.owned.push(it.id); persist(); renderHud(); sfx('coin');
      toast(`Bought ${esc(it.name)}!`, 'good');
      equip(it.id);
    });
}
function pushHistory() { D.history.push(clone(D.outfit)); if (D.history.length > 60) D.history.shift(); }
function undo() { if (!D.history.length) return; D.outfit = D.history.pop(); sfx('click'); refresh(); }
function refresh() { updatePreview(); renderGrid(); renderCustom(); }
function updatePreview() {
  const el = $('#preview');
  el.innerHTML = renderCharacter(D.outfit, { cls: 'char big', vb: D.zoom ? '60 10 180 200' : '0 0 300 580', par: 'xMidYMid meet' });
  el.classList.toggle('zoomed', D.zoom);
}

$('#btn-undo').onclick = undo;
$('#btn-random').onclick = () => {
  pushHistory();
  const th = G ? G.theme : pick(THEMES);
  D.outfit = genOutfit(th, .55, { respectLocks: true, skin: D.outfit.skin, height: D.outfit.height, extra: 1.3 });
  D.outfit.pose = save.lastPose || 'tada';
  sfx('pick'); refresh();
};
$('#btn-reset').onclick = () => { pushHistory(); const b = baseLook(); b.skin = D.outfit.skin; ['hair', 'eyes', 'brows', 'lips'].forEach(k => { b.slots[k] = D.outfit.slots[k]; }); b.pose = D.outfit.pose; D.outfit = b; sfx('click'); refresh(); };
$('#btn-zoom').onclick = () => { D.zoom = !D.zoom; $('#btn-zoom').textContent = D.zoom ? '🔍 Full body' : '🔍 Zoom face'; updatePreview(); };
$('#btn-ready').onclick = async () => {
  const s = D.outfit.slots;
  if (!s.dress && !(s.top && s.bottom)) {
    const r = await modal('<h2>Wait — are you sure?</h2><p>Your look is missing a top & bottom (or a dress). The judges will notice… 👀</p>', [{ label: 'Keep dressing', value: false, cls: '' }, { label: 'Walk anyway', value: true }]);
    if (!r) return;
  }
  stopDressTimer(); finishDressing();
};
$('#btn-leave').onclick = () => (D.free ? goMenu() : leaveToMenu());
$('#btn-outfits').onclick = openOutfits;
$('#btn-photo').onclick = openPhoto;
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !$('#modal').hidden) closeModal(null);
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && document.body.dataset.screen === 'scr-dress') { e.preventDefault(); undo(); }
  if (document.body.dataset.screen === 'scr-runway' && G && G.myTurn && /^[1-8]$/.test(e.key)) setMyPose(Object.keys(POSES).filter(k => k !== 'idle')[+e.key - 1]);
});

function openOutfits() {
  const slotHtml = () => save.outfits.map((o, i) => `<div class="ofit">${o ? renderCharacter(o, { cls: 'thumb', noShadow: true, par: 'xMidYMid meet' }) : '<div class="ofit-empty">empty</div>'}
    <div class="ofit-btns"><button class="btn small" data-save="${i}">Save here</button>${o ? `<button class="btn small" data-load="${i}">Wear</button><button class="btn small" data-del="${i}">✕</button>` : ''}</div></div>`).join('');
  const bind = body => {
    $$('[data-save]', body).forEach(b => b.onclick = () => { save.outfits[+b.dataset.save] = clone(D.outfit); persist(); sfx('coin'); toast('Outfit saved 💾', 'good'); body.querySelector('.ofits').innerHTML = slotHtml(); bind(body); });
    $$('[data-load]', body).forEach(b => b.onclick = () => {
      const o = clone(save.outfits[+b.dataset.load]);
      const locked = Object.entries(o.slots).filter(([, v]) => v && ITEMS_BY_ID[v.id] && lockInfo(ITEMS_BY_ID[v.id]));
      locked.forEach(([k]) => { o.slots[k] = null; });
      pushHistory(); D.outfit = o; refresh(); closeModal(null); sfx('pick');
      if (locked.length) toast(`${locked.length} locked item(s) removed`, 'bad');
    });
    $$('[data-del]', body).forEach(b => b.onclick = () => { save.outfits[+b.dataset.del] = null; persist(); body.querySelector('.ofits').innerHTML = slotHtml(); bind(body); });
  };
  modal(`<h2>💾 Saved outfits</h2><div class="ofits">${slotHtml()}</div>`, [{ label: 'Close' }], { cls: 'wide', onOpen: bind });
}

const PHOTO_BGS = {
  studio: ['#ffd6ec', '#c9a7ff'], brat: [BRAT, BRAT], spooky: ['#1a0b2e', '#ff9500'], garba: ['#7a0f1f', '#ffb000'], sunset: ['#ff9a8b', '#ffd36e'],
  night: ['#1d1036', '#5e2a84'], ocean: ['#5ab4ff', '#2ec4b6'], mint: ['#d8fff0', '#b8f2c9'], noir: ['#111111', '#3a3a3a'], cloud: ['#ffffff', '#e8f1ff'],
};
function openPhoto() {
  const m = document.body.dataset.mode;
  let bg = m === 'brat' ? 'brat' : m === 'halloween' ? 'spooky' : m === 'navratri' ? 'garba' : 'studio';
  const name = save.name || 'brat';
  const draw = body => {
    const [a, b] = PHOTO_BGS[bg];
    $('.photo-frame', body).style.background = `linear-gradient(160deg, ${a}, ${b})`;
    $('.photo-frame', body).innerHTML = (bg === 'brat' ? `<div class="photo-brat brat-font" style="font-size:${Math.min(64, 520 / Math.max(4, name.length))}px">${esc(name.toLowerCase())}</div>` : '') + renderCharacter(D.outfit, { cls: 'char', par: 'xMidYMid meet' });
  };
  modal(`<h2>📸 Photo booth</h2><div class="photo-frame"></div>
    <div class="bg-row">${Object.entries(PHOTO_BGS).map(([k, [a, b]]) => `<button class="bgb" data-bg="${k}" style="background:linear-gradient(160deg,${a},${b})" title="${k}"></button>`).join('')}</div>
    <div class="bg-row">${Object.entries(POSES).map(([k, ps]) => `<button class="btn small" data-ppose="${k}">${ps.name}</button>`).join('')}</div>`,
    [{ label: 'Close', value: null, cls: '' }, { label: '⬇ Save PNG', value: 'dl' }], {
      cls: 'wide', onOpen: body => {
        draw(body);
        $$('[data-bg]', body).forEach(b => b.onclick = () => { bg = b.dataset.bg; draw(body); sfx('click'); });
        $$('[data-ppose]', body).forEach(b => b.onclick = () => { D.outfit.pose = b.dataset.ppose; draw(body); updatePreview(); sfx('flash'); });
      },
    }).then(r => { if (r === 'dl') downloadPhoto(bg); });
}
function downloadPhoto(bg) {
  const W = 600, H = 1000, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), [a, b] = PHOTO_BGS[bg];
  const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, a); gr.addColorStop(1, b);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
  if (bg === 'brat') drawBratText(ctx, (save.name || 'brat').toLowerCase(), W / 2, 140, 110, W * .9);
  const svg = renderCharacter(D.outfit, { cls: 'char' });
  const img = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  img.onload = () => {
    ctx.drawImage(img, 30, 20, W - 60, (W - 60) * 580 / 300 * .99);
    URL.revokeObjectURL(url);
    ctx.font = '700 22px "Baloo 2", sans-serif'; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.textAlign = 'right';
    ctx.fillText('dress to impress ✨ ' + (save.name || ''), W - 20, H - 20);
    downloadCanvas(cv, `${(save.name || 'outfit').replace(/[^\w-]/g, '')}-look.png`);
  };
  img.src = url;
}
function drawBratText(ctx, text, x, y, size, maxW) {
  ctx.save();
  ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `${size}px "Arial Narrow", Arial, Helvetica, sans-serif`;
  const w = ctx.measureText(text).width * .85;
  const k = Math.min(1, maxW / w);
  ctx.translate(x, y); ctx.scale(.85 * k, k);
  ctx.filter = `blur(${Math.max(1.5, size / 45)}px)`;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}
function downloadCanvas(cv, name) {
  const a = document.createElement('a');
  a.download = name; a.href = cv.toDataURL('image/png');
  document.body.appendChild(a); a.click(); a.remove();
  toast('Photo saved ⬇', 'good');
}

/* ==========================================================
   RUNWAY
   ========================================================== */
function finishDressing() {
  if (!G || G.aborted) return;
  const me = G.players.find(p => p.me);
  me.outfit = clone(D.outfit);
  me.outfit.pose = D.outfit.pose || save.lastPose || 'tada';
  save.look = clone(D.outfit); persist();
  runRunway();
}
const wait = ms => new Promise(r => {
  const g = G, step = 50; let left = ms;
  const iv = setInterval(() => { left -= (g && g.fast) ? step * 3 : step; if (left <= 0 || !g || g.aborted) { clearInterval(iv); r(); } }, step);
});
async function runRunway() {
  const g = G, ev = lookFor(g.mode);
  show('scr-runway');
  $('#stage').dataset.stage = ev ? ev.id : 'classic';
  Sound.music(ev ? ev.music : 'runway');
  $('#rw-theme').innerHTML = `${g.theme.emoji} <b>${esc(g.theme.name)}</b>`;
  $('#btn-skip').onclick = () => { g.fast = !g.fast; $('#btn-skip').classList.toggle('on', g.fast); };
  $('#btn-skip').classList.remove('on');
  const crowd = ev ? ev.crowd : ['🙂', '😀', '🤩', '😎', '🥰', '🧐', '👀', '📸'];
  $('.crowd').innerHTML = Array.from({ length: 26 }, () => `<i>${pick(crowd)}</i>`).join('');
  const order = shuffle(g.players);
  for (let i = 0; i < order.length; i++) {
    if (g.aborted) return;
    $('#rw-progress').textContent = `Model ${i + 1} / ${order.length}`;
    await walk(order[i], g);
  }
  if (g.aborted) return;
  showResults();
}
async function walk(pl, g) {
  const w = $('#walker');
  const outfit = clone(pl.outfit);
  const finalPose = outfit.pose && outfit.pose !== 'idle' ? outfit.pose : 'tada';
  outfit.pose = 'idle';
  $('#rw-name').innerHTML = `${esc(pl.name)}${pl.me ? ' <span class="you">YOU</span>' : ''}`;
  $('#rw-name').classList.add('show');
  w.innerHTML = renderCharacter(outfit, { cls: 'char' });
  w.className = 'walker start';
  void w.offsetWidth;
  w.className = 'walker walking front';
  await wait(2600);
  if (g.aborted) return;
  w.classList.remove('walking');
  g.curOutfit = outfit; g.curWalker = pl;
  outfit.pose = finalPose;
  w.innerHTML = renderCharacter(outfit, { cls: 'char' });
  flash();
  if (pl.me) {
    g.myTurn = true;
    $('#poser').hidden = false;
    $('#poser').innerHTML = '<span>Strike a pose!</span>' + Object.entries(POSES).filter(([k]) => k !== 'idle').map(([k, ps], i) => `<button class="btn small ${k === finalPose ? 'on' : ''}" data-mp="${k}">${i + 1} · ${ps.name}</button>`).join('');
    $$('[data-mp]').forEach(b => b.onclick = () => setMyPose(b.dataset.mp));
  } else {
    renderVote(pl);
  }
  const ev = evaluate(pl.outfit, g.theme);
  const n = Math.round(ev.stars * 2.2);
  for (let i = 0; i < n; i++) setTimeout(() => react(ev.stars), i * 220);
  await wait(1800);
  if (!pl.me && !g.aborted) { outfit.pose = pick(Object.keys(POSES).filter(k => k !== 'idle' && k !== finalPose)); w.innerHTML = renderCharacter(outfit, { cls: 'char' }); flash(); }
  await wait(pl.me ? 2600 : 1800);
  g.myTurn = false;
  $('#vote').hidden = true; $('#poser').hidden = true;
  $('#rw-name').classList.remove('show');
  if (g.aborted) return;
  outfit.pose = 'idle';
  w.innerHTML = renderCharacter(outfit, { cls: 'char' });
  w.className = 'walker walking exit';
  await wait(1300);
}
function setMyPose(k) {
  if (!G || !G.myTurn || !k) return;
  G.curOutfit.pose = k;
  save.lastPose = k; persist();
  $('#walker').innerHTML = renderCharacter(G.curOutfit, { cls: 'char' });
  $$('[data-mp]').forEach(b => b.classList.toggle('on', b.dataset.mp === k));
  flash();
}
function renderVote(pl) {
  const v = $('#vote');
  v.hidden = false;
  const cur = G.votes[pl.name] || 0;
  v.innerHTML = `<span>Rate <b>${esc(pl.name)}</b>'s look</span><div class="stars">${[1, 2, 3, 4, 5].map(n => `<button class="star ${n <= cur ? 'on' : ''}" data-v="${n}">★</button>`).join('')}</div>`;
  $$('.star', v).forEach(b => {
    b.onclick = () => { G.votes[pl.name] = +b.dataset.v; sfx('star'); renderVote(pl); react(+b.dataset.v); };
    b.onmouseenter = () => $$('.star', v).forEach(s => s.classList.toggle('hov', +s.dataset.v <= +b.dataset.v));
    b.onmouseleave = () => $$('.star', v).forEach(s => s.classList.remove('hov'));
  });
}
function flash() {
  sfx('flash');
  const f = $('#flash'); f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
}
function react(stars) {
  const pool = stars >= 4.2 ? ['😍', '🔥', '✨', '💖', '👑', '🤩', '💅'] : stars >= 3 ? ['👏', '🙂', '✨', '👍', '💕'] : ['😬', '🤔', '😐', '🫣', '💀'];
  const ev = G && lookFor(G.mode);
  const pool2 = ev && stars >= 3.5 ? [...pool, ev.token, ev.token, ev.icon] : pool;
  const el = document.createElement('i');
  el.textContent = pick(pool2);
  el.style.left = rand(8, 92) + '%';
  el.style.animationDuration = rand(1.6, 2.6) + 's';
  $('#reactions').appendChild(el);
  setTimeout(() => el.remove(), 2700);
}

/* ==========================================================
   RESULTS
   ========================================================== */
function addTokens(evId, n) {
  const before = save.tokens[evId] || 0;
  save.tokens[evId] = before + n;
  const newly = ITEMS.filter(i => i.ev === evId && i.need > before && i.need <= save.tokens[evId]);
  newly.forEach((it, i) => setTimeout(() => toast(`${EVENTS[evId].token} unlocked <b>${esc(it.name)}</b>!`, 'ev-toast-' + evId), 600 + i * 700));
  return newly;
}
function addPassXp(n) {
  const before = passLevel();
  save.pass.xp += n;
  const after = passLevel();
  if (after > before) setTimeout(() => toast(`💅 Baddie Pass level ${after}! Claim your rewards`, 'pass-toast'), 900);
}
function showResults() {
  const g = G, th = g.theme, ev = EVENTS[g.mode], lk = lookFor(g.mode);
  for (const pl of g.players) pl.ev = evaluate(pl.outfit, th);
  for (const pl of g.players) {
    const votes = [];
    for (const v of g.players) {
      if (v === pl) continue;
      if (v.me) { if (g.votes[pl.name]) votes.push(g.votes[pl.name]); continue; }
      votes.push(clamp(Math.round(pl.ev.stars + rand(-.9, .9) + v.harsh), 1, 5));
    }
    pl.votes = votes; pl.score = avg(votes);
  }
  const ranked = g.players.slice().sort((a, b) => b.score - a.score || b.ev.raw - a.ev.raw);
  const me = g.players.find(p => p.me), place = ranked.indexOf(me) + 1;
  // rewards
  let coins = ([150, 100, 75][place - 1] || 30) + Math.round(me.score * 10);
  if (save.vip) coins *= 2;
  const xp = Math.round(me.score * 20) + (place === 1 ? 30 : 0);
  const passXp = 40 + Math.round(me.score * 20) + (place <= 3 ? 20 : 0) + (place === 1 ? 20 : 0);
  const oldRank = rankOf(save.xp)[1];
  save.coins += coins; save.xp += xp;
  addPassXp(passXp);
  const st = save.stats;
  st.rounds++; if (place === 1) st.wins++; if (place <= 3) st.top3++;
  st.bestStars = Math.max(st.bestStars, me.score);
  let tokens = 0;
  if (ev) {
    tokens = 1 + (place <= 3 ? 1 : 0) + (place === 1 ? 2 : 0) + (me.score >= 4.5 ? 1 : 0);
    const es = save.evStats[ev.id];
    es.rounds++; if (place === 1) es.wins++; if (place <= 3) es.top3++; if (me.score >= 4.5) es.five++;
    if (me.ev.evCount >= 5) es.fullfit++;
    addTokens(ev.id, tokens);
  } else if (g.mode === 'festivals') {
    tokens = 1 + (place <= 3 ? 1 : 0) + (place === 1 ? 1 : 0);
    addTokens('navratri', tokens);
  }
  persist();
  const newRank = rankOf(save.xp)[1];
  show('scr-results');
  Sound.music(lk ? lk.music : 'chill');
  if (place <= 3) sfx('win'); else sfx('coin');
  const starRow = s => { const full = Math.round(s * 2) / 2; let h = ''; for (let i = 1; i <= 5; i++) h += `<i class="${full >= i ? 'f' : full >= i - .5 ? 'h' : ''}">★</i>`; return `<span class="srow">${h}</span>`; };
  const podium = [ranked[1], ranked[0], ranked[2]];
  $('#results').innerHTML = `
    <div class="res-head">
      ${ev ? `<div class="ev-font res-ev">${ev.icon} ${esc(ev.name)}</div>` : g.mode === 'festivals' ? '<div class="ev-font res-ev">🇮🇳 Festivals of India</div>' : ''}
      <div class="res-theme">${th.emoji} ${esc(th.name)}</div>
      <h2>${place === 1 ? '🏆 You won!' : place <= 3 ? `🎉 You placed #${place}!` : `You placed #${place}`}</h2>
    </div>
    <div class="podium">${podium.map((pl, i) => {
      const pos = [2, 1, 3][i];
      return `<div class="pod p${pos} ${pl.me ? 'me' : ''}"><div class="pod-char">${renderCharacter(pl.outfit, { cls: 'char' })}</div><div class="pod-block"><b>#${pos}</b><span>${esc(pl.name)}</span>${starRow(pl.score)}<small>${pl.score.toFixed(2)}</small></div></div>`;
    }).join('')}</div>
    <div class="res-cols">
      <div class="res-card mine">
        <h3>Your look</h3>
        <div class="mine-row">
          <div class="mine-char">${renderCharacter(me.outfit, { cls: 'char' })}</div>
          <div>
            <div class="big-stars">${starRow(me.score)} <b>${me.score.toFixed(2)}</b></div>
            <ul class="fb">${feedback(me.ev, th).map(f => `<li>${f}</li>`).join('')}</ul>
            <div class="rewards"><span>🪙 +${coins}${save.vip ? ' <small>(VIP 2×)</small>' : ''}</span><span>⭐ +${xp} XP</span><span class="px">💅 +${passXp} pass XP</span>${tokens ? `<span class="tk ev-${lk.id}">${lk.token} +${tokens}</span>` : ''}</div>
            ${newRank !== oldRank ? `<div class="rankup">RANK UP! You're now a <b>${newRank}</b> 🎉</div>` : ''}
          </div>
        </div>
      </div>
      <div class="res-card">
        <h3>Leaderboard</h3>
        <ol class="board">${ranked.map((pl, i) => `<li class="${pl.me ? 'me' : ''}"><b>${i + 1}</b>${headSvg(pl.outfit)}<span>${esc(pl.name)}</span>${starRow(pl.score)}<small>${pl.score.toFixed(2)}${!pl.me && g.votes[pl.name] ? ` · you gave ${g.votes[pl.name]}★` : ''}</small></li>`).join('')}</ol>
      </div>
    </div>
    <div class="res-actions">
      <button class="btn big primary" id="res-again">Play again ▶</button>
      ${ev ? `<button class="btn big ev-btn" id="res-hub">${ev.icon} ${esc(ev.short)} hub</button>` : ''}
      <button class="btn big" id="res-pass">💅 Pass</button>
      <button class="btn big" id="res-menu">Menu</button>
    </div>`;
  if (newRank !== oldRank) setTimeout(() => toast(`🎉 Rank up: ${newRank}!`, 'good'), 400);
  $('#res-again').onclick = () => { sfx('click'); startRound(g.mode); };
  $('#res-menu').onclick = () => { sfx('click'); goMenu(); };
  $('#res-pass').onclick = () => { sfx('click'); openPass(); };
  if (ev) $('#res-hub').onclick = () => { sfx('click'); openEventHub(ev.id); };
  G = null;
}

/* ==========================================================
   SEASONAL EVENT HUB (Spooky Season, Navaratri, brat)
   ========================================================== */
function openEventHub(id) {
  const E = EVENTS[id];
  stopDressTimer();
  if (G) G.aborted = true;
  G = null;
  setMode(id);
  show('scr-event');
  Sound.music(E.music);
  const items = ITEMS.filter(i => i.ev === id).sort((a, b) => a.need - b.need);
  const max = items[items.length - 1].need;
  const unlocked = items.filter(i => !lockInfo(i)).length;
  const next = items.find(i => lockInfo(i));
  const es = save.evStats[id];
  const hero = clone(E.hero);
  if (save.look?.skin) hero.skin = save.look.skin;
  const qtext = q => q.text.replace('{short}', E.short);
  $('#event-hub').innerHTML = `
    <div class="bh-top">
      <button class="btn" id="bh-back">← Menu</button>
      <div class="bh-title"><div class="ev-font bh-logo">${id === 'brat' ? 'brat runway' : `${E.icon} ${esc(E.name)}`}</div><div class="bh-sub">${esc(E.sub)}</div></div>
      <div class="bh-tokens">${E.token} <b>${save.tokens[id]}</b><small>${esc(E.tokenName)}</small></div>
    </div>
    <div class="bh-main">
      <div class="bh-hero">${renderCharacter(hero, { cls: 'char' })}
        <button class="btn big bh-play" id="bh-play">walk the ${esc(E.short)} runway ▶</button>
        <p class="bh-note">Earn ${E.token} every walk · +1 top 3 · +2 for a win · +1 for 4.5★</p>
      </div>
      <div class="bh-right">
        <div class="bh-card">
          <h3>collection track <small>${unlocked}/${items.length} unlocked</small></h3>
          <div class="bh-bar"><i style="width:${Math.min(100, save.tokens[id] / max * 100)}%"></i></div>
          ${next ? `<p class="hint">Next: <b>${esc(next.name)}</b> at ${E.token} ${next.need}</p>` : '<p class="hint">You unlocked the whole collection. Iconic. ✨</p>'}
          <div class="bh-items">${items.map(it => {
            const lk = lockInfo(it);
            return `<div class="bh-item ${lk ? 'locked' : ''}">${itemThumb(it, demoFor(it))}<span>${esc(it.name)}</span><em>${lk ? E.token + ' ' + it.need : '✔'}</em></div>`;
          }).join('')}</div>
        </div>
        <div class="bh-card">
          <h3>${esc(E.short)} quests</h3>
          <ul class="quests">${EVENT_QUESTS.map(q => {
            const key = `${id}:${q.id}`, done = q.done(es), claimed = save.claimed.includes(key);
            return `<li class="${done ? 'done' : ''} ${claimed ? 'claimed' : ''}"><span>${qtext(q)}</span><b>${E.token} ${q.reward}</b>${claimed ? '<em>claimed ✔</em>' : done ? `<button class="btn small ev-btn" data-claim="${q.id}">claim</button>` : '<em>in progress</em>'}</li>`;
          }).join('')}</ul>
        </div>
        ${id === 'brat' ? `<div class="bh-card">
          <h3>brat cover maker</h3>
          <div class="cover-row">
            <div class="cover" id="cover"><span class="brat-font" id="cover-text">brat</span></div>
            <div class="cover-ctl">
              <input id="cover-in" maxlength="24" value="${esc((save.name || 'brat').toLowerCase())}">
              <div class="cover-colors">${[BRAT, '#ffffff', '#ff4fa3', '#111111', '#9ad7ff'].map(c => `<button class="sw" data-cc="${c}" style="background:${c}"></button>`).join('')}</div>
              <button class="btn small" id="cover-dl">⬇ save cover</button>
            </div>
          </div>
        </div>` : ''}
      </div>
    </div>`;
  $('#bh-back').onclick = () => goMenu();
  $('#bh-play').onclick = () => { sfx('click'); startRound(id); };
  $$('[data-claim]').forEach(b => b.onclick = () => {
    const q = EVENT_QUESTS.find(x => x.id === b.dataset.claim), key = `${id}:${q.id}`;
    if (save.claimed.includes(key)) return;
    save.claimed.push(key); addTokens(id, q.reward); persist(); sfx('coin');
    toast(`quest complete! +${q.reward} ${E.token}`, 'ev-toast-' + id); openEventHub(id);
  });
  if (id === 'brat') bindCoverMaker();
}
function bindCoverMaker() {
  let coverBg = BRAT;
  const upd = () => {
    const t = ($('#cover-in').value || 'brat').toLowerCase();
    $('#cover-text').textContent = t;
    $('#cover').style.background = coverBg;
    $('#cover-text').style.color = coverBg === '#111111' ? BRAT : '#000';
    $('#cover-text').style.fontSize = Math.max(18, Math.min(64, 300 / Math.max(4, t.length))) + 'px';
  };
  $('#cover-in').oninput = upd;
  $$('[data-cc]').forEach(b => b.onclick = () => { coverBg = b.dataset.cc; upd(); });
  $('#cover-dl').onclick = () => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1000;
    const ctx = cv.getContext('2d'); ctx.fillStyle = coverBg; ctx.fillRect(0, 0, 1000, 1000);
    const t = ($('#cover-in').value || 'brat').toLowerCase();
    drawBratText(ctx, t, 500, 500, 190, 900);
    if (coverBg === '#111111') { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = BRAT; ctx.fillRect(0, 0, 1000, 1000); }
    downloadCanvas(cv, `${t.replace(/[^\w-]/g, '') || 'brat'}-cover.png`);
  };
  upd();
}

/* ==========================================================
   BADDIE PASS
   ========================================================== */
function openPass() {
  stopDressTimer();
  if (G) G.aborted = true;
  G = null;
  setMode('pass');
  show('scr-pass');
  Sound.music('runway');
  const lvl = passLevel(), into = save.pass.xp - lvl * PASS_XP;
  const hero = { skin: save.look?.skin || '#B97E52', height: 1, pose: 'sassy', slots: { hair: { id: 'lacefront', c1: '#111111' }, eyes: { id: 'e-lash', c1: '#3b2416' }, brows: { id: 'b-arched', c1: '#111111' }, lips: { id: 'l-gloss', c1: '#c97b6b' }, shadow: { id: 's-baddie', c1: '#a2845e' }, dress: { id: 'snatched', c1: '#e8c4a8' }, outer: { id: 'croppuffer', c1: '#111111' }, shoes: { id: 'thighboots', c1: '#111111' }, ears: { id: 'blinghoops', c1: '#d4af37' }, neck: { id: 'icedchain', c1: '#e6f4ff' }, bag: { id: 'designerbag', c1: '#111111' }, gloves: { id: 'acrylics', c1: '#ff4fa3' }, glasses: { id: 'shieldshades', c1: '#111111' } } };
  const reward = (t, prem) => {
    const r = passReward(t, prem), key = (prem ? 'p' : 'f') + t;
    const claimed = save.pass.claimed.includes(key);
    const canClaim = !claimed && lvl >= t && (!prem || save.pass.premium);
    const body = r.item ? `${itemThumb(ITEMS_BY_ID[r.item], demoFor(ITEMS_BY_ID[r.item]))}<span>${esc(ITEMS_BY_ID[r.item].name)}</span>` : `<div class="pr-coins">🪙<b>${r.coins}</b></div><span>${r.title ? `coins + “${r.title}” title` : 'coins'}</span>`;
    const state = claimed ? '<em class="pr-done">✔ claimed</em>' : canClaim ? `<button class="btn small pr-claim" data-pclaim="${key}">claim</button>` : `<em class="pr-lock">${prem && !save.pass.premium ? '🔒 premium' : `🔒 Lv ${t}`}</em>`;
    return `<div class="pr ${prem ? 'prem' : 'free'} ${claimed ? 'claimed' : ''} ${canClaim ? 'ready' : ''}">${body}${state}</div>`;
  };
  $('#pass').innerHTML = `
    <div class="pass-head">
      <div class="pass-hero">${renderCharacter(hero, { cls: 'char' })}</div>
      <div class="pass-info">
        <div class="pass-kicker">SEASON 1</div>
        <h1>💅 Baddie Pass</h1>
        <p>Every runway you walk earns pass XP. Level up to claim lashes, lace fronts, thigh-highs, iced chains and more.</p>
        <div class="pass-lvl"><b>Level ${lvl}</b><span>${lvl >= PASS_TIERS ? 'MAX' : `${into} / ${PASS_XP} XP`}</span></div>
        <div class="pass-bar"><i style="width:${lvl >= PASS_TIERS ? 100 : into / PASS_XP * 100}%"></i></div>
        <div class="pass-btns">
          ${save.pass.premium ? '<span class="pill prem-pill">✨ Premium unlocked</span>' : `<button class="btn big pass-buy" id="pass-buy">Unlock Premium 🪙${PASS_PRICE}</button>`}
          <button class="btn big" id="pass-claimall">Claim all</button>
          <button class="btn big primary" id="pass-play">Play to earn XP ▶</button>
        </div>
      </div>
    </div>
    <div class="pass-track-wrap"><div class="pass-track">
      <div class="pass-labels"><span>FREE</span><span>PREMIUM</span></div>
      ${Array.from({ length: PASS_TIERS }, (_, i) => i + 1).map(t => `<div class="tier ${lvl >= t ? 'reached' : ''}"><div class="tier-num">${t}</div>${reward(t, false)}${reward(t, true)}</div>`).join('')}
    </div></div>`;
  const claim = key => {
    if (save.pass.claimed.includes(key)) return false;
    const prem = key[0] === 'p', t = +key.slice(1);
    if (lvl < t || (prem && !save.pass.premium)) return false;
    const r = passReward(t, prem);
    if (r.item && !save.owned.includes(r.item)) save.owned.push(r.item);
    if (r.coins) save.coins += r.coins;
    if (r.title) save.title = r.title;
    save.pass.claimed.push(key);
    return r;
  };
  $$('[data-pclaim]').forEach(b => b.onclick = () => {
    const r = claim(b.dataset.pclaim);
    if (!r) return;
    persist(); sfx('coin');
    toast(r.item ? `💅 Claimed <b>${esc(ITEMS_BY_ID[r.item].name)}</b>!` : `💅 +${r.coins} 🪙`, 'pass-toast');
    openPass();
  });
  $('#pass-claimall').onclick = () => {
    let n = 0;
    for (let t = 1; t <= PASS_TIERS; t++) for (const k of ['f' + t, 'p' + t]) if (claim(k)) n++;
    persist();
    if (n) { sfx('win'); toast(`💅 Claimed ${n} reward${n > 1 ? 's' : ''}!`, 'pass-toast'); openPass(); } else { sfx('lock'); toast('Nothing to claim yet — walk a runway!', 'bad'); }
  };
  const buy = $('#pass-buy');
  if (buy) buy.onclick = async () => {
    const r = await modal(`<h2>✨ Baddie Pass Premium</h2><p>Unlock the premium track: bodysuit, snatched mini, lace front, thigh-high boots, rhinestone corset, shield shades, cropped puffer, quilted bag, iced chain, bodycon maxi, rhinestone phone, fur bucket hat, moto jacket and dark angel wings.</p><p class="price-line">Price: 🪙 ${PASS_PRICE} (you have ${save.coins})</p>`, [{ label: 'Not now', value: false, cls: '' }, { label: `Unlock 🪙${PASS_PRICE}`, value: true }]);
    if (!r) return;
    if (save.coins < PASS_PRICE) { sfx('lock'); return toast('Not enough coins yet 🪙 — walk more runways or redeem codes!', 'bad'); }
    save.coins -= PASS_PRICE; save.pass.premium = true; persist(); sfx('win');
    toast('✨ Baddie Pass Premium unlocked!', 'pass-toast'); openPass();
  };
  $('#pass-play').onclick = () => { sfx('click'); startRound('classic'); };
  const firstReady = $('.pr.ready') || $(`.tier:nth-child(${Math.max(2, lvl + 1)})`);
  if (firstReady) firstReady.scrollIntoView({ inline: 'center', block: 'nearest' });
}

/* ---------- sparkles background ---------- */
(function sparkleBg() {
  const box = $('#sparkles');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('i');
    s.textContent = pick(['✦', '✧', '⋆', '♡']);
    s.style.left = rand(0, 100) + '%'; s.style.top = rand(0, 100) + '%';
    s.style.animationDelay = rand(0, 6) + 's'; s.style.fontSize = rand(10, 24) + 'px';
    box.appendChild(s);
  }
})();

/* ---------- boot ---------- */
document.addEventListener('pointerdown', () => Sound.init(), { once: true });
initTitle();
show('scr-title');
