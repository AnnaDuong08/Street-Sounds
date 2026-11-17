"use strict";
/* Your street: walk the mix you built. Shared data, sound engine and story panel live in core.js. */

/* ---------------- World ---------------- */
// Same 16:10 shape as the preview board, so a mix's x/y percentages land in the same place.
const W = 2400, H = 1500;
const MAX_ITEMS = 16;
const SPEED = 340;                 // walking, world px per second
// Riding: speed shown in km/h and kept gentle, so 40 km/h is under three times walking pace.
const ride = {on:false, bike:null, kmh:20};
const rideSpeed = () => 300 + ride.kmh * 15;
const MEET_DIST = 210;             // how close you must be to press E
// How far each sound carries, in world px. Past this you can't hear it at all.
const RANGE = {banhbao:950, bell:1300, rain:1100, moto:800, crickets:600};
const rangeOf = type => RANGE[type] || 700;

const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const playerEl = document.getElementById("player");
const pop = document.getElementById("pop");

let items = [];
let uid = 0;
const player = {x:W / 2, y:H * 0.9, facing:1, moving:false};
const cam = {x:0, y:0, s:1};
const keys = new Set();
let target = null;          // tap-to-walk destination
let entered = false;        // sound starts when the visitor steps in
let popItem = null;
const busy = () => !!popItem || talkIsOpen() || deliveryIsOpen();   // a card, conversation or game is open, so the player stands still
const meet = {item:null};   // the item the E key would open
const nodes = {};           // uid -> {bus, sound}

/* ---------------- Ground: drawn small, scaled up so it reads as pixel art ---------------- */
function drawGround(){
  const cv = document.getElementById("ground"), q = 4, w = W / q, h = H / q;
  cv.width = w; cv.height = h;
  const c = cv.getContext("2d");
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const Y = p => Math.round(h * p);

  // sky and tube houses (rooftops band, 0–22%)
  c.fillStyle = "#0b1b29"; c.fillRect(0, 0, w, Y(.22));
  for (let i = 0; i < 40; i++){ c.fillStyle = `rgba(241,231,208,${0.2 + rnd() * 0.4})`; c.fillRect(Math.floor(rnd() * w), Math.floor(rnd() * Y(.08)), 1, 1); }
  const walls = ["#1c3a52", "#24465f", "#2d3f4f", "#3a4a3f", "#4a3a3a", "#33435a"];
  for (let x = 0; x < w;){
    const bw = 22 + Math.floor(rnd() * 18), top = Y(.03) + Math.floor(rnd() * Y(.07));
    c.fillStyle = walls[Math.floor(rnd() * walls.length)]; c.fillRect(x, top, bw - 1, Y(.22) - top);
    c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x, top, bw - 1, 2);
    for (let y = top + 5; y < Y(.2) - 4; y += 9){
      const lit = rnd();
      c.fillStyle = lit > .55 ? "#f5a043" : lit > .4 ? "#55b3a3" : "#0e2233";
      c.fillRect(x + 4, y, bw - 9, 4);
      c.fillStyle = "rgba(169,183,193,.25)"; c.fillRect(x + 2, y + 6, bw - 5, 1);
    }
    if (rnd() > .6){ c.fillStyle = rnd() > .5 ? "#e2553f" : "#f5a043"; c.fillRect(x + 3, Y(.2) - 4, bw - 7, 3); }
    x += bw;
  }
  // power lines
  c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 1;
  for (let k = 0; k < 4; k++){
    const y0 = Y(.05) + k * 5; c.beginPath(); c.moveTo(0, y0);
    for (let x = 0; x <= w; x += 60) c.quadraticCurveTo(x + 30, y0 + 6 + rnd() * 4, x + 60, y0);
    c.stroke();
  }

  // curbs, road, pavement
  c.fillStyle = "#16384f"; c.fillRect(0, Y(.22), w, Y(.02)); c.fillRect(0, Y(.66), w, Y(.02));
  c.fillStyle = "#22272b"; c.fillRect(0, Y(.24), w, Y(.42));
  for (let i = 0; i < 900; i++){ c.fillStyle = rnd() > .5 ? "#262c31" : "#1d2125"; c.fillRect(Math.floor(rnd() * w), Y(.24) + Math.floor(rnd() * Y(.42)), 1, 1); }
  c.fillStyle = "rgba(241,231,208,.45)";
  for (let x = 4; x < w; x += 26) c.fillRect(x, Y(.45), 13, 1);
  c.fillStyle = "#11283a"; c.fillRect(0, Y(.68), w, h - Y(.68));
  c.fillStyle = "rgba(241,231,208,.05)";
  for (let y = Y(.68); y < h; y += 12) c.fillRect(0, y, w, 1);
  for (let y = Y(.68), r = 0; y < h; y += 12, r++) for (let x = (r % 2) * 8; x < w; x += 16) c.fillRect(x, y, 1, 12);

  // street lamps with sodium pools of light
  for (let x = 40; x < w; x += 150){
    [[Y(.22), 1], [Y(.68), 1]].forEach(([base]) => {
      const g = c.createRadialGradient(x, base + 8, 2, x, base + 8, 46);
      g.addColorStop(0, "rgba(245,160,67,.22)"); g.addColorStop(1, "rgba(245,160,67,0)");
      c.fillStyle = g; c.fillRect(x - 46, base - 38, 92, 92);
      c.fillStyle = "#0a1926"; c.fillRect(x, base - 26, 2, 30);
      c.fillStyle = "#f5a043"; c.fillRect(x - 2, base - 28, 6, 3);
    });
  }
}

