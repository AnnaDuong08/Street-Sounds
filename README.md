# Tiếng Rao 

An interactive sound-map of Vietnam's street-vendor calls.

## Run it
Open `index.html` in a browser (Chrome, Edge, Firefox or Safari). An internet connection is
needed for Bootstrap 5, GSAP and Google Fonts, which load from CDNs.

## Files
- `index.html` – page structure (Bootstrap 5 navbar, offcanvas, accordion, forms, toast)
- `street.html` – Your street: the full version of Mix your street, walked with WASD
- `css/style.css` – custom styles and colour tokens
- `js/core.js` – shared by both pages: vendor data, Web Audio sound engine, captions, story panel
- `js/main.js` – home page: night walk, Hear the change, Mix your street preview, contribution form
- `js/street.js` – Your street: movement, distance-based hearing, vendor cards, build panel
- `js/talk-script.js` – what each vendor says: greeting, story, shop, chats, goodbyes
- `js/talk.js` – the conversation box that plays those scripts
- `js/shop.js` – the vendor shop pop-up: item cards, buy panel, wallet and nightly stock
- `js/delivery.js` – Delivery runs: the route-planning game played from the motorbike
- `ASSETS.md` – every image the site still needs, with file names and sizes
- `PLAYER-ART.md` – player walk animation in four directions and the girl version (frame templates in `docs/player-art/`)
- `images/` – vendor and street-sound artwork

## Technologies
HTML5, CSS3, Bootstrap 5.3.3, JavaScript, Web Audio API, HTML5 Canvas, localStorage, GSAP 3.12.5.

## Notes
All sounds are synthesised in the browser as placeholders; each call's melody follows the
Vietnamese tone marks of its words. The final version will use field recordings or credited
Creative Commons recordings. Saved mixes and submitted calls are stored only in the browser.
