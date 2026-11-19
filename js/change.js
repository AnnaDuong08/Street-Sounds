"use strict";
/* HearTheChange.html: the same call as a live voice and as a loudspeaker loop, with a live waveform. */
const sel = document.getElementById("changeVendor");
sel.innerHTML = VENDORS.filter(v => !v.clapper).map(v => `<option value="${v.id}">${v.dish}: ${v.call}</option>`).join("");
sel.value = "banhbao";
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