/* ---------------- Player: a small pixel figure in a nón lá ---------------- */
const PLAYER_PX = [
  "......hh......",
  ".....hHHh.....",
  "....hHHHHh....",
  "...hHHHHHHh...",
  "..hHHHHHHHHh..",
  ".kkkkkkkkkkkk.",
  "....kssssk....",
  "....ksesek....",
  "....kssssk....",
  ".....kssk.....",
  "...kTTTTTTk...",
  "..kTTTTTTTTk..",
  "..sTTTTTTTTs..",
  "..skTTTTTTks..",
  "....TTTTTT....",
  "....PPPPPP....",
  "....PP..PP....",
  "....PP..PP....",
  "....kk..kk...."
];
function playerSvg(){
  const col = {h:"#a8743a", H:"#e8c98a", k:"#2a1a10", s:"#e0b48a", e:"#2a1a10", T:"#55b3a3", P:"#3b4a63"};
  let r = "";
  PLAYER_PX.forEach((row, y) => [...row].forEach((ch, x) => { if (col[ch]) r += `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${col[ch]}"/>`; }));
  // Artwork from images/player/ replaces the drawn figure once it exists; riding uses the motorbike picture as a stand-in.
  return `<img class="pl-art walk" src="images/player/walking.png" alt="">
    <span class="pl-pixel"><svg viewBox="0 0 14 19" shape-rendering="crispEdges">${r}</svg></span>
    <span class="pl-ride"><img class="pl-art ride" src="images/player/riding.png" alt=""><span class="pl-stand"><img src="images/ambient/moto.png" alt=""></span></span>
    <span class="you">You</span>`;
}

/* ---------------- Items on the street ---------------- */
const toWorld = t => ({x:t.x / 100 * W, y:t.y / 100 * H});
function clampPct(t){ t.x = Math.max(3, Math.min(97, t.x)); t.y = Math.max(Math.max(8, minY(t.type)), Math.min(98, t.y)); }

