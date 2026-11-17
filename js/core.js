"use strict";
/* ---------------- Data ---------------- */
const VENDORS = [
  {id:"banhmi", dish:"Bánh mì", call:"Bánh mì nóng giòn đây!", en:"Hot, crispy bread rolls here!",
   regions:["N","C","S"], regionLabel:"Nationwide", time:"Evenings, about 6 pm to 11 pm", vehicle:"bike", vehicleLabel:"A bicycle with a front basket",
   color:"#d98b3a", pitch:150,
   story:"Evening bánh mì sellers ride bicycles with a basket of rolls kept warm under a cloth. The rolls are sold plain or split and filled with pâté, butter and pickles. The seller stretches the last word, đây (here), so it carries to the end of the alley.",
   listen:"The rising tones on bánh and nóng, then a long, level đây."},
  {id:"hotvitlon", dish:"Hột vịt lộn", call:"Hột vịt lộn đây!", en:"Balut eggs here!",
   regions:["S"], regionLabel:"The South", time:"Late evening into the night", vehicle:"pole", vehicleLabel:"A shoulder pole with two baskets",
   color:"#cbb98c", pitch:235,
   story:"Hột vịt lộn is a fertilised duck egg, boiled and eaten warm from the shell with Vietnamese coriander (rau răm), salt, pepper and lime. In the North the same snack is called trứng vịt lộn. Sellers wrap the eggs in cloth so they stay hot late into the night.",
   listen:"The heavy, clipped drops on hột and lộn."},
  {id:"che", dish:"Chè", call:"Ai ăn chè không?", en:"Who wants sweet soup?",
   regions:["C","S"], regionLabel:"Huế and the South", time:"Afternoon to late evening", vehicle:"cart", vehicleLabel:"A glass-sided push cart",
   color:"#6fae7c", pitch:262,
   story:"Chè is a family of sweet soups and puddings made with black beans, mung beans, taro, jelly or sticky rice, often finished with coconut milk and crushed ice. Huế is famous for dozens of kinds. Sellers push glass-sided carts so you can choose by eye.",
   listen:"It is a question. Ai (who) opens it, and không at the end turns it into an offer."},
  {id:"hutieugo", dish:"Hủ tiếu gõ", call:"Lốc cốc… lốc cốc…", en:"The knock of the noodle runners (no words)",
   regions:["S"], regionLabel:"Saigon", time:"Night, until the early hours", vehicle:"cart", vehicleLabel:"A noodle cart, with runners on foot",
   color:"#c8553d", pitch:0, clapper:true,
   story:"Hủ tiếu gõ is named after a sound, not a voice. Gõ means to knock. Runners walk ahead of the noodle cart knocking two pieces of bamboo or wood together, take orders from apartments and alleys, then carry the bowls back.",
   listen:"Dry wooden clicks in pairs, with a short roll at the end."},
  {id:"banhgio", dish:"Bánh giò", call:"Ai bánh giò nóng đây!", en:"Who wants hot rice dumplings?",
   regions:["N"], regionLabel:"Hà Nội", time:"Winter nights", vehicle:"pole", vehicleLabel:"A basket carried through the Old Quarter",
   color:"#86a95e", pitch:248,
   story:"Bánh giò is a pyramid-shaped rice dumpling wrapped in banana leaf, filled with minced pork and wood-ear mushroom. On cold nights in Hà Nội, sellers walk the Old Quarter with a steaming basket, and the call is one of the city's best-known night sounds.",
   listen:"Ai at the start pulls your attention, like calling out 'Who's for…?'"},
  {id:"banhbao", dish:"Bánh bao", call:"Bánh bao nóng hổi đây!", en:"Piping-hot steamed buns here!",
   regions:["N","C","S"], regionLabel:"Nationwide", time:"Evening and night", vehicle:"moto", vehicleLabel:"A motorbike with a steamer and a loudspeaker",
   color:"#e6d7bb", pitch:140,
   story:"Bánh bao are steamed buns filled with pork, egg and Chinese sausage. This is the call you are now most likely to hear as a recording, looped from a loudspeaker on a motorbike, so it shows most clearly how the street is changing.",
   listen:"The dipping tone on hổi (piping hot)."}
];
const AMBIENT = [
  {id:"moto", label:"Motorbikes", vi:"Xe máy", color:"#8fa3b3"},
  {id:"rain", label:"Rain", vi:"Mưa", color:"#55b3a3"},
  {id:"bell", label:"Temple bell", vi:"Chuông chùa", color:"#f5d06f"},
  {id:"crickets", label:"Crickets", vi:"Dế", color:"#9fc06a"}
];
const vendorById = Object.fromEntries(VENDORS.map(v => [v.id, v]));
const ambientById = Object.fromEntries(AMBIENT.map(a => [a.id, a]));

