"use strict";
/* Shared data, sound engine and story panel live in core.js. */
/* ---------------- Night walk ---------------- */
const street = document.getElementById("street");
let region = "all";
function renderStreet(){
  street.innerHTML = VENDORS.filter(v => region === "all" || v.regions.includes(region)).map(v => `
    <article class="stall" data-id="${v.id}">
      ${art(v)}
      <div class="label">${v.regionLabel}</div>
      <p class="dish">${v.dish}</p>
      <p class="call">${v.call}</p>
      <p class="en">${v.en}</p>
      <div class="row-btns">
        <button class="btn btn-sm btn-lamp" data-act="play" type="button"><img class="ico" src="images/icons/play.png" alt=""> Play call</button>
        <button class="btn btn-sm btn-ghost" data-act="story" type="button">Story</button>
      </div>
    </article>`).join("");
  if (walk.on){ stopWalk(true); startWalk(); }
  updateWalk();
}
street.addEventListener("click", e => {
  const btn = e.target.closest("button[data-act]"); if (!btn) return;
  const v = vendorById[btn.closest(".stall").dataset.id];
  if (btn.dataset.act === "play") playSolo(v, "live"); else openStory(v);
});
document.getElementById("regionPills").addEventListener("click", e => {
  const b = e.target.closest("button[data-region]"); if (!b) return;
  document.querySelectorAll("#regionPills .nav-link").forEach(x => x.classList.toggle("active", x === b));
  region = b.dataset.region; renderStreet();
});
document.getElementById("walkLeft").addEventListener("click", () => street.scrollBy({left:-270}));
document.getElementById("walkRight").addEventListener("click", () => street.scrollBy({left:270}));

const walk = {on:false, buses:{}, timers:{}};
function walkLevels(){
  const r = street.getBoundingClientRect(), mid = r.left + r.width / 2;
  return [...street.querySelectorAll(".stall")].map(el => {
    const b = el.getBoundingClientRect();
    const d = (b.left + b.width / 2 - mid) / Math.max(r.width, 320);
    const near = Math.max(0, 1 - Math.abs(d) * 1.25);
    return {el, id:el.dataset.id, gain:0.03 + near * near * 0.95, pan:Math.max(-1, Math.min(1, d * 1.6)), cutoff:900 + near * 15000};
  });
}
function updateWalk(){
  const lv = walkLevels();
  let best = null;
  lv.forEach(l => { if (!best || l.gain > best.gain) best = l; });
  lv.forEach(l => {
    l.el.classList.toggle("is-near", l === best);
    if (walk.on && walk.buses[l.id]) walk.buses[l.id].set(l.gain, l.pan, l.cutoff);
  });
  const st = document.getElementById("walkStatus");
  if (walk.on && best) st.innerHTML = `Walking. Nearest stall: <b>${vendorById[best.id].dish}</b>. Scroll or use the arrow buttons to move along.`;
}
street.addEventListener("scroll", updateWalk, {passive:true});
window.addEventListener("resize", updateWalk);
function startWalk(){
  if (!audio()) return;
  stopMix();
  walk.on = true;
  street.querySelectorAll(".stall").forEach(el => {
    const v = vendorById[el.dataset.id];
    walk.buses[v.id] = makeBus();
    const loop = () => {
      if (!walk.on || !walk.buses[v.id]) return;
      const d = sing(v, walk.buses[v.id].input, ctx.currentTime + 0.05, v.id === "banhbao" ? "loud" : "live");
      const near = street.querySelector(".stall.is-near");
      if (near && near.dataset.id === v.id) caption(v);
      walk.timers[v.id] = setTimeout(loop, (d + 2.5 + Math.random() * 4) * 1000);
    };
    walk.timers[v.id] = setTimeout(loop, Math.random() * 3000);
  });
  updateWalk();
  const b = document.getElementById("btnWalk"); b.textContent = "Stop walking"; b.setAttribute("aria-pressed", "true");
}
function stopWalk(silent){
  walk.on = false;
  Object.values(walk.timers).forEach(clearTimeout);
  Object.values(walk.buses).forEach(b => b.close());
  walk.timers = {}; walk.buses = {};
  const b = document.getElementById("btnWalk"); b.textContent = "Sound on: start walking"; b.setAttribute("aria-pressed", "false");
  if (!silent) document.getElementById("walkStatus").textContent = "Sound is off. Press \"start walking\" or tap any stall to hear its call.";
}
document.getElementById("btnWalk").addEventListener("click", () => walk.on ? stopWalk() : startWalk());

