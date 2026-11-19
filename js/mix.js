"use strict";
/* MixYourStreet.html: a drag-and-drop board of vendors and street sounds, heard from where "You" stands.
   The same mix opens on YourStreet.html, carried in the link as a share code. */
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
  e.currentTarget.href = "YourStreet.html#" + encodeMix(mix);
});

renderPalette(); renderBoard();