/* ---------------- Storage helpers ---------------- */
const store = {
  get(k, fallback){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }catch(e){ return fallback; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ return false; } }
};

/* ---------------- Tones ---------------- */
const TONES = {
  ngang:{name:"ngang", en:"level", pts:[5,5]},
  sac:{name:"sắc", en:"rising", pts:[4,10]},
  huyen:{name:"huyền", en:"falling", pts:[3,-1]},
  hoi:{name:"hỏi", en:"dipping", pts:[3,-1,4]},
  nga:{name:"ngã", en:"broken", pts:[5,2,11]},
  nang:{name:"nặng", en:"heavy", pts:[2,-4]}
};
function toneOf(syl){
  const s = syl.normalize("NFD");
  if (s.includes("́")) return "sac";
  if (s.includes("̀")) return "huyen";
  if (s.includes("̉")) return "hoi";
  if (s.includes("̃")) return "nga";
  if (s.includes("̣")) return "nang";
  return "ngang";
}
const FORMANTS = {a:[800,1250], e:[520,1850], i:[310,2300], o:[520,900], u:[330,850], y:[310,2300]};
function vowelOf(syl){
  const s = syl.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/đ/g,"d");
  const m = s.match(/[aeiouy]+/);
  if(!m) return "a";
  return m[0].includes("a") ? "a" : m[0][0];
}
function syllables(text){
  return text.replace(/[!?.,…]/g," ").split(/\s+/).filter(Boolean);
}
function tonesHtml(v){
  if (v.clapper) return '<span>No words: a wooden <b>clapper</b></span>';
  return syllables(v.call).map(s => { const t = TONES[toneOf(s)]; return `<span>${s} · <b>${t.name}</b> ${t.en}</span>`; }).join("");
}

