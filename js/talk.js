"use strict";
/* The conversation box on Your street. Lines come from TALK in talk-script.js.
   Portraits load from images/portraits/<vendor>-<mood>.png and shop pictures from images/shop/<item>.png;
   until those files exist, a labelled placeholder shows instead. */
// Wrapped so its helper names (say, menu, shop…) don't clash with street.js; only three functions are shared.
const {openTalk, talkIsOpen, talkKey} = (() => {
  const ICONS = {
    learn:'<path d="M4 5h5a3 3 0 0 1 3 3v11a2 2 0 0 0-2-2H4zM20 5h-5a3 3 0 0 0-3 3v11a2 2 0 0 1 2-2h6z"/>',
    shop:'<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
    chat:'<path d="M4 5h16v11H10l-5 4v-4H4z"/>',
    leave:'<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>',
    back:'<path d="M15 6l-6 6 6 6"/>'
  };
  const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`;
  const price = n => n.toLocaleString("en-US") + " ₫";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tk = {
    box:document.getElementById("talk"),
    text:document.getElementById("talkText"),
    sr:document.getElementById("talkSr"),
    next:document.getElementById("talkNext"),
    bye:document.getElementById("talkBye"),
    choices:document.getElementById("talkChoices"),
    frame:document.getElementById("talkFrame"),
    img:document.getElementById("talkPortrait"),
    ph:document.getElementById("talkPh"),
    name:document.getElementById("talkName"),
    role:document.getElementById("talkRole")
  };
  const conv = {open:false, id:null, s:null, queue:[], then:null, full:"", typer:null, phase:"", bought:false, asked:new Set(), onClose:null};

  function parseLine(raw){
    const m = raw.match(/^\[(happy|sad)\]\s*/);
    const text = (m ? raw.slice(m[0].length) : raw).replace(/\{you\}/g, store.get("tiengrao.you", "friend"));
    return {mood:m ? m[1] : "neutral", text};
  }
  function setMood(mood){
    const file = `${conv.id}-${mood}.png`;
    tk.ph.textContent = file;
    tk.frame.dataset.mood = mood;
    tk.img.src = "images/portraits/" + file;
  }
  tk.img.addEventListener("load", () => tk.frame.classList.remove("missing"));
  tk.img.addEventListener("error", () => tk.frame.classList.add("missing"));

  /* Typewriter: Next finishes the line first, then moves on */
  function showLine(raw){
    const {mood, text} = parseLine(raw);
    setMood(mood);
    conv.full = text; tk.sr.textContent = text;
    clearInterval(conv.typer);
    if (reduceMotion){ tk.text.textContent = text; conv.typer = null; }
    else {
      let i = 0; tk.text.textContent = "";
      conv.typer = setInterval(() => {
        i += 1; tk.text.textContent = text.slice(0, i);
        if (i >= text.length){ clearInterval(conv.typer); conv.typer = null; }
      }, 22);
    }
    tk.next.textContent = conv.phase === "farewell" ? "Close" : "Next ▸";
    tk.next.hidden = false; tk.choices.hidden = true;
    tk.next.focus({preventScroll:true});
  }
  function say(lines, then){
    conv.phase = "lines"; conv.queue = lines.slice(); conv.then = then;
    showLine(conv.queue.shift());
  }
  function advance(){
    if (conv.typer){ clearInterval(conv.typer); conv.typer = null; tk.text.textContent = conv.full; return; }
    if (conv.phase === "farewell"){ closeTalk(); return; }
    if (conv.queue.length) showLine(conv.queue.shift());
    else if (conv.then) conv.then();
  }
  // The vendor is "still talking" while a line is typing or more lines are waiting.
  const stillTalking = () => conv.phase === "lines" && (!!conv.typer || conv.queue.length > 0);

  /* Reply options, like a list of things the player can say */
  function choices(list){
    conv.phase = "choices";
    tk.next.hidden = true;
    tk.choices.innerHTML = list.map((c, i) => `
      <button class="talk-choice${c.done ? " done" : ""}" type="button" data-i="${i}">
        ${c.img ? `<span class="item-img"><img src="${c.img}" alt=""><span class="ph">${c.imgLabel}</span></span>` : `<span class="ico">${icon(c.icon)}</span>`}
        <span class="txt">${c.label}${c.sub ? `<small>${c.sub}</small>` : ""}</span>
        ${c.price ? `<span class="price">${c.price}</span>` : ""}
        <kbd>${i + 1}</kbd>
      </button>`).join("");
    tk.choices.querySelectorAll(".item-img img").forEach(img => img.addEventListener("error", () => img.parentNode.classList.add("missing")));
    tk.choices.onclick = e => { const b = e.target.closest(".talk-choice"); if (b) list[+b.dataset.i].go(); };
    tk.choices.hidden = false;
    tk.choices.querySelector("button").focus({preventScroll:true});
  }
  function menu(){
    const s = conv.s, v = vendorById[conv.id];
    choices([
      {icon:"learn", label:`Tell me about ${v.dish}.`, done:conv.asked.has("learn"), go:() => { conv.asked.add("learn"); say(s.learn, menu); }},
      {icon:"shop", label:"What are you selling?", go:() => say([s.shop.intro], shop)},
      ...s.chats.map((c, i) => ({icon:"chat", label:c.ask, done:conv.asked.has(i), go:() => { conv.asked.add(i); say(c.reply, menu); }})),
      {icon:"leave", label:"I should get going.", go:farewell}
    ]);
  }
  function shop(){
    choices([
      ...conv.s.shop.items.map(it => ({img:`images/shop/${it.id}.png`, imgLabel:it.id, label:it.name, sub:it.en, price:price(it.price),
        go:() => { conv.bought = true; say(conv.s.shop.thanks, menu); }})),
      {icon:"back", label:"Never mind.", go:menu}
    ]);
  }
  function farewell(){
    const mood = conv.bought ? "happy" : stillTalking() ? "sad" : "calm";
    conv.queue = []; conv.then = null;
    conv.phase = "farewell";
    tk.bye.hidden = true;
    showLine(conv.s.bye[mood]);
  }

  function openTalk(id, onClose){
    const s = TALK[id]; if (!s) return false;
    Object.assign(conv, {open:true, id, s, bought:false, asked:new Set(), onClose});
    tk.name.textContent = s.name;
    tk.role.textContent = s.role;
    tk.bye.hidden = false;
    tk.box.hidden = false;
    say(s.greet, menu);
    return true;
  }
  function closeTalk(){
    if (!conv.open) return;
    clearInterval(conv.typer); conv.typer = null;
    conv.open = false; tk.box.hidden = true;
    const cb = conv.onClose; conv.onClose = null;
    if (cb) cb();
  }
  const talkIsOpen = () => conv.open;
  // Keys while talking: E or Space moves on, number keys pick a reply, Escape says goodbye.
  function talkKey(e){
    const k = e.key.toLowerCase();
    if (k === "escape"){ e.preventDefault(); conv.phase === "farewell" ? closeTalk() : farewell(); return; }
    if (k === "e" && !tk.next.hidden){ e.preventDefault(); advance(); return; }
    if (/^[1-9]$/.test(k) && conv.phase === "choices"){
      const b = tk.choices.querySelectorAll(".talk-choice")[+k - 1];
      if (b){ e.preventDefault(); b.click(); }
    }
  }
  tk.next.addEventListener("click", advance);
  tk.bye.addEventListener("click", farewell);
  document.getElementById("talkStory").addEventListener("click", () => openStory(vendorById[conv.id]));

  return {openTalk, talkIsOpen, talkKey};
})();