function renderItems(){
  world.querySelectorAll(".sprite").forEach(n => n.remove());
  items.forEach(t => {
    const info = tokenInfo(t.type), v = vendorById[t.type];
    const el = document.createElement("button");
    el.type = "button";
    el.className = "sprite " + (v ? "is-vendor" : "is-ambient");
    el.dataset.uid = t.uid;
    el.setAttribute("aria-label", v ? `${v.dish} seller. Open to learn more.` : `${info.label}. Open for options.`);
    const r = rangeOf(t.type);
    el.innerHTML = `<span class="range" style="width:${r * 2}px;height:${r * 2}px"></span>
      <span class="bubble"></span><img src="${info.icon}" alt="" draggable="false"><span class="tag">${info.label}</span>
      ${t.type === "moto"
        ? `<span class="meet meet-2" aria-hidden="true"><span><kbd>E</kbd> Ride the motorbike</span><span><kbd>F</kbd> Delivery runs</span></span>`
        : `<span class="meet" aria-hidden="true">Press <kbd>E</kbd> to ${v ? "talk" : "look"}</span>`}`;
    if (t === ride.bike) el.classList.add("ridden");
    world.appendChild(el);
    t.el = el;
    placeItem(t);
  });
  document.getElementById("mixCount").textContent = `${items.length} of ${MAX_ITEMS} sounds on your street.`;
}
function placeItem(t){
  const p = toWorld(t);
  t.el.style.left = p.x + "px"; t.el.style.top = p.y + "px"; t.el.style.zIndex = Math.round(p.y);
}
function save(){ store.set(MIX_KEY, items.map(({type, x, y}) => ({type, x, y}))); }

function startItem(t){
  if (!entered || nodes[t.uid]) return;
  const bus = makeBus();
  const sound = startSound(t.type, bus.input, v => {
    const g = levelOf(t).gain;
    if (g > 0.3) caption(v);
    if (g > 0.03) say(t, v.call);
  });
  nodes[t.uid] = {bus, sound};
}
function stopItem(t){
  const n = nodes[t.uid]; if (!n) return;
  n.sound.stop(); n.bus.close(); delete nodes[t.uid];
}
function addItem(type){
  if (items.length >= MAX_ITEMS){ msg(`Your street is full. Remove a sound to add another (maximum ${MAX_ITEMS}).`); return; }
  const side = player.facing >= 0 ? 1 : -1;
  const t = {type, x:(player.x + side * 150) / W * 100, y:player.y / H * 100, uid:++uid};
  clampPct(t);
  items.push(t); renderItems(); startItem(t); save();
  msg(`Added ${tokenInfo(type).label} next to you.`);
}
function removeItem(t){
  stopItem(t);
  items = items.filter(i => i !== t);
  renderItems(); save();
}
function setItems(next){
  if (ride.on) getOff();
  items.forEach(stopItem);
  items = next.map(t => ({...t, uid:++uid}));
  items.forEach(clampPct);
  renderItems(); items.forEach(startItem); save();
}

/* Speech bubble over a vendor while they call, so the street can be read as well as heard */
function say(t, text){
  if (!t.el) return;
  const b = t.el.querySelector(".bubble");
  b.textContent = text; t.el.classList.add("calling");
  clearTimeout(t.sayTimer);
  t.sayTimer = setTimeout(() => t.el && t.el.classList.remove("calling"), 3200);
}

/* ---------------- Hearing ---------------- */
function levelOf(t){
  const p = toWorld(t), dx = p.x - player.x, dy = p.y - player.y;
  const r = rangeOf(t.type), d = Math.hypot(dx, dy);
  const near = Math.max(0, 1 - d / r);
  return {gain:near * near, pan:Math.max(-1, Math.min(1, dx / (r * 0.6))), cutoff:500 + near * 16000, d};
}
let lastHear = 0;
function updateHearing(now){
  if (now - lastHear < 120) return;
  lastHear = now;
  const heard = [];
  let nearest = null;
  items.forEach(t => {
    const lv = levelOf(t);
    if (nodes[t.uid]) nodes[t.uid].bus.set(lv.gain, lv.pan, lv.cutoff);
    t.el.classList.toggle("audible", lv.gain > 0.02);
    t.el.style.setProperty("--lv", lv.gain.toFixed(2));
    if (lv.gain > 0.02) heard.push({t, g:lv.gain});
    if (t !== ride.bike && lv.d < MEET_DIST && (!nearest || lv.d < nearest.d)) nearest = {t, d:lv.d};
  });
  if (busy() || ride.on) nearest = null;   // while riding, E means get off
  items.forEach(t => {
    const on = !!nearest && nearest.t === t;
    t.el.classList.toggle("near", on);
    // The E tag sits on the vendor's far side from you: you on the right, tag on the left, and the other way round.
    if (on) t.el.classList.toggle("meet-left", player.x > toWorld(t).x);
  });
  meet.item = nearest ? nearest.t : null;
  heard.sort((a, b) => b.g - a.g);
  document.getElementById("hearList").innerHTML = heard.length
    ? heard.slice(0, 5).map(h => `<li><img src="${tokenInfo(h.t.type).icon}" alt=""><span>${tokenInfo(h.t.type).label}</span><i style="--w:${Math.round(h.g * 100)}%"></i></li>`).join("")
    : `<li class="quiet">Nothing nearby. Walk towards the lights.</li>`;
}