/* ---------------- Audio engine ---------------- */
let ctx = null, master, analyser, noiseBuf, muted = false;
const onAudioReady = [];
function audio(){
  if (!ctx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 4;
    analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    master.connect(comp); comp.connect(analyser); analyser.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    onAudioReady.forEach(fn => fn());
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}
const hz = (base, st) => base * Math.pow(2, st / 12);

/* Sing a call. mode "live" = human voice with drift; "loud" = loudspeaker recording. Returns duration in seconds. */
function sing(v, dest, t0, mode){
  if (v.clapper) return clap(dest, t0);
  const live = mode !== "loud";
  const syls = syllables(v.call);
  const base = v.pitch;
  const osc = ctx.createOscillator(); osc.type = "sawtooth";
  const src = ctx.createGain(); src.gain.value = 1;
  osc.connect(src);
  if (live){
    const lfo = ctx.createOscillator(); lfo.frequency.value = 5.3;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = base * 0.017;
    lfo.connect(lfoAmt); lfoAmt.connect(osc.frequency);
    lfo.start(t0); lfo.stop(t0 + 6);
    const breath = ctx.createBufferSource(); breath.buffer = noiseBuf; breath.loop = true;
    const bg = ctx.createGain(); bg.gain.value = 0.06;
    breath.connect(bg); bg.connect(src);
    breath.start(t0, Math.random()); breath.stop(t0 + 6);
  }
  const f1 = ctx.createBiquadFilter(); f1.type = "bandpass"; f1.Q.value = 6;
  const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 9;
  const body = ctx.createBiquadFilter(); body.type = "lowpass"; body.frequency.value = 900;
  const g2 = ctx.createGain(); g2.gain.value = 0.55;
  const gb = ctx.createGain(); gb.gain.value = 0.18;
  const env = ctx.createGain(); env.gain.value = 0;
  src.connect(f1); src.connect(f2); src.connect(body);
  f1.connect(env); f2.connect(g2); g2.connect(env); body.connect(gb); gb.connect(env);

  let out = env;
  if (!live){
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 650;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3200;
    const sh = ctx.createWaveShaper(); const k = 30, n = 1024, curve = new Float32Array(n);
    for (let i = 0; i < n; i++){ const x = i * 2 / n - 1; curve[i] = (1 + k) * x / (1 + k * Math.abs(x)); }
    sh.curve = curve;
    const lvl = ctx.createGain(); lvl.gain.value = 0.45;
    env.connect(hp); hp.connect(sh); sh.connect(lp); lp.connect(lvl);
    const dl = ctx.createDelay(); dl.delayTime.value = 0.13;
    const fb = ctx.createGain(); fb.gain.value = 0.28;
    lvl.connect(dl); dl.connect(fb); fb.connect(dl); fb.connect(dest);
    out = lvl;
  }
  out.connect(dest);

  const speed = live ? 1 : 0.82;
  const peak = live ? 0.9 : 1;
  let t = t0;
  osc.frequency.setValueAtTime(hz(base, TONES[toneOf(syls[0])].pts[0]), t0);
  syls.forEach((s, i) => {
    const last = i === syls.length - 1;
    const tone = toneOf(s);
    let d = (last ? 0.9 : 0.27) * speed * (tone === "nang" && !last ? 0.7 : 1);
    if (live) d *= 0.92 + Math.random() * 0.16;
    const jit = live ? (Math.random() - 0.5) * 0.6 : 0;
    const pts = TONES[tone].pts.slice();
    if (last && live) pts.push(pts[pts.length - 1] - 2.5);
    const step = (last ? d * 0.75 : d) / (pts.length - 1 || 1);
    const glide = live ? 0.035 : 0.004;
    osc.frequency.setTargetAtTime(hz(base, pts[0] + jit), t, glide);
    pts.forEach((p, j) => { if (j > 0) osc.frequency.linearRampToValueAtTime(hz(base, p + jit), t + step * j); });
    const [F1, F2] = FORMANTS[vowelOf(s)];
    f1.frequency.setTargetAtTime(F1, t, 0.02);
    f2.frequency.setTargetAtTime(F2, t, 0.02);
    env.gain.setTargetAtTime(peak, t, 0.018);
    env.gain.setTargetAtTime(0.0001, t + d - 0.05, last ? 0.08 : 0.018);
    t += d + (live ? 0.05 : 0.035);
  });
  osc.start(t0); osc.stop(t + 0.5);
  return t - t0;
}
function clap(dest, t0){
  const hits = [0, 0.17, 0.55, 0.72, 1.1, 1.22, 1.34, 1.46];
  hits.forEach((h, i) => {
    const t = t0 + h;
    const n = ctx.createBufferSource(); n.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1700 + (i % 2) * 250; bp.Q.value = 5;
    const g = ctx.createGain(); g.gain.setValueAtTime(1.4, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    n.connect(bp); bp.connect(g); g.connect(dest); n.start(t, Math.random()); n.stop(t + 0.08);
    const o = ctx.createOscillator(); o.frequency.value = 780 + (i % 2) * 140;
    const og = ctx.createGain(); og.gain.setValueAtTime(0.5, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    o.connect(og); og.connect(dest); o.start(t); o.stop(t + 0.07);
  });
  return 1.6;
}
function bell(dest, t0){
  [[1,0.5,7],[2.76,0.22,4],[5.4,0.12,2.5],[8.9,0.06,1.5]].forEach(([r, a, dec]) => {
    const o = ctx.createOscillator(); o.frequency.value = 196 * r;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t0 + dec);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dec + 0.1);
  });
  return 7;
}
function chirp(dest, t0){
  for (let i = 0; i < 3; i++){
    const t = t0 + i * 0.07;
    const o = ctx.createOscillator(); o.frequency.value = 4400 + Math.random() * 300;
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.01); g.gain.linearRampToValueAtTime(0, t + 0.045);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.06);
  }
  return 0.25;
}

