"use strict";
/* AddACall.html: a validated form for sending in a call, and the list of calls sent from this device. */
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
  const sub = {city:document.getElementById("cityInput").value.trim(), dish:document.getElementById("dishInput").value.trim(), call:document.getElementById("callInput").value.trim(), en:document.getElementById("translationInput").value.trim(), file:f ? f.name : ""};
  const subs = store.get("tiengrao.subs", []); subs.push(sub); store.set("tiengrao.subs", subs);
  form.reset(); form.classList.remove("was-validated");
  renderSubs();
  toast(`Thanks. Your call from ${sub.city} has been added to the list.`);
});
form.addEventListener("reset", () => form.classList.remove("was-validated"));

renderSubs();