/* ---------------- Camera and movement ---------------- */
function layout(){
  const vw = viewport.clientWidth, vh = viewport.clientHeight;
  cam.s = Math.max(0.42, Math.min(1, vh / 980, vw / 1100));
  cam.vw = vw; cam.vh = vh;
}
function follow(){
  const vw = cam.vw / cam.s, vh = cam.vh / cam.s;
  cam.x = vw >= W ? (W - vw) / 2 : Math.max(0, Math.min(W - vw, player.x - vw / 2));
  cam.y = vh >= H ? (H - vh) / 2 : Math.max(0, Math.min(H - vh, player.y - 60 - vh / 2));
  world.style.transform = `translate(${-cam.x * cam.s}px, ${-cam.y * cam.s}px) scale(${cam.s})`;
}
function screenToWorld(cx, cy){
  const r = viewport.getBoundingClientRect();
  return {x:cam.x + (cx - r.left) / cam.s, y:cam.y + (cy - r.top) / cam.s};
}
const DIRS = {w:[0,-1], arrowup:[0,-1], s:[0,1], arrowdown:[0,1], a:[-1,0], arrowleft:[-1,0], d:[1,0], arrowright:[1,0]};
let last = performance.now();
function frame(now){
  requestAnimationFrame(frame);   // scheduled first, so one bad frame can't freeze the street
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  let dx = 0, dy = 0;
  if (entered && !busy()){
    keys.forEach(k => { dx += DIRS[k][0]; dy += DIRS[k][1]; });
    if (dx || dy) target = null;
    else if (target){
      const tx = target.x - player.x, ty = target.y - player.y, d = Math.hypot(tx, ty);
      if (d < 8) target = null; else { dx = tx / d; dy = ty / d; }
    }
  }
  const len = Math.hypot(dx, dy);
  player.moving = len > 0;
  if (len){
    const v = ride.on ? rideSpeed() : SPEED;
    player.x = Math.max(40, Math.min(W - 40, player.x + dx / len * v * dt));
    player.y = Math.max(H * ROOF_LINE / 100, Math.min(H - 8, player.y + dy / len * v * dt));
    if (dx) player.facing = Math.sign(dx);
    // The bike (and its engine sound) travels with you
    if (ride.on){ ride.bike.x = player.x / W * 100; ride.bike.y = player.y / H * 100; placeItem(ride.bike); }
  }
  playerEl.style.left = player.x + "px"; playerEl.style.top = player.y + "px";
  playerEl.style.zIndex = Math.round(player.y) + 1;
  playerEl.classList.toggle("walking", player.moving);
  playerEl.classList.toggle("left", player.facing < 0);
  follow();
  updateHearing(now);
}