/* A bus: input -> lowpass (distance) -> gain -> pan -> master */
function makeBus(){
  const input = ctx.createGain();
  const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 18000;
  const gain = ctx.createGain(); gain.gain.value = 0;
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  input.connect(lp); lp.connect(gain);
  if (pan){ gain.connect(pan); pan.connect(master); } else gain.connect(master);
  return {input, lp, gain, pan,
    set(g, p, cutoff){ const t = ctx.currentTime; gain.gain.setTargetAtTime(g, t, 0.08); if (pan) pan.pan.setTargetAtTime(p, t, 0.08); lp.frequency.setTargetAtTime(cutoff, t, 0.08); },
    close(){ const t = ctx.currentTime; gain.gain.setTargetAtTime(0, t, 0.1); setTimeout(() => { try{ input.disconnect(); gain.disconnect(); if (pan) pan.disconnect(); }catch(e){} }, 800); }
  };
}

/* Start a looping vendor call or street sound into dest. onCall(v) runs each time a vendor sings. */
function startSound(type, dest, onCall){
  const node = {on:true, timer:null, stops:[]};
  const every = (fn, gapMin, gapMax, first) => {
    const loop = () => { if (!node.on) return; const d = fn(); node.timer = setTimeout(loop, (d + gapMin + Math.random() * (gapMax - gapMin)) * 1000); };
    node.timer = setTimeout(loop, first * 1000);
  };
  const v = vendorById[type];
  if (v){
    every(() => { const d = sing(v, dest, ctx.currentTime + 0.05, v.id === "banhbao" ? "loud" : "live"); if (onCall) onCall(v); return d; }, 3, 7, Math.random() * 2.5);
  } else if (type === "bell"){
    every(() => bell(dest, ctx.currentTime + 0.05), 2, 5, 0.5 + Math.random() * 2);
  } else if (type === "crickets"){
    every(() => chirp(dest, ctx.currentTime + 0.02), 0.45, 0.9, Math.random());
  } else if (type === "rain"){
    const n = ctx.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 7000;
    const g = ctx.createGain(); g.gain.value = 0.28;
    n.connect(hp); hp.connect(lp); lp.connect(g); g.connect(dest); n.start();
    node.stops.push(() => n.stop());
  } else if (type === "moto"){
    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 62;
    const o2 = ctx.createOscillator(); o2.type = "sawtooth"; o2.frequency.value = 93;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 420;
    const g = ctx.createGain(); g.gain.value = 0.18;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.12;
    const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 0.15;
    lfo.connect(lfoAmt); lfoAmt.connect(g.gain);
    const plfo = ctx.createOscillator(); plfo.frequency.value = 0.12;
    const pAmt = ctx.createGain(); pAmt.gain.value = 18;
    plfo.connect(pAmt); pAmt.connect(o1.frequency); pAmt.connect(o2.frequency);
    o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(dest);
    [o1, o2, lfo, plfo].forEach(o => o.start());
    node.stops.push(() => [o1, o2, lfo, plfo].forEach(o => o.stop()));
  }
  node.stop = () => {
    node.on = false; clearTimeout(node.timer);
    setTimeout(() => node.stops.forEach(s => { try{ s(); }catch(e){} }), 700);
  };
  return node;
}

/* ---------------- Captions ---------------- */
let captionsOn = true, capTimer = null;
function caption(v){
  if (!captionsOn) return;
  document.getElementById("capVi").textContent = v.call;
  document.getElementById("capEn").textContent = v.en + " · " + v.dish;
  const bar = document.getElementById("captionBar");
  bar.classList.add("show");
  clearTimeout(capTimer);
  capTimer = setTimeout(() => bar.classList.remove("show"), 4500);
}

/* Solo playback (stall buttons, story panel, hear the change) */
function playSolo(v, mode){
  if (!audio()) return 0;
  const g = ctx.createGain(); g.gain.value = 1; g.connect(master);
  const d = sing(v, g, ctx.currentTime + 0.05, mode);
  if (mode === "loud"){ sing(v, g, ctx.currentTime + 0.05 + d + 0.35, "loud"); }
  caption(v);
  return d;
}

