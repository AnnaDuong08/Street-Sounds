"use strict";
/* HomePage.html: hero skyline, the "meet the vendors" carousel and the links to every page. */
/* Hero skyline: tube houses and tangled power lines */
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

// Carousel buttons: hear a vendor's call, or open their story card
document.getElementById("vendorCarousel").addEventListener("click", e => {
  const b = e.target.closest("button[data-play], button[data-story]"); if (!b) return;
  const v = vendorById[b.dataset.play || b.dataset.story];
  if (b.dataset.play) playSolo(v, "live"); else openStory(v);
});

drawSkyline();
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
  gsap.from(".hero-anim", {y:18, duration:0.8, stagger:0.08, ease:"power2.out"});
}