// Only text boxes swallow keys; sliders and radio buttons shouldn't stop you walking.
const typing = () => { const a = document.activeElement; return a && (a.tagName === "TEXTAREA" || (a.tagName === "INPUT" && !["range", "radio", "checkbox", "button"].includes(a.type))); };
const storyOpen = () => document.getElementById("storyPanel").classList.contains("show");
window.addEventListener("keydown", e => {
  if (typing() || storyOpen()) return;
  if (talkIsOpen()){ talkKey(e); return; }
  if (deliveryIsOpen()){ deliveryKey(e); return; }
  const k = e.key.toLowerCase();
  if (k === "escape"){ if (popItem) closePop(); else if (!buildPanel.hidden) toggleBuild(false); return; }
  if (!entered || popItem) return;
  if (DIRS[k]){ e.preventDefault(); keys.add(k); }
  if (k === "e"){
    if (ride.on){ e.preventDefault(); getOff(); }
    else if (meet.item){ e.preventDefault(); interact(meet.item); }
  }
  if (k === "f" && (ride.on || (meet.item && meet.item.type === "moto"))){ e.preventDefault(); startDeliveries(); }
  if (ride.on && (k === "q" || k === "r")){ e.preventDefault(); setKmh(ride.kmh + (k === "r" ? 5 : -5)); }
});
window.addEventListener("keyup", e => keys.delete(e.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());

/* ---------------- Pointer: drag items, tap the ground to walk ---------------- */
let drag = null, suppressClick = false;
world.addEventListener("pointerdown", e => {
  if (!entered || talkIsOpen()) return;
  const el = e.target.closest(".sprite");
  if (!el){
    if (popItem){ closePop(); return; }
    target = screenToWorld(e.clientX, e.clientY);
    return;
  }
  const t = items.find(i => i.uid === +el.dataset.uid); if (!t) return;
  drag = {t, el, sx:e.clientX, sy:e.clientY, moved:false};
  el.setPointerCapture(e.pointerId);
});
world.addEventListener("pointermove", e => {
  if (!drag) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
  if (!drag.moved){ drag.moved = true; drag.el.classList.add("dragging"); if (popItem) closePop(); }
  const p = screenToWorld(e.clientX, e.clientY);
  drag.t.x = p.x / W * 100; drag.t.y = (p.y + 40) / H * 100; clampPct(drag.t);
  placeItem(drag.t); lastHear = 0;
});
const endDrag = () => {
  if (!drag) return;
  if (drag.moved){ suppressClick = true; drag.el.classList.remove("dragging"); save(); }
  drag = null;
};
world.addEventListener("pointerup", endDrag); world.addEventListener("pointercancel", endDrag);
world.addEventListener("click", e => {
  const el = e.target.closest(".sprite"); if (!el) return;
  if (suppressClick){ suppressClick = false; return; }
  const t = items.find(i => i.uid === +el.dataset.uid);
  if (t && entered && !talkIsOpen() && t !== ride.bike) buildPanel.hidden && vendorById[t.type] ? interact(t) : openPop(t);
});

/* ---------------- Talking to vendors (dialogue in talk.js) ---------------- */
// E near something: vendors talk, the motorbike gets ridden, other street sounds open the small card.
function interact(t){
  if (vendorById[t.type] && TALK[t.type]) talkTo(t);
  else if (t.type === "moto") getOn(t);
  else openPop(t);
}
function talkTo(t){
  keys.clear(); target = null;
  stopItem(t);   // they stop calling out while they talk to you
  t.el.classList.add("talking");
  lastHear = 0;
  openTalk(t.type, () => {
    t.el.classList.remove("talking");
    startItem(t); lastHear = 0;
    document.activeElement.blur();
  });
}

/* ---------------- Small card: talk, remove, or go back to the street ---------------- */
function openPop(t){
  popItem = t; keys.clear(); target = null;
  const v = vendorById[t.type], a = ambientById[t.type], info = tokenInfo(t.type);
  document.getElementById("popImg").src = info.icon;
  document.getElementById("popRegion").textContent = v ? v.regionLabel : "Street sound";
  document.getElementById("popTitle").textContent = v ? v.dish : a.label;
  document.getElementById("popCall").textContent = v ? v.call : "";
  document.getElementById("popEn").textContent = v ? v.en : "Part of the background of the street.";
  document.getElementById("popMore").hidden = !v;
  const bike = t.type === "moto" && !ride.on;
  document.getElementById("popRide").hidden = document.getElementById("popDeliver").hidden = !bike;
  if (bike) document.getElementById("popEn").textContent = "Hop on and ride around the street, or take food orders around the neighbourhood to earn money for the shops.";
  pop.hidden = false;
  const vr = viewport.getBoundingClientRect(), sr = t.el.querySelector("img").getBoundingClientRect();
  const pw = pop.offsetWidth, ph = pop.offsetHeight;
  let left = sr.left + sr.width / 2 - pw / 2 - vr.left;
  let top = sr.top - ph - 12 - vr.top;
  if (top < 8) top = sr.bottom + 12 - vr.top;
  pop.style.left = Math.max(8, Math.min(vr.width - pw - 8, left)) + "px";
  pop.style.top = Math.max(8, Math.min(vr.height - ph - 8, top)) + "px";
  lastHear = 0;
  (v ? document.getElementById("popMore") : bike ? document.getElementById("popRide") : document.getElementById("popBack")).focus();
}
function closePop(){
  if (!popItem) return;
  const t = popItem; popItem = null; pop.hidden = true; lastHear = 0;
  if (t.el && document.body.contains(t.el)) t.el.focus({preventScroll:true});
}
document.getElementById("popBack").addEventListener("click", closePop);
document.getElementById("popMore").addEventListener("click", () => {
  const t = popItem; closePop(); talkTo(t);
});
document.getElementById("popRide").addEventListener("click", () => { const t = popItem; closePop(); getOn(t); });
document.getElementById("popDeliver").addEventListener("click", () => { closePop(); startDeliveries(); });
document.getElementById("popRemove").addEventListener("click", () => {
  const t = popItem; const label = tokenInfo(t.type).label;
  popItem = null; pop.hidden = true; removeItem(t); msg(`Removed ${label}.`);
});
// Sprites are buttons; keep focus out of them after the story closes so E and the arrow keys walk again.
document.getElementById("storyPanel").addEventListener("hidden.bs.offcanvas", () => document.activeElement.blur());

/* ---------------- Riding the motorbike ---------------- */
const rideHud = document.getElementById("rideHud");
function getOn(t){
  ride.on = true; ride.bike = t;
  const p = toWorld(t); player.x = p.x; player.y = p.y;
  t.el.classList.add("ridden");
  playerEl.classList.add("riding");
  rideHud.hidden = false;
  keys.clear(); target = null; lastHear = 0;
  document.activeElement.blur();
}
function getOff(){
  if (!ride.on) return;
  const t = ride.bike;
  ride.on = false; ride.bike = null;
  t.x = player.x / W * 100; t.y = player.y / H * 100; clampPct(t); placeItem(t);
  t.el.classList.remove("ridden");
  // step off to the side the bike isn't facing
  player.x = Math.max(40, Math.min(W - 40, player.x - player.facing * 110));
  playerEl.classList.remove("riding");
  rideHud.hidden = true;
  save(); lastHear = 0;
}
function setKmh(v){
  ride.kmh = Math.max(10, Math.min(40, Math.round(v / 5) * 5));
  document.getElementById("rideKmh").textContent = ride.kmh;
  const r = document.getElementById("rideRange"); r.value = ride.kmh;
  r.style.setProperty("--fill", `${(ride.kmh - 10) / 30 * 100}%`);
}
document.getElementById("rideRange").addEventListener("input", e => setKmh(+e.target.value));
document.getElementById("rideRange").addEventListener("change", e => e.target.blur());
document.getElementById("rideSlower").addEventListener("click", e => { setKmh(ride.kmh - 5); e.currentTarget.blur(); });
document.getElementById("rideFaster").addEventListener("click", e => { setKmh(ride.kmh + 5); e.currentTarget.blur(); });
document.getElementById("rideOff").addEventListener("click", e => { getOff(); e.currentTarget.blur(); });

/* Delivery runs (game in delivery.js); earnings go to the shop wallet */
function startDeliveries(){
  keys.clear(); target = null;
  openDelivery(() => { lastHear = 0; document.activeElement.blur(); });
}

/* ---------------- Build panel ---------------- */
const buildPanel = document.getElementById("buildPanel");
function toggleBuild(on){
  buildPanel.hidden = !on;
  document.body.classList.toggle("building", on);
  const b = document.getElementById("btnBuild"); b.setAttribute("aria-pressed", String(on));
  if (on) buildPanel.querySelector("button").focus(); else b.focus();
}
document.getElementById("btnBuild").addEventListener("click", () => toggleBuild(buildPanel.hidden));
document.getElementById("buildClose").addEventListener("click", () => toggleBuild(false));
document.getElementById("paletteVendors").innerHTML = VENDORS.map(v => `<button class="btn btn-ghost" type="button" data-add="${v.id}"><img class="sw" src="${tokenInfo(v.id).icon}" alt="">${v.dish}</button>`).join("");
document.getElementById("paletteAmbient").innerHTML = AMBIENT.map(a => `<button class="btn btn-ghost" type="button" data-add="${a.id}"><img class="sw" src="${tokenInfo(a.id).icon}" alt="">${a.label}</button>`).join("");
buildPanel.addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) addItem(b.dataset.add); });
function msg(s){ document.getElementById("mixMsg").textContent = s; }
document.getElementById("btnMixClear").addEventListener("click", () => { setItems([]); msg("Street cleared. Add some sounds from the list."); });
document.getElementById("btnMixCopy").addEventListener("click", () => {
  const code = encodeMix(items); const input = document.getElementById("mixCode"); input.value = code;
  const fallback = () => { input.focus(); input.select(); msg("Code is selected in the box. Copy it with Ctrl+C or Cmd+C."); };
  try{ navigator.clipboard.writeText(code).then(() => msg("Share code copied. A friend can paste it here or on the home page."), fallback); }catch(e){ fallback(); }
});
document.getElementById("btnMixLoad").addEventListener("click", () => {
  try{ setItems(decodeMix(document.getElementById("mixCode").value, MAX_ITEMS)); msg(`Loaded a street with ${items.length} sounds.`); }
  catch(e){ msg("That code didn't work. Check it starts with TR1- and was copied in full."); }
});