/* ---------------- Hear the change ---------------- */
const sel = document.getElementById("changeVendor");
sel.innerHTML = VENDORS.filter(v => !v.clapper).map(v => `<option value="${v.id}">${v.dish}: ${v.call}</option>`).join("");
sel.value = "banhbao";
function updateTones(){ document.getElementById("changeTones").innerHTML = tonesHtml(vendorById[sel.value]); }
sel.addEventListener("change", updateTones); updateTones();
function pressCompare(which){
  ["btnLive","btnLoud"].forEach(id => { const b = document.getElementById(id); b.classList.toggle("btn-lamp", id === which); b.classList.toggle("btn-ghost", id !== which); });
}
document.getElementById("btnLive").addEventListener("click", () => { pressCompare("btnLive"); playSolo(vendorById[sel.value], "live"); });
document.getElementById("btnLoud").addEventListener("click", () => { pressCompare("btnLoud"); playSolo(vendorById[sel.value], "loud"); });
document.getElementById("btnSpeak").addEventListener("click", () => {
  const note = document.getElementById("speakNote");
  if (!("speechSynthesis" in window)){ note.textContent = "This browser can't speak text aloud."; return; }
  const voices = speechSynthesis.getVoices();
  const vi = voices.find(x => /^vi/i.test(x.lang));
  if (!vi){ note.textContent = "No Vietnamese voice is installed on this device, so the words can't be spoken."; return; }
  const u = new SpeechSynthesisUtterance(vendorById[sel.value].call); u.voice = vi; u.lang = vi.lang; u.rate = 0.9;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
  note.textContent = "Speaking with " + vi.name + ".";
});
const scope = document.getElementById("scope");
function drawScope(){
  const c = scope.getContext("2d");
  const w = scope.clientWidth, h = scope.clientHeight, dpr = window.devicePixelRatio || 1;
  if (scope.width !== Math.round(w * dpr)){ scope.width = Math.round(w * dpr); scope.height = Math.round(h * dpr); }
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  c.strokeStyle = "rgba(241,231,208,.12)"; c.lineWidth = 1;
  c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  c.strokeStyle = "#f5a043"; c.lineWidth = 2; c.beginPath();
  if (analyser){
    const buf = new Uint8Array(analyser.fftSize); analyser.getByteTimeDomainData(buf);
    for (let i = 0; i < buf.length; i++){ const x = i / (buf.length - 1) * w, y = h / 2 + (buf[i] - 128) / 128 * (h / 2 - 6); i ? c.lineTo(x, y) : c.moveTo(x, y); }
  } else { c.moveTo(0, h / 2); c.lineTo(w, h / 2); }
  c.stroke();
  if (analyser) requestAnimationFrame(drawScope);
}
drawScope();
onAudioReady.push(drawScope);

