"use strict";
/* Tutorials on Your street.
   1. A guided tutorial, offered once when you first step in: walk, ride, talk, earn, buy, check your bag.
      Each step finishes when you actually do it, and the button you need glows. You can skip a step or the
      whole tutorial (after a confirm). Progress is saved in localStorage ("tiengrao.tutorial"), so leaving
      for the home page and coming back picks up at the same step.
   2. A Tutorials library (top bar) to read any topic again or practise one step on the street.
   Uses the street's own state from street.js (player, ride, items, meet, popItem…) and shop/talk/delivery helpers. */

const TUT_KEY = "tiengrao.tutorial";
const tutEl = id => document.getElementById(id);
// Welcome, confirm and the library are modal: the street ignores keys and the player stands still while one is open.
function tutorialModalOpen(){ return !tutEl("tutWelcome").hidden || !tutEl("tutConfirm").hidden || !tutEl("tutLib").hidden; }

(() => {
  const $ = tutEl;
  const coach = $("tutCoach");
  const WALK_GOAL = 700;   // world px to walk before the first step counts

  /* ---------------- Saved progress ---------------- */
  // status: "new" (never offered) · "active" (in progress at step) · "done" · "skipped"
  const load = () => Object.assign({status:"new", step:0, done:[]}, store.get(TUT_KEY, {}));
  const save = st => store.set(TUT_KEY, st);

  /* ---------------- Helpers that read the street ---------------- */
  const vis = el => !!el && !el.hidden && el.offsetParent !== null;
  const distTo = t => { const p = toWorld(t); return Math.hypot(p.x - player.x, p.y - player.y); };
  const nearest = pred => {
    let best = null;
    items.forEach(t => { if (t.el && t !== ride.bike && pred(t)){ const d = distTo(t); if (!best || d < best.d) best = {t, d}; } });
    return best ? best.t : null;
  };
  const isVendor = t => !!vendorById[t.type] && !!TALK[t.type];
  // Says which way to walk when the glowing thing is off screen.
  function where(t){
    const p = toWorld(t), sx = (p.x - cam.x) * cam.s;
    if (sx > 40 && sx < cam.vw - 40) return "";
    return p.x < player.x ? " It's off to your <b>left ←</b>." : " It's off to your <b>right →</b>.";
  }
  const bagCount = () => bagContents().reduce((a, b) => a + b.count, 0);
  const label = t => vendorById[t.type] ? `${vendorById[t.type].dish.toLowerCase()} seller` : t.type === "moto" ? "motorbike" : tokenInfo(t.type).label.toLowerCase();

  // When something else is open, ask the player to close it before the next action.
  function closeFirst(stepId){
    if (!$("tutLib").hidden) return null;
    if (shopIsOpen() && stepId !== "buy") return {text:"Close the shop first.", glow:[$("shopClose")]};
    if (deliveryIsOpen() && stepId !== "money") return {text:"Close Delivery runs first.", glow:[$("dvClose")]};
    if (!bagBox.hidden && stepId !== "bag") return {text:"Close your bag first.", glow:[$("bagClose")]};
    if (talkIsOpen() && !["talk", "buy", "bag"].includes(stepId)){
      return vis($("talkBye")) ? {text:"Say <b>Goodbye</b> to finish this chat first.", glow:[$("talkBye")]}
                               : {text:"Press <b>Close</b> to finish this chat.", glow:[$("talkNext")]};
    }
    return null;
  }
  // No motorbike or vendor on the street: point at Build so they can add one.
  function needBuild(what, addId){
    const btn = buildPanel.hidden ? $("btnBuild") : buildPanel.querySelector(`[data-add="${addId}"]`);
    return {text:`There's no ${what} on your street. Open <b>Build</b> and add one.`, glow:[btn]};
  }
  function walkTo(t, verb){
    if (meet.item === t) return {text:`Press <kbd>E</kbd> to ${verb}, or click it.`, glow:[t.el]};
    return {text:`Walk over to the glowing ${label(t)}.${where(t)}`, glow:[t.el]};
  }
  function talkHint(){
    if (popItem && isVendor(popItem)) return {text:"Choose <b>Talk to them</b>.", glow:[$("popMore")]};
    const v = nearest(isVendor);
    if (!v) return needBuild("vendor", "banhmi");
    return walkTo(v, `talk to the ${label(v)}`);
  }
  function bikeHint(then){
    if (popItem && popItem.type === "moto") return {text:then === "ride" ? "Choose <b>Ride the motorbike</b>." : "Choose <b>Delivery runs</b>.", glow:[$(then === "ride" ? "popRide" : "popDeliver")]};
    const m = nearest(t => t.type === "moto");
    if (!m) return needBuild("motorbike", "moto");
    return walkTo(m, "get on");
  }

  /* ---------------- Guided steps ---------------- */
  const STEPS = [
    {id:"walk", title:"Walk around",
      check:r => r.walked >= WALK_GOAL,
      hint:r => ({text:"Walk with <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or the arrow keys, or click the ground to walk there. Listen to the calls get louder as you get closer.", bar:r.walked / WALK_GOAL}),
      tip:"Calls get louder as you walk closer. The <b>You can hear</b> list at the top left shows who is in earshot."},
    {id:"ride", title:"Ride the motorbike",
      check:() => ride.on,
      hint:() => bikeHint("ride"),
      tip:"Change speed with <kbd>Q</kbd> and <kbd>R</kbd> or the slider. Press <kbd>Esc</kbd> or <b>Get off</b> to step off. You can stay on the bike for the next step."},
    {id:"talk", title:"Talk to a vendor",
      check:() => talkIsOpen(),
      hint:() => talkHint(),
      tip:"Pick a reply with the mouse or number keys, and press <b>Next</b> or <kbd>E</kbd> to move on. Say <b>Goodbye</b> or press <kbd>Esc</kbd> when you're done."},
    {id:"money", title:"Earn money with delivery runs",
      check:r => r.earned,
      hint:() => {
        if (deliveryIsOpen()) return {text:"Pick a night, then tap the houses on the map to plan a route from the stall and back. Press <b>Start delivery</b>.", glow:[$("dvGo")]};
        if (ride.on) return {text:"Press <b>Delivery runs</b> on the motorbike panel, or press <kbd>F</kbd>.", glow:[$("rideDeliver")]};
        return bikeHint("deliver");
      },
      tip:"Shorter routes use less fuel and earn tips. Your money shows in the <b>Wallet</b> at the top right."},
    {id:"buy", title:"Buy something",
      check:r => r.bought,
      hint:() => {
        if (shopIsOpen()){
          if (vis($("buy"))) return {text:"Choose how many with − and + or the slider, then press <b>Buy</b>.", glow:[$("buyConfirm")]};
          return {text:"Pick something you'd like to buy.", glow:[$("shopGrid").querySelector(".ware:not([disabled])") || $("shopClose")]};
        }
        if (talkIsOpen()){
          const c = [...$("talkChoices").querySelectorAll(".talk-choice")].find(b => /selling/i.test(b.textContent));
          if (vis($("talkChoices")) && c) return {text:"Choose <b>What are you selling?</b>", glow:[c]};
          return {text:"Press <b>Next</b> or <kbd>E</kbd> to hear them out.", glow:[$("talkNext")]};
        }
        const v = nearest(t => isVendor(t) && !isSoldOut(t.type));
        if (!v) return needBuild("vendor with food left", "banhmi");
        const w = walkTo(v, `talk to the ${label(v)}`);
        return {glow:w.glow, text:(meet.item === v ? "" : "Talk to a vendor and ask what they're selling. ") + w.text};
      },
      tip:"Stock resets every night. If you buy a vendor's last item, they get to go home early."},
    {id:"bag", title:"Look in your bag",
      check:r => r.bagOpened,
      hint:() => ({text:"Press <b>My bag</b> in the top bar.", glow:[$("btnBag")]}),
      tip:"Everything you buy ends up here, with who sold it to you and how much you've spent altogether."}
  ];
  const stepById = id => STEPS.find(s => s.id === id);

  /* ---------------- Running the guided tutorial ---------------- */
  // run.practice: one step from the library, which doesn't touch the saved progress
  let run = null, timer = null, glowing = [];

  function setGlow(list){
    const next = (list || []).filter(Boolean);
    glowing.forEach(el => { if (!next.includes(el)) el.classList.remove("tut-glow"); });
    next.forEach(el => el.classList.add("tut-glow"));
    glowing = next;
  }
  function freshCounters(){
    Object.assign(run, {walked:0, last:{x:player.x, y:player.y}, earned:false, bought:false, bagOpened:false,
      wallet:walletBalance(), bag:bagCount(), phase:"step"});
  }
  function start(ids, i, practice){
    run = {ids, i, practice};
    freshCounters();
    coach.hidden = false; setMin(false);
    document.body.classList.add("tut-running");
    clearInterval(timer); timer = setInterval(tick, 200);
    tick();
  }
  function stop(){
    clearInterval(timer); timer = null; run = null;
    setGlow([]); coach.hidden = true;
    document.body.classList.remove("tut-running");
  }
  const current = () => run && stepById(run.ids[run.i]);

  function tick(){
    if (!run) return;
    // walking (on foot or on the bike) counts towards the first step
    const moved = Math.hypot(player.x - run.last.x, player.y - run.last.y);
    if (moved < 400) run.walked += moved;   // ignore jumps such as getting on the bike
    run.last = {x:player.x, y:player.y};
    if (!bagBox.hidden) run.bagOpened = true;

    const panel = shopIsOpen() || deliveryIsOpen() || !bagBox.hidden;
    coach.classList.toggle("strip", panel);
    coach.classList.toggle("left", !panel && talkIsOpen());
    if (run.phase !== "step") return;
    const s = current();
    if (s.check(run)){ complete(); return; }
    const h = closeFirst(s.id) || s.hint(run);
    if (!h){ setGlow([]); return; }
    render(s, h.text, h.bar);
    setGlow(coach.classList.contains("min") ? [] : h.glow);
  }
  function render(s, text, bar){
    const n = run.ids.length;
    $("tutStepLabel").textContent = run.practice ? "Practice" : `Tutorial · Step ${run.i + 1} of ${n}`;
    $("tutTitle").textContent = s.title;
    if ($("tutText").innerHTML !== text) $("tutText").innerHTML = text;
    $("tutBar").hidden = bar === undefined;
    if (bar !== undefined) $("tutBar").firstElementChild.style.width = Math.min(100, Math.round(bar * 100)) + "%";
    $("tutDotsRun").innerHTML = run.practice ? "" : run.ids.map((_, j) => `<li class="${j < run.i ? "past" : j === run.i ? "now" : ""}"></li>`).join("");
    $("tutSkipStep").hidden = run.practice;
    $("tutSkipAll").hidden = false;
    $("tutSkipAll").textContent = run.practice ? "Stop practising" : "Skip tutorial";
    $("tutNext").hidden = true;
  }
  // A step is done: say what else is useful to know, and wait for Next.
  function complete(){
    const s = current();
    run.phase = "done";
    if (!run.practice){
      const st = load();
      st.status = "active"; st.step = run.i + 1;
      if (!st.done.includes(s.id)) st.done.push(s.id);
      save(st);
    }
    $("tutTitle").textContent = "✓ " + s.title;
    $("tutText").innerHTML = s.tip;
    $("tutBar").hidden = true;
    $("tutSkipStep").hidden = $("tutSkipAll").hidden = true;
    const last = run.i === run.ids.length - 1;
    $("tutNext").textContent = run.practice ? "Done" : last ? "Finish" : "Next step";
    $("tutNext").hidden = false;
    setMin(false);
    setGlow([$("tutNext")]);
  }
  function nextStep(){
    if (!run) return;
    if (run.phase === "finish"){ endTour("done"); return; }
    if (run.practice){ stop(); resumeSaved(); return; }
    if (run.i + 1 < run.ids.length){ run.i += 1; freshCounters(); tick(); return; }
    // last step: point at the Tutorials button so they know where to find it again
    run.phase = "finish";
    $("tutStepLabel").textContent = "Tutorial complete";
    $("tutTitle").textContent = "You're ready for the street";
    $("tutText").innerHTML = "Read any of this again, or practise a step, from <b>Tutorials</b> in the top bar.";
    $("tutDotsRun").innerHTML = "";
    $("tutNext").textContent = "Done";
    setGlow([$("tutNext"), $("btnTutorials")]);
  }
  function skipStep(){
    if (!run || run.practice) return;
    const st = load(); st.status = "active"; st.step = run.i + 1; save(st);
    if (run.i + 1 < run.ids.length){ run.i += 1; freshCounters(); tick(); }
    else { run.phase = "done"; run.i = run.ids.length - 1; nextStep(); }
  }
  function endTour(status){
    const st = load(); st.status = status; if (status === "done") st.step = STEPS.length; save(st);
    stop();
  }
  // Pick up the saved tour (after a practice, or when stepping in).
  function resumeSaved(){
    const st = load();
    if (st.status !== "active") return;
    if (st.step >= STEPS.length){ endTour("done"); return; }
    start(STEPS.map(s => s.id), st.step, false);
  }

  /* Minimise the coach card so it doesn't cover anything; glowing pauses until it's open again */
  function setMin(on){
    coach.classList.toggle("min", on);
    $("tutMin").setAttribute("aria-expanded", String(!on));
    $("tutMin").setAttribute("aria-label", on ? "Show the tutorial" : "Minimise the tutorial");
    $("tutMin").textContent = on ? "+" : "–";
    if (on) setGlow([]); else if (run) tick();
  }
  $("tutMin").addEventListener("click", e => { setMin(!coach.classList.contains("min")); e.currentTarget.blur(); });
  $("tutNext").addEventListener("click", e => { e.currentTarget.blur(); nextStep(); });
  $("tutSkipStep").addEventListener("click", e => { e.currentTarget.blur(); skipStep(); });
  $("tutSkipAll").addEventListener("click", e => {
    e.currentTarget.blur();
    if (run && run.practice){ stop(); resumeSaved(); } else askSkip();
  });

  /* ---------------- Welcome and "are you sure?" ---------------- */
  let confirmBack = null;   // where to return if they keep the tutorial
  function openModal(el, focusId){ el.hidden = false; keys.clear(); target = null; $(focusId).focus({preventScroll:true}); }
  function askSkip(){
    confirmBack = !$("tutWelcome").hidden ? "welcome" : "coach";
    $("tutWelcome").hidden = true;
    openModal($("tutConfirm"), "tutKeep");
  }
  $("tutStart").addEventListener("click", () => {
    $("tutWelcome").hidden = true;
    const st = load(); st.status = "active"; st.step = 0; st.done = []; save(st);
    start(STEPS.map(s => s.id), 0, false);
  });
  $("tutWelcomeSkip").addEventListener("click", askSkip);
  $("tutKeep").addEventListener("click", () => {
    $("tutConfirm").hidden = true;
    if (confirmBack === "welcome") openModal($("tutWelcome"), "tutStart");
    else document.activeElement.blur();
  });
  $("tutSkipYes").addEventListener("click", () => {
    $("tutConfirm").hidden = true;
    endTour("skipped");
    document.activeElement.blur();
    toast("Tutorial skipped. You can open it again from Tutorials in the top bar.");
  });

  // Offered when you step into the street: only once, or resumed if you left part-way through.
  $("btnEnter").addEventListener("click", () => {
    if (!entered) return;
    const st = load();
    if (st.status === "new") openModal($("tutWelcome"), "tutStart");
    else if (st.status === "active") resumeSaved();
  });

  // The wallet event fires on every purchase and payout.
  window.addEventListener("tiengrao:wallet", () => {
    if (!run) return;
    const w = walletBalance(), b = bagCount();
    if (w > run.wallet) run.earned = true;
    if (b > run.bag) run.bought = true;
    run.wallet = w; run.bag = b;
  });

  /* ---------------- Tutorials library ---------------- */
  const LIB = [
    {id:"walk", cat:"moving", title:"Walking around", pages:[
      {img:"walk-1", text:"Walk with <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or the arrow keys. You can also click or tap the ground, and you'll walk there."},
      {img:"walk-2", text:"Every call gets louder as you get closer and fades away as you leave. The <b>You can hear</b> list at the top left shows who is in earshot, loudest first."}]},
    {id:"ride", cat:"moving", title:"Riding the motorbike", pages:[
      {img:"ride-1", text:"Walk up to the motorbike and press <kbd>E</kbd>, or click it and choose <b>Ride the motorbike</b>."},
      {img:"ride-2", text:"Set your speed from 10 to 40 km/h with <kbd>Q</kbd> and <kbd>R</kbd>, the slider or the − and + buttons. Press <kbd>Esc</kbd> or <b>Get off</b> to step off. You can still talk to vendors while you ride."}]},
    {id:"talk", cat:"vendors", title:"Talking to vendors", pages:[
      {img:"talk-1", text:"Walk up to a vendor until the <kbd>E</kbd> tag appears, then press <kbd>E</kbd> or click them. Vendors on the move stop while you chat, and the rest of the street goes quiet."},
      {img:"talk-2", text:"Pick a reply with the mouse or the number keys, and press <b>Next</b>, <kbd>E</kbd> or <kbd>Space</kbd> to move on. Say <b>Goodbye</b> or press <kbd>Esc</kbd> to leave. Walk off in the middle of a story and they'll be a little sad."}]},
    {id:"money", cat:"money", title:"Earning money", pages:[
      {img:"money-1", text:"Get on the motorbike and press <b>Delivery runs</b> on the motorbike panel, or press <kbd>F</kbd>. <kbd>F</kbd> also works when you're standing next to the bike."},
      {img:"money-2", text:"Pick how busy the night is, then tap the houses on the map to plan a route that starts and ends at the stall. When the bike runs out of boxes, go back to the stall to reload. Press <b>Start delivery</b>: shorter routes use less fuel and earn tips, and your pay goes into the Wallet."}]},
    {id:"buy", cat:"vendors", title:"Buying food", pages:[
      {img:"buy-1", text:"Talk to a vendor and choose <b>What are you selling?</b> to open their shop."},
      {img:"buy-2", text:"Pick an item, choose how many with − and +, the slider or <b>Max</b>, then press <b>Buy</b>. Stock resets every night, and a vendor who sells out goes home early."}]},
    {id:"bag", cat:"money", title:"Your bag", pages:[
      {img:"bag-1", text:"Press <b>My bag</b> in the top bar to see everything you've bought, who sold it to you and how much you've spent. The number on the button counts your items."}]},
    {id:"build", cat:"street", title:"Building your street", pages:[
      {img:"build-1", text:"Press <b>Build</b> to add vendors and street sounds. New ones appear next to you. Drag anything to move it; the dashed circle shows how far its sound carries."},
      {img:"build-2", text:"Press <b>Copy share code</b> to share your street. A friend can paste the code into <b>Load</b> to walk the same street."}]},
    {id:"sound", cat:"street", title:"Captions and sound", pages:[
      {img:"sound-1", text:"Captions show each call in Vietnamese with an English translation as you hear it. Turn them off with <b>Captions on</b>, or silence the street with <b>Mute all</b>."}]}
  ];
  const CATS = {all:"All", moving:"Getting around", vendors:"Vendors", money:"Money", street:"Your street"};
  const lib = {cat:"all", id:"walk", page:0, back:null};

  function shown(){
    const q = $("tutSearch").value.trim().toLowerCase();
    return LIB.filter(t => (lib.cat === "all" || t.cat === lib.cat) &&
      (!q || t.title.toLowerCase().includes(q) || t.pages.some(p => p.text.replace(/<[^>]+>/g, "").toLowerCase().includes(q))));
  }
  function renderList(){
    const list = shown(), done = load().done;
    if (list.length && !list.some(t => t.id === lib.id)){ lib.id = list[0].id; lib.page = 0; }
    $("tutList").innerHTML = list.length ? list.map(t => `
      <li><button type="button" class="tut-item${t.id === lib.id ? " active" : ""}" data-id="${t.id}" aria-current="${t.id === lib.id}">
        <span>${t.title}</span>${done.includes(t.id) ? '<img class="tut-done" src="images/icons/check.png" alt="Done">' : ""}
      </button></li>`).join("") : `<li class="tut-none">No tutorials match.</li>`;
    $("tutDetail").hidden = !list.length;
    if (list.length) renderDetail();
  }
  function renderDetail(){
    const t = LIB.find(x => x.id === lib.id), pg = t.pages[lib.page], n = t.pages.length;
    const img = $("tutImg");
    img.parentNode.hidden = false;
    img.src = `images/tutorial/${pg.img}.png`;
    $("tutDTitle").textContent = t.title;
    $("tutDText").innerHTML = pg.text;
    $("tutDots").innerHTML = n > 1 ? t.pages.map((_, j) => `<li class="${j === lib.page ? "now" : ""}"></li>`).join("") : "";
    $("tutPageSr").textContent = `Page ${lib.page + 1} of ${n}`;
    $("tutPrev").disabled = lib.page === 0;
    $("tutNextPg").disabled = lib.page === n - 1;
    const guided = !!stepById(t.id);
    $("tutTry").hidden = !guided;
    $("tutTry").disabled = !entered;
    $("tutTryNote").textContent = guided && !entered ? "Step into the street first to practise." : "";
  }
  $("tutImg").addEventListener("error", e => { e.target.parentNode.hidden = true; $("tutDetail").classList.remove("has-shot"); });
  $("tutImg").addEventListener("load", () => $("tutDetail").classList.add("has-shot"));
  function openLib(id){
    lib.back = document.activeElement;
    if (id){ lib.id = id; lib.page = 0; lib.cat = "all"; }
    setCat(lib.cat);
    $("tutLib").hidden = false;
    keys.clear(); target = null;
    $("tutLibClose").focus({preventScroll:true});
  }
  function closeLib(){
    $("tutLib").hidden = true;
    if (lib.back && lib.back !== $("btnTutorials") && document.body.contains(lib.back)) lib.back.focus({preventScroll:true});
    else document.activeElement.blur();
  }
  function setCat(cat){
    lib.cat = cat;
    $("tutLibTitle").textContent = CATS[cat];
    $("tutTabs").querySelectorAll("[data-cat]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.cat === cat)));
    renderList();
  }
  $("btnTutorials").addEventListener("click", () => $("tutLib").hidden ? openLib() : closeLib());
  $("tutLibClose").addEventListener("click", closeLib);
  $("tutLib").addEventListener("click", e => { if (e.target === $("tutLib")) closeLib(); });
  $("tutTabs").addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) setCat(b.dataset.cat); });
  $("tutSearch").addEventListener("input", renderList);
  $("tutList").addEventListener("click", e => {
    const b = e.target.closest(".tut-item"); if (!b) return;
    lib.id = b.dataset.id; lib.page = 0; renderList();
  });
  $("tutPrev").addEventListener("click", () => { lib.page = Math.max(0, lib.page - 1); renderDetail(); });
  $("tutNextPg").addEventListener("click", () => { lib.page += 1; renderDetail(); });
  $("tutTry").addEventListener("click", () => {
    if (!entered) return;
    closeLib(); stop();
    start([lib.id], 0, true);
  });
  $("tutReplay").addEventListener("click", () => {
    closeLib();
    if (!entered){ const st = load(); st.status = "new"; save(st); toast("The tutorial will start when you step into the street."); return; }
    stop();
    const st = load(); st.status = "active"; st.step = 0; save(st);
    start(STEPS.map(s => s.id), 0, false);
  });

  // Keys for the tutorial windows (the street ignores keys while one is open)
  window.addEventListener("keydown", e => {
    if (!$("tutConfirm").hidden){ if (e.key === "Escape"){ e.preventDefault(); $("tutKeep").click(); } return; }
    if (!$("tutWelcome").hidden){ if (e.key === "Escape"){ e.preventDefault(); askSkip(); } return; }
    if ($("tutLib").hidden) return;
    if (e.key === "Escape"){ e.preventDefault(); closeLib(); return; }
    if (document.activeElement === $("tutSearch")) return;
    if (e.key === "ArrowLeft" && !$("tutPrev").disabled){ e.preventDefault(); $("tutPrev").click(); }
    if (e.key === "ArrowRight" && !$("tutNextPg").disabled){ e.preventDefault(); $("tutNextPg").click(); }
  });
})();