/* ---------------- Boot ---------------- */
// How vendors address you in conversation ("Hey pretty!"), remembered on this device.
const callMe = store.get("tiengrao.you", "friend");
(document.querySelector(`#callMe input[value="${callMe}"]`) || document.getElementById("callFriend")).checked = true;
document.getElementById("callMe").addEventListener("change", e => store.set("tiengrao.you", e.target.value));
document.getElementById("btnEnter").addEventListener("click", () => {
  if (!audio()) return;
  entered = true;
  document.getElementById("intro").hidden = true;
  items.forEach(startItem);
  document.activeElement.blur();
});
// A link from the preview board carries its mix in the hash; otherwise use the saved street.
(function load(){
  let start = null;
  if (location.hash.length > 1){
    try{ start = decodeMix(decodeURIComponent(location.hash.slice(1)), MAX_ITEMS); }catch(e){}
    history.replaceState(null, "", location.pathname);
  }
  if (!start) start = store.get(MIX_KEY, null) || EXAMPLE_MIX.map(t => ({...t}));
  items = start.slice(0, MAX_ITEMS).map(t => ({type:t.type, x:+t.x, y:+t.y, uid:++uid}));
  items.forEach(clampPct);
  save();
})();
playerEl.innerHTML = playerSvg();
playerEl.querySelector(".pl-art.walk").addEventListener("load", () => playerEl.classList.add("has-walk-art"));
playerEl.querySelector(".pl-art.ride").addEventListener("load", () => playerEl.classList.add("has-ride-art"));
setKmh(ride.kmh);
drawGround(); renderItems(); layout();
window.addEventListener("resize", layout);
requestAnimationFrame(frame);
