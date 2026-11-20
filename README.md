# Tiếng Rao 

An interactive sound-map of Vietnam's street-vendor calls.

## Run it
Open `HomePage.html` in a browser (Chrome, Edge, Firefox or Safari). No server or install is needed:
Bootstrap and GSAP are included in `lib/`, and every link and image uses a relative path.
Google Fonts load from the web when online; offline, the pages fall back to system fonts.

## Pages
| Page | What it is |
|---|---|
| `HomePage.html` | Home: hero skyline, "Meet the vendors" carousel, a card for every page, About accordion |
| `NightWalk.html` | Scroll along a row of stalls; the nearest call is loudest and pans left or right; region filter and story panel |
| `HearTheChange.html` | Compare a live voice with a loudspeaker loop of the same call, with a live waveform |
| `MixYourStreet.html` | Drag-and-drop board of vendors and street sounds, with save and share codes |
| `YourStreet.html` | The walkable street game: talk to vendors, shop, ride the motorbike, delivery runs |
| `AddACall.html` | Validated form to send in a call from your city, and the list of calls sent |

## Code
- `css/style.css` – all custom styles and colour tokens
- `js/sounds.js` – the recordings from `sounds/`, embedded by `tools/embed_sounds.py`
- `js/core.js` – shared by every page: vendor data, Web Audio sound engine, captions, story panel, page helpers
- `js/home.js` – home page: skyline drawing, carousel buttons, entrance animation (GSAP)
- `js/walk.js` – Night walk
- `js/change.js` – Hear the change
- `js/mix.js` – Mix your street board
- `js/contribute.js` – Add a call form and list
- `js/street.js` – Your street: world, movement, hearing, roaming vendors, riding, build panel, bag, wallet
- `js/talk-script.js` – what each vendor says
- `js/talk.js` – the conversation box
- `js/shop.js` – the vendor shop, wallet and nightly stock
- `js/delivery.js` – Delivery runs route-planning game
- `js/tutorial.js` – the one-time guided tutorial on Your street (progress saved, resumable) and the Tutorials library; pictures in `images/tutorial/`
- `lib/bootstrap/` – Bootstrap 5.3.3 (CSS and JS bundle)
- `lib/gsap/` – GSAP 3.12.5
- `images/` – all artwork (vendors, portraits, food, player frames, icons, UI frames)

## Technologies
HTML5, CSS3, Bootstrap 5.3.3, JavaScript, Web Audio API, HTML5 Canvas, localStorage, GSAP 3.12.5.

## Notes
The six vendor calls are real recordings in `sounds/`. Browsers block loading audio files on
`file://` pages, so `tools/embed_sounds.py` packs them into `js/sounds.js`; run it again after adding
or replacing a file in `sounds/`. Any sound without a recording (currently the motorbike, rain,
temple bell and crickets) is synthesised in the browser instead. Saved mixes and submitted calls
are stored only in the browser.