/* ---------------- Mixes: shared by the preview board and the full street ---------------- */
const MIX_KEY = "tiengrao.mix";
// The top of the street is rooftops. Vendors, motorbikes (and the player on Your street) stay on the road and pavement below it;
// the temple bell, crickets and rain can go up on the roofs.
const ROOF_LINE = 24;   // % from the top where the road begins
const minY = type => vendorById[type] || type === "moto" ? ROOF_LINE : 5;
const EXAMPLE_MIX = [
  {type:"banhgio", x:28, y:76}, {type:"hutieugo", x:74, y:50}, {type:"moto", x:18, y:40},
  {type:"bell", x:84, y:12}, {type:"crickets", x:44, y:14}
];
function tokenInfo(type){
  const v = vendorById[type]; if (v) return {label:v.dish, color:v.color, icon:`images/vendors/${v.id}.png`};
  const a = ambientById[type]; return {label:a.label, color:a.color, icon:`images/ambient/${a.id}.png`};
}
function encodeMix(items){
  const json = JSON.stringify(items.map(t => [t.type, Math.round(t.x), Math.round(t.y)]));
  return "TR1-" + btoa(unescape(encodeURIComponent(json)));
}
function decodeMix(code, max){
  const raw = code.trim().replace(/^#?TR1-/, "");
  const arr = JSON.parse(decodeURIComponent(escape(atob(raw))));
  if (!Array.isArray(arr)) throw new Error("bad");
  return arr.filter(a => vendorById[a[0]] || ambientById[a[0]]).slice(0, max).map(a => ({type:a[0], x:+a[1], y:+a[2]}));
}

/* ---------------- Illustrations ---------------- */
function figure(x){
  return `<g><path d="M${x-19} 47 L${x} 29 L${x+19} 47 Z" fill="#e8d9b0"/><circle cx="${x}" cy="52" r="7" fill="#d7b48a"/>
  <path d="M${x-11} 61 L${x+11} 61 L${x+14} 102 L${x-14} 102 Z" fill="#3b5a73"/><path class="ink" d="M${x-6} 102 L${x-7} 136 M${x+6} 102 L${x+8} 136"/></g>`;
}
function lantern(x, y){
  return `<circle cx="${x}" cy="${y}" r="16" fill="#f5a043" opacity=".18"/><circle cx="${x}" cy="${y}" r="6" fill="#f5a043"/>`;
}
function art(v){
  return `<img class="vendor-img" src="images/vendors/${v.id}.png" data-id="${v.id}" alt="Illustration of the ${v.dish} seller">`;
}
// Falls back to the drawn illustration if a vendor image fails to load.
document.addEventListener("error", e => {
  const img = e.target;
  if (img.classList && img.classList.contains("vendor-img")) img.outerHTML = drawnArt(vendorById[img.dataset.id]);
}, true);
function drawnArt(v){
  const c = v.color;
  let g = "";
  if (v.vehicle === "bike"){
    g = `${figure(62)}<circle class="ink" cx="112" cy="116" r="20"/><circle class="ink" cx="188" cy="116" r="20"/>
    <path class="ink" d="M112 116 L140 88 L188 116 M140 88 L176 88 L188 116 M140 88 L134 76 M126 76 L142 76 M176 88 L172 70 M166 70 L182 70"/>
    <rect x="166" y="72" width="42" height="22" rx="3" fill="${c}"/>
    <rect x="170" y="62" width="9" height="16" rx="4" fill="#f0c890"/><rect x="183" y="58" width="9" height="20" rx="4" fill="#f0c890"/><rect x="196" y="63" width="8" height="15" rx="4" fill="#f0c890"/>
    ${lantern(150,56)}<path class="ink-thin" d="M150 50 L150 40"/>`;
  } else if (v.vehicle === "cart"){
    g = `${figure(36)}<path class="ink" d="M78 92 L54 98"/><rect x="78" y="80" width="122" height="40" rx="3" fill="${c}"/>
    <rect x="86" y="52" width="106" height="28" fill="#f1e7d0" fill-opacity=".14" stroke="#f1e7d0" stroke-opacity=".6"/>
    <circle cx="104" cy="66" r="8" fill="#f1e7d0" fill-opacity=".5"/><circle cx="126" cy="66" r="8" fill="#7d4a2e"/><circle cx="148" cy="66" r="8" fill="#f1e7d0" fill-opacity=".35"/><circle cx="170" cy="66" r="8" fill="#5b7f3e"/>
    <path d="M80 36 h120 v10 h-120 Z" fill="#f1e7d0"/><path d="M80 36 h20 v10 h-20 Z M120 36 h20 v10 h-20 Z M160 36 h20 v10 h-20 Z" fill="${c}"/>
    <path class="ink-thin" d="M82 46 L82 80 M198 46 L198 80"/><circle class="ink" cx="100" cy="126" r="11"/><circle class="ink" cx="178" cy="126" r="11"/>
    ${lantern(140,24)}`;
  } else if (v.vehicle === "pole"){
    g = `${figure(110)}<path class="ink" d="M24 62 L196 62"/>
    <path class="ink-thin" d="M30 62 L22 100 M30 62 L48 100 M190 62 L172 100 M190 62 L198 100"/>
    <path d="M16 100 L54 100 L48 126 L22 126 Z" fill="${c}"/><path d="M166 100 L204 100 L198 126 L172 126 Z" fill="${c}"/>
    <path class="ink-thin" d="M178 94 q4 -8 0 -16 q-4 -8 0 -16 M192 94 q4 -8 0 -16 q-4 -8 0 -16"/>
    ${lantern(36,92)}`;
  } else {
    g = `<circle class="ink" cx="86" cy="118" r="18"/><circle class="ink" cx="182" cy="118" r="18"/>
    <path d="M86 118 L112 96 L166 96 L182 118 Z" fill="#3b5a73"/><path class="ink" d="M166 96 L158 66 M150 66 L166 64"/>
    <rect x="56" y="62" width="52" height="36" rx="4" fill="${c}"/><path class="ink-thin" d="M66 56 q4 -7 0 -14 M82 56 q4 -7 0 -14 M98 56 q4 -7 0 -14"/>
    <path d="M128 70 h22 l4 28 h-30 Z" fill="#3b5a73"/><circle cx="139" cy="60" r="7" fill="#d7b48a"/><path d="M120 56 L139 39 L158 56 Z" fill="#e8d9b0"/>
    <path class="ink-thin" d="M44 98 L44 40"/><path d="M44 40 L22 30 L22 50 Z" fill="#a9b7c1"/>
    <path class="ink-thin" d="M16 32 q-6 8 0 16 M10 26 q-10 14 0 28"/>`;
  }
  return `<svg viewBox="0 0 220 150" role="img" aria-label="Illustration of the ${v.dish} seller"><path d="M0 138 H220" stroke="#f1e7d0" stroke-opacity=".2" stroke-width="2"/>${g}</svg>`;
}

/* ---------------- Story panel ---------------- */
let storyVendor = null;
function openStory(v){
  storyVendor = v;
  document.getElementById("storyRegion").textContent = v.regionLabel;
  document.getElementById("storyTitle").textContent = v.dish;
  document.getElementById("storyArt").innerHTML = art(v);
  document.getElementById("storyCall").textContent = v.call;
  document.getElementById("storyEn").textContent = v.en;
  document.getElementById("storyText").textContent = v.story;
  document.getElementById("storyTime").textContent = v.time;
  document.getElementById("storyVehicle").textContent = v.vehicleLabel;
  document.getElementById("storyListen").textContent = v.listen;
  document.getElementById("storyTones").innerHTML = tonesHtml(v);
  bootstrap.Offcanvas.getOrCreateInstance(document.getElementById("storyPanel")).show();
}
document.getElementById("storyPlay").addEventListener("click", () => storyVendor && playSolo(storyVendor, "live"));

/* ---------------- Global controls ---------------- */
document.getElementById("btnMute").addEventListener("click", e => {
  muted = !muted;
  if (master) master.gain.setTargetAtTime(muted ? 0 : 0.9, ctx.currentTime, 0.05);
  e.currentTarget.textContent = muted ? "Unmute" : "Mute all";
  e.currentTarget.setAttribute("aria-pressed", String(muted));
});
document.getElementById("btnCaptions").addEventListener("click", e => {
  captionsOn = !captionsOn;
  if (!captionsOn) document.getElementById("captionBar").classList.remove("show");
  e.currentTarget.textContent = captionsOn ? "Captions on" : "Captions off";
  e.currentTarget.setAttribute("aria-pressed", String(captionsOn));
});