/* ---------------- Mix your street ---------------- */
const board = document.getElementById("board");
const MAX_TOKENS = 10;
let mix = store.get(MIX_KEY, null) || EXAMPLE_MIX.map(t => ({...t}));
let mixUid = 0;
mix.forEach(t => { t.uid = ++mixUid; t.y = Math.max(minY(t.type), t.y); });
const mixRun = {on:false, nodes:{}};
function renderPalette(){
  document.getElementById("paletteVendors").innerHTML = VENDORS.map(v => `<button class="btn btn-ghost" type="button" data-add="${v.id}"><img class="sw" src="${tokenInfo(v.id).mini}" alt="">${v.dish}</button>`).join("");
  document.getElementById("paletteAmbient").innerHTML = AMBIENT.map(a => `<button class="btn btn-ghost" type="button" data-add="${a.id}"><img class="sw" src="${tokenInfo(a.id).mini}" alt="">${a.label}</button>`).join("");
}
function renderBoard(){
  board.querySelectorAll(".token").forEach(n => n.remove());
  mix.forEach(t => {
    const info = tokenInfo(t.type);
    const el = document.createElement("div");
    el.className = "token" + (mixRun.on ? " playing" : "");
    el.tabIndex = 0; el.dataset.uid = t.uid;
    el.style.left = t.x + "%"; el.style.top = t.y + "%"; el.style.setProperty("--tc", info.color);
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", `${info.label}. Arrow keys move it, Delete removes it.`);
    el.innerHTML = `<img class="dot" src="${info.mini}" alt=""><span>${info.label}</span><button class="x" type="button" aria-label="Remove ${info.label}" tabindex="-1">×</button>`;
    board.appendChild(el);
  });
  document.getElementById("mixCount").textContent = `${mix.length} of ${MAX_TOKENS} sounds on your street.`;
}
function levelFor(t){
  const dx = (t.x - 50) / 50, dy = (t.y - 90) / 90;
  const dist = Math.min(1.2, Math.sqrt(dx * dx + dy * dy));
  return {gain:1 / (1 + dist * dist * 7), pan:Math.max(-1, Math.min(1, dx)), cutoff:700 + Math.max(0, 1 - dist) * 16000};
}
function startToken(t){
  const bus = makeBus();
  const lv = levelFor(t); bus.set(lv.gain, lv.pan, lv.cutoff);
  const sound = startSound(t.type, bus.input, v => { if (levelFor(t).gain > 0.4) caption(v); });
  mixRun.nodes[t.uid] = {bus, sound};
}
function stopToken(uid){
  const n = mixRun.nodes[uid]; if (!n) return;
  n.sound.stop(); n.bus.close();
  delete mixRun.nodes[uid];
}
function startMix(){
  if (!audio()) return;
  stopWalk();
  mixRun.on = true;
  mix.forEach(startToken);
  const b = document.getElementById("btnMixPlay"); b.textContent = "Pause"; b.setAttribute("aria-pressed", "true");
  renderBoard();
}
function stopMix(){
  if (!mixRun.on) return;
  mixRun.on = false;
  Object.keys(mixRun.nodes).forEach(stopToken);
  const b = document.getElementById("btnMixPlay"); b.textContent = "Play preview"; b.setAttribute("aria-pressed", "false");
  renderBoard();
}
document.getElementById("btnMixPlay").addEventListener("click", () => mixRun.on ? stopMix() : startMix());
document.getElementById("btnMixClear").addEventListener("click", () => { Object.keys(mixRun.nodes).forEach(stopToken); mix = []; renderBoard(); mixMsg("Street cleared. Add some sounds from the list."); });

function addToken(type){
  if (mix.length >= MAX_TOKENS){ mixMsg(`Your street is full. Remove a sound to add another (maximum ${MAX_TOKENS}).`); return; }
  const t = {type, x:20 + Math.random() * 60, y:30 + Math.random() * 45, uid:++mixUid};
  mix.push(t);
  if (mixRun.on) startToken(t);
  renderBoard();
  const el = board.querySelector(`.token[data-uid="${t.uid}"]`); if (el) el.focus();
}
function removeToken(uid){
  stopToken(uid);
  mix = mix.filter(t => t.uid !== uid);
  renderBoard();
}
function moveToken(t, x, y){
  t.x = Math.max(4, Math.min(96, x)); t.y = Math.max(minY(t.type), Math.min(95, y));
  const el = board.querySelector(`.token[data-uid="${t.uid}"]`);
  if (el){ el.style.left = t.x + "%"; el.style.top = t.y + "%"; }
  const n = mixRun.nodes[t.uid];
  if (n){ const lv = levelFor(t); n.bus.set(lv.gain, lv.pan, lv.cutoff); }
}
document.getElementById("paletteVendors").addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) addToken(b.dataset.add); });
document.getElementById("paletteAmbient").addEventListener("click", e => { const b = e.target.closest("[data-add]"); if (b) addToken(b.dataset.add); });

