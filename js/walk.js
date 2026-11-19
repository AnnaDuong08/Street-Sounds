"use strict";
/* NightWalk.html: scroll along a row of stalls; the stall nearest the middle is loudest and each call pans left or right.
   Shared data, sound engine, captions and the story panel live in core.js. */
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

renderStreet();
