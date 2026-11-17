"use strict";
/* The vendor's shop: a pop-up of item cards, and a buy panel to choose how many.
   Your wallet and each vendor's stock are saved on this device and reset at midnight.
   Item pictures load from images/shop/<item id>.png; until they exist a labelled placeholder shows. */
const {openShop, shopIsOpen, shopKey} = (() => {
  const SHOP_KEY = "tiengrao.shop";
  const START_WALLET = 200000;   // đồng you start each night with
  const $ = id => document.getElementById(id);
  const money = n => n.toLocaleString("en-US") + " ₫";

  const el = {
    shop:$("shop"), title:$("shopTitle"), role:$("shopRole"), wallet:$("shopWallet"), grid:$("shopGrid"), foot:$("shopFoot"), close:$("shopClose"),
    buy:$("buy"), art:$("buyArt"), img:$("buyImg"), ph:$("buyPh"), stock:$("buyStock"), name:$("buyName"), restock:$("buyRestock"),
    desc:$("buyDesc"), note:$("buyNote"), qty:$("buyQty"), range:$("buyRange"), max:$("buyMax"), total:$("buyTotal"), warn:$("buyWarn"),
    minus:$("buyMinus"), plus:$("buyPlus"), all:$("buyAll"), cancel:$("buyCancel"), confirm:$("buyConfirm")
  };
  const state = {open:false, id:null, items:[], item:null, boughtAny:false, onDone:null};

  // One record per night: {date, wallet, sold:{itemId: count}}
  function ledger(){
    const today = new Date().toDateString();
    const l = store.get(SHOP_KEY, null);
    return l && l.date === today ? l : {date:today, wallet:START_WALLET, sold:{}};
  }
  const left = (l, it) => it.stock - (l.sold[it.id] || 0);
  function restockIn(){
    const now = new Date(), midnight = new Date(now); midnight.setHours(24, 0, 0, 0);
    const mins = Math.ceil((midnight - now) / 60000);
    return `Restocks in ${Math.floor(mins / 60)}h ${mins % 60}m`;
  }
  // Picture with a placeholder that names the file to add
  const pic = (it, cls) => `<span class="item-img ${cls}"><img src="images/shop/${it.id}.png" alt=""><span class="ph">${it.id}.png</span></span>`;
  const watchPics = root => root.querySelectorAll(".item-img img").forEach(img => {
    img.addEventListener("error", () => img.parentNode.classList.add("missing"));
    img.addEventListener("load", () => img.parentNode.classList.remove("missing"));
  });

  /* ---------- Shop cards ---------- */
  function render(){
    const l = ledger();
    el.wallet.textContent = money(l.wallet);
    el.grid.innerHTML = state.items.map((it, i) => {
      const n = left(l, it);
      return `<button class="ware${n ? "" : " sold-out"}" type="button" data-i="${i}" ${n ? "" : "disabled"}
          aria-label="${it.name}, ${money(it.price)}, ${n} of ${it.stock} left">
        <span class="ware-stock">Left ${n}/${it.stock}</span>
        ${pic(it, "")}
        <span class="ware-name">${it.name}</span>
        <span class="ware-sub">${it.en}</span>
        <span class="ware-price">${money(it.price)}</span>
      </button>`;
    }).join("");
    watchPics(el.grid);
    el.foot.textContent = `${restockIn()} · Prices in Vietnamese đồng`;
  }
  function openShop(id, onDone){
    const s = TALK[id], v = vendorById[id];
    Object.assign(state, {open:true, id, items:s.shop.items, boughtAny:false, onDone});
    el.title.textContent = s.name;
    el.role.textContent = `Shop · ${s.role}`;
    el.shop.style.setProperty("--vc", v.color);
    el.buy.hidden = true;
    render();
    el.shop.hidden = false;
    (el.grid.querySelector(".ware:not([disabled])") || el.close).focus({preventScroll:true});
  }
  function closeShop(){
    if (!state.open) return;
    state.open = false; el.shop.hidden = true;
    const cb = state.onDone; state.onDone = null;
    if (cb) cb(state.boughtAny);
  }
  el.grid.addEventListener("click", e => { const b = e.target.closest(".ware"); if (b && !b.disabled) openBuy(state.items[+b.dataset.i]); });
  el.close.addEventListener("click", closeShop);

  /* ---------- Buy panel ---------- */
  function maxQty(l, it){ return Math.max(0, Math.min(left(l, it), Math.floor(l.wallet / it.price))); }
  function openBuy(it){
    state.item = it;
    const l = ledger(), n = left(l, it), top = maxQty(l, it);
    el.art.innerHTML = pic(it, "big"); watchPics(el.art);
    el.stock.textContent = `Left ${n}/${it.stock}`;
    el.name.textContent = it.name;
    el.restock.textContent = restockIn();
    el.desc.textContent = it.desc;
    el.note.textContent = `“${it.note}”`;
    el.range.max = Math.max(1, top);
    el.range.value = 1;
    el.range.disabled = top < 2;
    el.max.textContent = Math.max(1, top);
    el.buy.hidden = false;
    setQty(1);
    (top ? el.confirm : el.cancel).focus({preventScroll:true});
  }
  function setQty(q){
    const it = state.item, l = ledger(), top = maxQty(l, it);
    q = Math.max(1, Math.min(Math.max(1, top), q));
    el.range.value = q;
    el.range.style.setProperty("--fill", top > 1 ? `${(q - 1) / (top - 1) * 100}%` : "0%");
    el.qty.textContent = q;
    el.total.textContent = money(q * it.price);
    el.minus.disabled = q <= 1;
    el.plus.disabled = el.all.disabled = q >= top;
    const broke = l.wallet < it.price;
    el.warn.textContent = broke ? "You don't have enough money for this tonight." : "";
    el.confirm.disabled = broke;
  }
  function closeBuy(){
    el.buy.hidden = true;
    const card = state.item && el.grid.querySelector(`.ware[data-i="${state.items.indexOf(state.item)}"]`);
    (card && !card.disabled ? card : el.close).focus({preventScroll:true});
  }
  function confirmBuy(){
    const it = state.item, l = ledger(), q = +el.range.value;
    if (q < 1 || q > maxQty(l, it)) return;
    l.wallet -= q * it.price;
    l.sold[it.id] = (l.sold[it.id] || 0) + q;
    store.set(SHOP_KEY, l);
    state.boughtAny = true;
    el.buy.hidden = true;
    render();
    el.foot.textContent = `Bought ${q} × ${it.name} for ${money(q * it.price)}.`;
    const card = el.grid.querySelector(`.ware[data-i="${state.items.indexOf(it)}"]`);
    (card && !card.disabled ? card : el.close).focus({preventScroll:true});
  }
  el.range.addEventListener("input", () => setQty(+el.range.value));
  el.minus.addEventListener("click", () => setQty(+el.range.value - 1));
  el.plus.addEventListener("click", () => setQty(+el.range.value + 1));
  el.all.addEventListener("click", () => setQty(Infinity));
  el.cancel.addEventListener("click", closeBuy);
  el.confirm.addEventListener("click", confirmBuy);

  const shopIsOpen = () => state.open;
  // Escape steps back: buy panel → shop → conversation. Other keys work as normal on the focused button.
  function shopKey(e){
    if (e.key !== "Escape") return;
    e.preventDefault();
    el.buy.hidden ? closeShop() : closeBuy();
  }
  return {openShop, shopIsOpen, shopKey};
})();