let drag = null;
board.addEventListener("pointerdown", e => {
  if (e.target.closest(".x")){ removeToken(+e.target.closest(".token").dataset.uid); return; }
  const el = e.target.closest(".token"); if (!el) return;
  const t = mix.find(m => m.uid === +el.dataset.uid); if (!t) return;
  drag = {t, el}; el.setPointerCapture(e.pointerId); e.preventDefault();
});
board.addEventListener("pointermove", e => {
  if (!drag) return;
  const r = board.getBoundingClientRect();
  moveToken(drag.t, (e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
});
const endDrag = () => { drag = null; };
board.addEventListener("pointerup", endDrag); board.addEventListener("pointercancel", endDrag);
board.addEventListener("keydown", e => {
  const el = e.target.closest(".token"); if (!el) return;
  const t = mix.find(m => m.uid === +el.dataset.uid); if (!t) return;
  const step = e.shiftKey ? 8 : 3;
  const moves = {ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step]};
  if (moves[e.key]){ e.preventDefault(); moveToken(t, t.x + moves[e.key][0], t.y + moves[e.key][1]); }
  if (e.key === "Delete" || e.key === "Backspace"){ e.preventDefault(); removeToken(t.uid); }
});

function mixMsg(s){ document.getElementById("mixMsg").textContent = s; }
document.getElementById("btnMixSave").addEventListener("click", () => {
  const ok = store.set(MIX_KEY, mix.map(({type, x, y}) => ({type, x, y})));
  mixMsg(ok ? "Saved. Your street will be here next time you open this page in this browser." : "This browser blocked saving. Copy the share code instead.");
});
document.getElementById("btnMixCopy").addEventListener("click", () => {
  const code = encodeMix(mix); const input = document.getElementById("mixCode"); input.value = code;
  const fallback = () => { input.focus(); input.select(); mixMsg("Code is selected in the box. Copy it with Ctrl+C or Cmd+C."); };
  try{ navigator.clipboard.writeText(code).then(() => mixMsg("Share code copied. Send it to a friend and they can paste it here."), fallback); }catch(e){ fallback(); }
});
document.getElementById("btnMixLoad").addEventListener("click", () => {
  try{
    const next = decodeMix(document.getElementById("mixCode").value, MAX_TOKENS).map(t => ({...t, y:Math.max(minY(t.type), t.y), uid:++mixUid}));
    const wasOn = mixRun.on; stopMix(); mix = next; renderBoard(); if (wasOn) startMix();
    mixMsg(`Loaded a street with ${mix.length} sounds.`);
  }catch(e){ mixMsg("That code didn't work. Check it starts with TR1- and was copied in full."); }
});

// The full street opens with whatever is on the preview board, carried in the link as a share code.
document.getElementById("btnFullStreet").addEventListener("click", e => {
  stopMix();
  e.currentTarget.href = "street.html#" + encodeMix(mix);
});

/* ---------------- Contribute ---------------- */
const EXAMPLE_SUB = {city:"Hải Phòng", dish:"Bánh mì cay", call:"Ai bánh mì cay đây!", en:"Who wants spicy bread sticks?", file:"", example:true};
function renderSubs(){
  const subs = store.get("tiengrao.subs", []);
  const list = [...subs].reverse().concat([EXAMPLE_SUB]);
  document.getElementById("subList").innerHTML = list.map(s => `
    <li><div class="d-flex justify-content-between gap-2 flex-wrap"><strong>${esc(s.dish)}</strong><span class="badge">${s.example ? "Example" : "Sent from this device"}</span></div>
    <div class="fst-italic">${esc(s.call)}</div>
    <div class="text-secondary small">${esc(s.city)}${s.en ? " · " + esc(s.en) : ""}${s.file ? " · " + esc(s.file) : ""}</div></li>`).join("");
}
function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
const form = document.getElementById("contribForm");
form.addEventListener("submit", e => {
  e.preventDefault();
  if (!form.checkValidity()){ form.classList.add("was-validated"); return; }
  const f = document.getElementById("audioInput").files[0];
  const sub = {city:cityInput.value.trim(), dish:dishInput.value.trim(), call:callInput.value.trim(), en:translationInput.value.trim(), file:f ? f.name : ""};
  const subs = store.get("tiengrao.subs", []); subs.push(sub); store.set("tiengrao.subs", subs);
  form.reset(); form.classList.remove("was-validated");
  renderSubs();
  toast(`Thanks. Your call from ${sub.city} has been added to the list.`);
});
form.addEventListener("reset", () => form.classList.remove("was-validated"));
function toast(msg){ document.getElementById("toastBody").textContent = msg; bootstrap.Toast.getOrCreateInstance(document.getElementById("toast"), {delay:3500}).show(); }

document.querySelectorAll("#navLinks .nav-link").forEach(a => a.addEventListener("click", () => {
  const c = bootstrap.Collapse.getInstance(document.getElementById("navLinks")); if (c) c.hide();
}));

/* ---------------- Hero skyline: tube houses and tangled power lines ---------------- */
function drawSkyline(){
  const cv = document.getElementById("skyline"), c = cv.getContext("2d");
  const w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, "#0b1c2b"); sky.addColorStop(1, "#173a55");
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 60; i++){ c.fillStyle = `rgba(241,231,208,${0.15 + rnd() * 0.35})`; c.fillRect(rnd() * w, rnd() * h * 0.45, 1.2, 1.2); }
  let x = -10; const tops = [];
  while (x < w + 20){
    const bw = 34 + rnd() * 46, bh = h * (0.35 + rnd() * 0.45), top = h - bh;
    c.fillStyle = rnd() > 0.5 ? "#0c1d2b" : "#102638"; c.fillRect(x, top, bw - 2, bh);
    for (let y = top + 14; y < h - 20; y += 26){
      c.fillStyle = "rgba(169,183,193,.12)"; c.fillRect(x, y + 14, bw - 2, 2);
      if (rnd() > 0.55){ c.fillStyle = rnd() > 0.3 ? "rgba(245,160,67,.75)" : "rgba(85,179,163,.6)"; c.fillRect(x + 6, y, bw - 14, 9); }
    }
    tops.push([x + bw / 2, top + 10]); x += bw;
  }
  c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = 1.2;
  for (let k = 0; k < 9; k++){
    c.beginPath(); const y0 = h * (0.38 + rnd() * 0.25);
    c.moveTo(-10, y0);
    for (let px = 0; px <= w + 120; px += 120){ c.quadraticCurveTo(px + 60, y0 + 18 + rnd() * 16, px + 120, y0 + (rnd() - 0.5) * 10); }
    c.stroke();
  }
  const fade = c.createLinearGradient(0, 0, w * 0.75, 0); fade.addColorStop(0, "rgba(14,34,51,.92)"); fade.addColorStop(1, w < 600 ? "rgba(14,34,51,.7)" : "rgba(14,34,51,.1)");
  c.fillStyle = fade; c.fillRect(0, 0, w, h);
}
let skyT; window.addEventListener("resize", () => { clearTimeout(skyT); skyT = setTimeout(drawSkyline, 150); });

/* ---------------- Boot ---------------- */
renderStreet(); renderPalette(); renderBoard(); renderSubs(); drawSkyline();
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
  gsap.from(".hero-anim", {y:18, duration:0.8, stagger:0.08, ease:"power2.out"});
}
