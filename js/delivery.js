"use strict";
/* Delivery runs: a small vehicle routing puzzle played from the motorbike.
   Pick up food at the stall, deliver every order, and come back. The bike only carries a few boxes,
   so on busy nights you have to return to the stall to reload. Shorter routes burn less fuel and earn tips.
   The best possible route is worked out exactly (Held-Karp per trip, then the best way to split orders into trips).
   Pictures: images/game/stall.png, house.png and scooter.png; the map itself is drawn. */
const {openDelivery, deliveryIsOpen, deliveryKey} = (() => {
  const COLS = 8, ROWS = 5;            // crossings in the neighbourhood grid
  const BLOCK_KM = 0.15;               // one block of alley
  const FUEL_PER_KM = 4000;            // đồng
  const DEPOT = {c:0, r:2};            // the stall, on your street at the left edge
  const LEVELS = {
    quiet:{label:"Quiet night", orders:4, cap:4},
    busy:{label:"Busy night", orders:5, cap:3},
    festival:{label:"Festival night", orders:7, cap:3}
  };
  const CUSTOMERS = ["Linh", "Mr. Bình", "Mrs. Mai", "The Trần family", "Night-shift nurses", "Student flat 4B",
    "Karaoke room 3", "Grandpa Phúc", "Hùng's barbershop", "The noodle-loving twins", "Mrs. Hạnh", "Late-night printers"];

  const $ = id => document.getElementById(id);
  const money = n => n.toLocaleString("en-US") + " ₫";
  const km = units => (units * BLOCK_KM).toFixed(2) + " km";
  const el = {
    box:$("deliver"), wallet:$("dvWallet"), levels:$("dvLevels"), map:$("dvMap"), svg:$("dvSvg"), pins:$("dvPins"), scooter:$("dvScooter"),
    load:$("dvLoad"), orders:$("dvOrders"), route:$("dvRoute"), dist:$("dvDist"), fuel:$("dvFuel"), pay:$("dvPay"), earn:$("dvEarn"),
    undo:$("dvUndo"), clear:$("dvClear"), go:$("dvGo"), msg:$("dvMsg"), close:$("dvClose"), legend:$("dvLegend"),
    result:$("dvResult"), resTitle:$("dvResTitle"), stars:$("dvStars"), resBody:$("dvResBody"), compare:$("dvCompare"), again:$("dvAgain"), leave:$("dvLeave")
  };
  // route: order indexes in the order you'll visit them; -1 means "back to the stall to reload"
  const st = {open:false, level:"busy", orders:[], route:[], done:false, best:null, onClose:null, anim:0};

  /* ---------- Geometry ---------- */
  const at = i => i < 0 ? DEPOT : st.orders[i];
  const dist = (a, b) => Math.abs(at(a).c - at(b).c) + Math.abs(at(a).r - at(b).r);
  const pct = p => ({x:(p.c + 0.5) / COLS * 100, y:(p.r + 0.5) / ROWS * 100});
  const vb = p => ({x:p.c * 100 + 50, y:p.r * 100 + 50});            // SVG viewBox units
  const legs = route => { const s = [-1, ...route]; if (s[s.length - 1] !== -1) s.push(-1); return s; };
  const routeLen = route => { const s = legs(route); let d = 0; for (let i = 1; i < s.length; i++) d += dist(s[i - 1], s[i]); return d; };
  // Alleys only run along the grid, so each leg goes across first, then up or down.
  function pathPoints(route){
    const s = legs(route), pts = [vb(at(s[0]))];
    for (let i = 1; i < s.length; i++){
      const a = at(s[i - 1]), b = at(s[i]);
      pts.push(vb({c:b.c, r:a.r}), vb(b));
    }
    return pts;
  }
  const cap = () => LEVELS[st.level].cap;
  function boxesLeft(){
    let n = cap();
    st.route.forEach(i => { n = i < 0 ? cap() : n - 1; });
    return n;
  }

  /* ---------- Best possible route ---------- */
  function solve(){
    const n = st.orders.length, N = 1 << n, C = cap();
    const bits = m => { let k = 0; while (m){ m &= m - 1; k++; } return k; };
    const dp = Array.from({length:N}, () => new Array(n).fill(Infinity));
    const par = Array.from({length:N}, () => new Array(n).fill(-1));
    for (let i = 0; i < n; i++) dp[1 << i][i] = dist(-1, i);
    for (let m = 1; m < N; m++){
      if (bits(m) >= C) continue;
      for (let j = 0; j < n; j++){
        if (!(m >> j & 1) || dp[m][j] === Infinity) continue;
        for (let k = 0; k < n; k++){
          if (m >> k & 1) continue;
          const nm = m | 1 << k, v = dp[m][j] + dist(j, k);
          if (v < dp[nm][k]){ dp[nm][k] = v; par[nm][k] = j; }
        }
      }
    }
    const trip = new Array(N).fill(Infinity), tripEnd = new Array(N).fill(-1);
    for (let m = 1; m < N; m++) for (let j = 0; j < n; j++){
      const v = dp[m][j] + dist(j, -1);
      if (v < trip[m]){ trip[m] = v; tripEnd[m] = j; }
    }
    const best = new Array(N).fill(Infinity), pick = new Array(N).fill(0);
    best[0] = 0;
    for (let m = 1; m < N; m++){
      const low = m & -m;
      for (let s = m; s; s = (s - 1) & m){
        if (!(s & low) || trip[s] === Infinity) continue;
        const v = trip[s] + best[m ^ s];
        if (v < best[m]){ best[m] = v; pick[m] = s; }
      }
    }
    const route = [];
    for (let m = N - 1; m; m ^= pick[m]){
      const seq = []; let s = pick[m], j = tripEnd[s];
      while (j >= 0){ seq.unshift(j); const pj = par[s][j]; s ^= 1 << j; j = pj; }
      if (route.length) route.push(-1);
      route.push(...seq);
    }
    return {len:best[N - 1], route};
  }

  /* ---------- New orders ---------- */
  function newOrders(){
    const L = LEVELS[st.level], taken = new Set([`${DEPOT.c},${DEPOT.r}`]);
    const foods = Object.entries(TALK).flatMap(([vid, t]) => t.shop.items.map(it => ({vid, name:it.name})));
    const names = CUSTOMERS.slice().sort(() => Math.random() - 0.5);
    st.orders = [];
    while (st.orders.length < L.orders){
      const c = 1 + Math.floor(Math.random() * (COLS - 1)), r = Math.floor(Math.random() * ROWS);
      if (taken.has(`${c},${r}`)) continue;
      taken.add(`${c},${r}`);
      const food = foods[Math.floor(Math.random() * foods.length)];
      st.orders.push({c, r, who:names[st.orders.length], food:food.name, vid:food.vid, pay:12000 + Math.floor(Math.random() * 5) * 2000});
    }
    st.route = []; st.done = false; st.best = solve();
    el.result.hidden = true;
    msg(`Your bike carries ${L.cap} boxes. Tap the houses in the order you'll visit them.`);
    render();
  }

  /* ---------- Drawing ---------- */
  function drawMap(){
    let g = "";
    for (let c = 0; c < COLS - 1; c++) for (let r = 0; r < ROWS - 1; r++){
      const shade = ["#1c3a52", "#24465f", "#2d3f4f", "#33435a"][(c * 3 + r * 5) % 4];
      g += `<rect class="dv-block" x="${c * 100 + 62}" y="${r * 100 + 62}" width="76" height="76" rx="6" fill="${shade}"/>`;
    }
    for (let r = 0; r < ROWS; r++) g += `<line class="dv-street" x1="50" y1="${r * 100 + 50}" x2="${COLS * 100 - 50}" y2="${r * 100 + 50}"/>`;
    for (let c = 0; c < COLS; c++) g += `<line class="dv-street" x1="${c * 100 + 50}" y1="50" x2="${c * 100 + 50}" y2="${ROWS * 100 - 50}"/>`;
    return g;
  }
  const poly = (pts, cls) => `<polyline class="${cls}" points="${pts.map(p => `${p.x},${p.y}`).join(" ")}"/>`;
  function render(){
    // map lines: your route (solid) and, once finished, the best route (dashed)
    el.svg.innerHTML = `<g>${drawMap()}</g>` +
      (st.route.length ? poly(pathPoints(st.route), "dv-mine") : "") +
      (st.done ? poly(pathPoints(st.best.route), "dv-best") : "");
    el.legend.hidden = !st.done;
    // pins
    // stop numbers count deliveries only, not trips back to the stall
    const nums = {}; let k = 0; st.route.forEach(i => { if (i >= 0) nums[i] = ++k; });
    const stop = i => i in nums ? nums[i] - 1 : -1;
    const d = pct(DEPOT);
    el.pins.innerHTML = `<button class="pin depot" type="button" data-i="-1" style="left:${d.x}%;top:${d.y}%" aria-label="The stall: reload the bike here">
        <span class="pin-art"><img src="images/game/stall.png" alt=""><span class="pin-ph">Stall</span></span></button>` +
      st.orders.map((o, i) => { const p = pct(o), n = stop(i);
        return `<button class="pin${n >= 0 ? " planned" : ""}${o.delivered ? " delivered" : ""}" type="button" data-i="${i}" style="left:${p.x}%;top:${p.y}%"
            aria-label="${o.who}: ${o.food}, pays ${money(o.pay)}${n >= 0 ? `, stop ${n + 1}` : ""}">
          <span class="pin-art"><img src="images/game/house.png" alt=""><span class="pin-ph">${i + 1}</span></span>
          <img class="pin-food" src="images/mini/${o.vid}.png" alt="">
          <span class="pin-tag">${o.delivered ? '<img class="ico" src="images/icons/check.png" alt="Delivered">' : n >= 0 ? `Stop ${n + 1}` : money(o.pay)}</span>
        </button>`; }).join("");
    el.pins.querySelectorAll(".pin-art img").forEach(img => {
      img.addEventListener("load", () => img.parentNode.classList.add("has-art"));
    });
    // order list
    el.orders.innerHTML = st.orders.map((o, i) => { const n = stop(i);
      return `<li class="${o.delivered ? "delivered" : n >= 0 ? "planned" : ""}">
        <img src="images/mini/${o.vid}.png" alt=""><span><b>${o.who}</b><small>${o.food}</small></span>
        <em>${o.delivered ? "Delivered" : n >= 0 ? `Stop ${n + 1}` : money(o.pay)}</em></li>`; }).join("");
    // route chips
    el.route.innerHTML = ["Stall", ...st.route.map(i => i < 0 ? "Stall (reload)" : st.orders[i].who), ...(allPlanned() ? ["Stall"] : [])]
      .map(s => `<span class="${s.startsWith("Stall") ? "chip depot" : "chip"}">${s}</span>`).join('<span class="arrow" aria-hidden="true">→</span>');
    // numbers
    const len = routeLen(st.route), fuel = fuelCost(len), pay = st.orders.reduce((a, o) => a + o.pay, 0);
    el.load.textContent = `${boxesLeft()}/${cap()}`;
    el.dist.textContent = st.route.length ? km(len) : "–";
    el.fuel.textContent = st.route.length ? "− " + money(fuel) : "–";
    el.pay.textContent = money(pay);
    el.earn.textContent = st.route.length ? money(pay - fuel) : "–";
    el.wallet.textContent = money(walletBalance());
    const complete = allPlanned();
    el.undo.disabled = el.clear.disabled = st.done || !st.route.length;
    el.go.disabled = !st.done && !complete;
    el.go.textContent = st.done ? "New orders" : "Start delivery";
    el.levels.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.level === st.level)));
  }
  const fuelCost = units => Math.round(units * BLOCK_KM * FUEL_PER_KM / 100) * 100;
  const allPlanned = () => st.orders.every((o, i) => st.route.includes(i));
  function msg(s){ el.msg.textContent = s; }

  /* ---------- Planning ---------- */
  function tapStop(i){
    if (st.done || st.anim) return;
    if (i < 0){
      if (!st.route.length || st.route[st.route.length - 1] === -1){ msg("You're already at the stall."); return; }
      if (allPlanned()){ msg("Every order is planned. The bike comes back to the stall at the end anyway."); return; }
      st.route.push(-1); msg("Back to the stall to reload. The bike is full again.");
    } else {
      if (st.route.includes(i)){ msg(`${st.orders[i].who} is already on your route. Use Undo to change it.`); return; }
      if (!boxesLeft()){ msg("The bike is empty. Tap the stall to go back and reload first."); return; }
      st.route.push(i);
      msg(allPlanned() ? "Every order is planned. Press Start delivery when you're happy with the route." : `${st.orders[i].who} added as stop ${st.route.filter(j => j >= 0).length}.`);
    }
    render();
  }
  el.pins.addEventListener("click", e => { const b = e.target.closest(".pin"); if (b) tapStop(+b.dataset.i); });
  el.undo.addEventListener("click", () => { st.route.pop(); msg("Took back the last stop."); render(); });
  el.clear.addEventListener("click", () => { st.route = []; msg("Route cleared. Start again from the stall."); render(); });
  el.levels.addEventListener("click", e => { const b = e.target.closest("[data-level]"); if (!b || st.anim) return; st.level = b.dataset.level; newOrders(); });

  /* ---------- Riding the route ---------- */
  function ride(){
    const pts = pathPoints(st.route);
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++){ const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y); seg.push(d); total += d; }
    const s = legs(st.route), stopsAt = [];     // distance along the path where each stop is reached
    let acc = 0; for (let i = 1; i < pts.length; i++){ acc += seg[i - 1]; if (i % 2 === 0) stopsAt.push({d:acc, stop:s[i / 2]}); }
    const speed = Math.max(600, total / 4.5), t0 = performance.now();  // viewBox units per second; the ride lasts 4.5 s at most
    el.scooter.hidden = false;
    msg("On the way…");
    const step = now => {
      const d = Math.min(total, (now - t0) / 1000 * speed);
      let rest = d, k = 0;
      while (k < seg.length - 1 && rest > seg[k]){ rest -= seg[k]; k++; }
      const a = pts[k], b = pts[k + 1], f = seg[k] ? rest / seg[k] : 1;
      const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
      el.scooter.style.left = x / (COLS * 100) * 100 + "%"; el.scooter.style.top = y / (ROWS * 100) * 100 + "%";
      el.scooter.classList.toggle("left", b.x < a.x);
      let changed = false;
      stopsAt.forEach(p => { if (p.d <= d && p.stop >= 0 && !st.orders[p.stop].delivered){ st.orders[p.stop].delivered = true; changed = true; } });
      if (changed) render();
      if (d < total) st.anim = requestAnimationFrame(step);
      else { st.anim = 0; finish(); }
    };
    st.anim = requestAnimationFrame(step);
  }
  function finish(){
    const mine = routeLen(st.route), best = st.best.len, pay = st.orders.reduce((a, o) => a + o.pay, 0), fuel = fuelCost(mine);
    const ratio = mine / best, stars = ratio <= 1.0001 ? 3 : ratio <= 1.15 ? 2 : 1;
    const tip = Math.round(pay * [0, 0, 0.1, 0.2][stars] / 100) * 100;
    const earned = pay - fuel + tip;
    addMoney(earned);
    st.done = true;
    el.resTitle.textContent = stars === 3 ? "Perfect route!" : stars === 2 ? "Nice riding!" : "All delivered!";
    el.stars.innerHTML = [1, 2, 3].map(n => `<img src="images/icons/star-${n <= stars ? "on" : "off"}.png" alt="">`).join("");
    el.stars.setAttribute("aria-label", `${stars} out of 3 stars`);
    el.resBody.innerHTML = `
      <dt>Your route</dt><dd>${km(mine)}</dd>
      <dt>Shortest possible</dt><dd>${km(best)}${stars === 3 ? " · you found it" : ""}</dd>
      <dt>Paid by customers</dt><dd>+ ${money(pay)}</dd>
      <dt>Fuel</dt><dd>− ${money(fuel)}</dd>
      <dt>Tips for a quick route</dt><dd>${tip ? "+ " + money(tip) : "none this time"}</dd>
      <dt class="total">Added to your wallet</dt><dd class="total">+ ${money(earned)}</dd>`;
    el.result.hidden = false;
    msg(stars === 3 ? "You found the shortest route." : `The shortest route was ${km(best)}. Compare it on the map.`);
    render();
    el.compare.focus({preventScroll:true});
  }
  el.go.addEventListener("click", () => { if (st.done) newOrders(); else if (allPlanned() && !st.anim) ride(); });
  el.compare.addEventListener("click", () => { el.result.hidden = true; el.go.focus({preventScroll:true}); });
  el.again.addEventListener("click", newOrders);
  el.leave.addEventListener("click", closeDelivery);
  el.close.addEventListener("click", closeDelivery);

  /* ---------- Open and close ---------- */
  function openDelivery(onClose){
    st.open = true; st.onClose = onClose;
    el.box.hidden = false; el.scooter.hidden = true;
    newOrders();
    el.pins.querySelector(".pin:not(.depot)").focus({preventScroll:true});
  }
  function closeDelivery(){
    if (!st.open) return;
    cancelAnimationFrame(st.anim); st.anim = 0;
    st.open = false; el.box.hidden = true;
    const cb = st.onClose; st.onClose = null;
    if (cb) cb();
  }
  const deliveryIsOpen = () => st.open;
  // Escape closes the results, then the game; Backspace takes back the last stop.
  function deliveryKey(e){
    if (e.key === "Escape"){ e.preventDefault(); el.result.hidden ? closeDelivery() : (el.result.hidden = true); }
    else if (e.key === "Backspace" && !st.done && st.route.length){ e.preventDefault(); el.undo.click(); }
  }
  el.svg.setAttribute("viewBox", `0 0 ${COLS * 100} ${ROWS * 100}`);
  return {openDelivery, deliveryIsOpen, deliveryKey};
})();
