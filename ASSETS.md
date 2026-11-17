# Tiếng Rao: art guide and asset list

Everything you need to redraw the site from scratch in pixel art, without changing the concept:
each vendor keeps the same stall, vehicle, food and story.

- **Part 1:** the rules every image follows (pixel size, outlines, colours, light, shading).
- **Part 2:** a design sheet for every character, with their three emotions.
- **Part 3:** the master checklist of every image, with file names and sizes.

Drop each finished file into the project with **exactly** the file name shown and reload. Things marked
**"swap in"** work straight away. Things marked **"needs wiring"** are drawn by code right now; send them over
and they get hooked up (backgrounds and UI skins).

---

## Status after the first art drop (17 Nov 2026)

**Installed and live:**
- every street sprite, portrait, shop item and mini icon;
- the delivery stall, house and scooter;
- favicon, share image and the "You" marker;
- all 17 icons;
- the panel, dialog and caption-bar frames;
- the slider and checkbox controls.

Every cut-out from a white or checkerboard sheet has its light edge peeled back to the dark outline, so there's no white line around it.
The street painting sits behind the intro card.

**Made from your art for the site:** `ui/panel-frame.png` + `ui/panel-deco.png` and `ui/dialog-frame.png` + `ui/dialog-deco.png`.
The frames are split into a stretchable border and a separate flower corner, so they fit any size without the flowers stretching.

**Tried and taken back out (19 Nov 2026), so the original look stays:**
- the logo (`brand/logo.png`), so the top bar shows the text title again;
- the home hero skyline (`home/skyline.png`), so the drawn skyline and big title are back;
- the house fronts over the rooftops on the street (`street/facade.png`);
- the portrait frame and name plate in conversations.

Send new versions of any of these if you want to try them again.

**Still needed as blank versions.** These arrived with sample content painted in, so they'd show the same words or food everywhere:

| File | What's painted in | What to send |
|---|---|---|
| `btn-main` ×4, `btn-second` ×4 | "Play", "Options" | The same buttons with no text |
| `btn-round` ×3 | A play arrow | Empty round buttons (icons go on top) |
| `key.png` | "E" | An empty key cap |
| `field` ×3 | "Type here…", "Invalid input!" | Empty boxes |
| `card`, `card-hover`, `sold-out`, `buy-paper` | A bánh mì and placeholder bars | Empty cards (the food picture is added by the site); `sold-out` as just the stamp |
| `reply`, `reply-hover` | "That sounds great!" and a chat icon | Empty rows |
| `speech-bubble`, `name-tag`, `press-e`, `tag`, `pill` | "…", "Auntie Lan", "Press E", "New!", wallet and bag numbers | Empty shapes |
| `hud.png` | The whole HUD as one picture | One empty HUD panel |
| `meter-track`, `meter-fill` | The fill is drawn part-way | `meter-fill` as a completely full bar |
| `toggle-off`, `toggle-on` | Switch style | Pill buttons in "off" and "on" states (the site's choices are pills, e.g. Pretty / Handsome / Friend) |
| `game/map.png` | Pins and a route are painted on, and the streets don't follow the 8 × 5 grid | The map without pins or route, streets on the grid in section E |
| `home/mix-board.png` | Polaroids on a corkboard | A top-down street with the roof, road and pavement bands in section F |

---

# Part 1 · Style rules

## 1.1 The pixel grid
- **Draw at the native size**, then export at **×4** (shop items ×8) with *nearest-neighbour* scaling.
  Never scale by a non-whole number, rotate, or blur after scaling.
- **One art pixel is the same size everywhere on the street.** All vendors and the riding player are **72 px tall**.
  All street sounds and the walking player are **48 px tall**. The site shows them at matching sizes, so a pixel on
  Auntie Lan is exactly the size of a pixel on you.
- **Feet sit on the bottom row** of the canvas, with no empty rows underneath. The site stands sprites on that line.
- **Transparent PNG**, no colour profile, file names lowercase with dashes.
- **No baked ground shadow.** The site adds a soft shadow under every sprite.
- Characters and vehicles **face right**. The site flips them when they move left.

## 1.2 Outlines
- **1 px outline** around the whole silhouette in **Ink `#2a1a10`**, a warm near-black.
  Never use pure black `#000000`.
- **Selective outline (sel-out):** on the lit side (top-left), lighten the outline to the darkest shade of the
  colour it touches. The lit edge then glows a little, and the shadow side stays crisp.
- **Inner lines** (fold of a sleeve, edge of a basket) use the *shadow shade of that material*, not Ink.
- **No "pillow shading"** (dark rim all the way round with light in the middle). Light comes from one side.

## 1.3 Light: it's always night
| Light | Where from | Colour | How to use it |
|---|---|---|---|
| **Key light** | Upper left: street lamps and the vendor's own lantern | Warm sodium orange | Lights faces, the tops of hats, the front of stalls |
| **Rim light** | Back right: moonlight | Cool teal-blue `#8fd8c8` or `#4a7a9c` | 1 px line on the right and back edges of hats, shoulders and wheels. Keep it thin |
| **Glow** | Lanterns, fire, headlights, steam in lamplight | `#fff0c9` → `#f5a043` | Small bright core, 1–2 rings of dither or a lighter ramp step around it |

## 1.4 Shading
- **Cel shading in 3–4 hard steps per material:** highlight · base · shadow · deep shadow (only where two parts touch,
  under the hat brim, between basket and pole). No smooth gradients.
- **Hue-shift every ramp.** Shadows lean towards navy/purple and highlights towards warm yellow-cream. Never shade
  by just adding grey or black.
- **Dither sparingly:** only for large background areas, glow halos and steam. Use a simple 50% checkerboard.
- **Anti-alias by hand** only on long curves (hat brims, wheels), and at most 1 in-between colour.
- **Keep it readable at 113 px tall:** big shapes first, then 1–2 details per area. If a detail isn't readable at
  that size, drop it.

## 1.5 Master palette
Build every image from these ramps (dark → light). It's fine to add 1 colour to a ramp if you really need it,
but reuse first. The UI colours of the site are marked ★ so the art and the interface match.

| Ramp | Colours |
|---|---|
| **Ink and night** | `#2a1a10` Ink · `#0a1926` · `#0e2233`★ · `#15324a`★ · `#1e4462`★ · `#2d5a7b` · `#4a7a9c` |
| **Sodium light** | `#7a3e12` · `#b4651f` · `#e48c2c` · `#f5a043`★ · `#ffc27e` · `#fff0c9` |
| **Paper and cream** | `#6b5a48` · `#a8946f` · `#d9c39a` · `#f1e7d0`★ · `#fff8e8` |
| **Wood** | `#3a2012` · `#5b3520` · `#8a5532` · `#b07a4a` · `#d8a878` |
| **Nón lá straw** | `#7a5424` · `#b8873f` · `#e0b86a` · `#f5dc9c` |
| **Lacquer red** | `#5e1f1a` · `#9c2f24` · `#e2553f`★ · `#ff8a6e` |
| **Teal (player, tiles)** | `#1f4f4a` · `#2f7a70` · `#55b3a3`★ · `#8fd8c8` |
| **Leaf green** | `#24401f` · `#3f6a2e` · `#6f9e45` · `#a8c96a` |
| **Metal and glass** | `#3b4a55` · `#6f8594` · `#a9bcc8` · `#e6f0f5` |
| **Skin, light** | `#8a5a40` · `#c98e66` · `#e0b48a` · `#f2d0a8` |
| **Skin, medium** | `#6e4430` · `#a8704e` · `#c99470` · `#e2b892` |
| **Skin, deep** | `#4a2c20` · `#7a4a33` · `#9c6648` · `#bd8a68` |
| **Hair** | black-brown `#1e1410` · `#3a2618` · `#5a3c26` · grey `#8f8a86` · `#c9c4bd` |
| **Steam and smoke** | `#a9b7c1` · `#d6dee3` · `#f1f5f7` (the only things allowed to be semi-transparent, at 60% and 85%) |

## 1.6 Faces and bodies
- **Street sprites:** chibi proportions, head about **⅓ of the body height**. Eyes 1×2 px, Ink with no highlight.
  Mouth 1–3 px. Brows only if the emotion needs them.
- **Portraits (64×64):** head and shoulders, the head filling about 55% of the canvas, top of hat 2–4 px from the top
  edge, body cut off at the bottom edge. Eyes 3×4 px with a 1 px cream highlight top-left. Brows 1–2 px.
  Shoulders turned slightly, face looking at the viewer.
- **Same character, same colours:** the portrait and the street sprite must use identical clothing colours.

## 1.7 Writing inside the art
Signs like **BÁNH BAO** and **HỦ TIẾU GÕ** must keep every Vietnamese mark (sắc, huyền, hỏi, ngã, nặng, and the hats
on â ê ô, the horns on ơ ư, and đ). Letters at least 5 px tall with 1 px gaps. If a mark doesn't fit, make the sign
bigger. Never drop the mark.

## 1.8 Before you export, check
1. Is it the right native size, and does it sit on the bottom row?
2. Ink outline, sel-out on the lit side, teal rim on the right?
3. Only palette colours (plus steam alpha)?
4. Does it read at the size it's shown (see each table in Part 3)?
5. Exported at ×4 (or ×8) with nearest-neighbour, transparent background?

---

# Part 2 · Characters

Each vendor keeps the same concept as now. **Key shapes** are what makes them recognisable as a silhouette, so make
sure each one is still clear filled in solid black.

## Auntie Lan · bánh mì · bicycle stall
- **Who:** about 50. Cheerful and chatty. Has ridden the same bicycle for twenty years and knows every pothole.
  Calls out "Bánh mì nóng giòn đây!" in the evening.
- **Key shapes:** nón lá · a bicycle · a big front basket with a gingham cloth and golden rolls poking out.
- **Outfit:** brown áo bà ba shirt `#8a5532`, dark trousers `#3b4a63`, rubber sandals. Skin: medium.
  Hair tucked under the hat, a few dark strands at the cheeks.
- **Stall:** an old green city bicycle (`#3f6a2e` / `#6f9e45`) with spoked wheels and a rear rack. A wicker basket
  (straw ramp) on the front with a red-and-white gingham cloth folded back, and 3 golden-brown rolls (`#e48c2c` / `#ffc27e`).
  Little "fresh" sparkle lines above the rolls.
- **Street pose:** sitting on the bike, hands on the handlebars, mid-ride.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Soft closed-mouth smile, eyes open | Shoulders relaxed, hat straight |
| Happy | Eyes curved closed (^ ^), wide open laugh, cheeks lifted with a 1 px blush `#ff8a6e` | Head tilted, one hand raised in a wave |
| Sad | Brows tilted up in the middle, eyes looking down, small flat mouth | Shoulders dropped, hat brim lower over the eyes |

## Grandma Sáu · hột vịt lộn · shoulder pole
- **Who:** about 70. Warm, bossy in a loving way ("Come, sit, sit!"). Has carried the same pole for forty years and
  sells late into the night.
- **Key shapes:** nón lá · a long bamboo pole across one shoulder · two hanging baskets · curls of steam.
- **Outfit:** cream shirt `#f1e7d0` with rolled sleeves, brown trousers `#5b3520`, flat sandals. Skin: light,
  with 1–2 px laugh lines. Grey hair (`#8f8a86` / `#c9c4bd`) in a low bun.
- **Stall:** a bamboo pole (wood ramp) with ropes down to two round wicker baskets. Inside each, a pink-red cloth
  (`#e2553f` / `#ff8a6e`) wrapped around white eggs (paper ramp), and steam rising from both.
- **Street pose:** mid-walk, a slight lean forward under the weight, one hand holding the pole.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Kind half-smile, eyes slightly squinted | Pole visible on the shoulder |
| Happy | Big toothy grin, eyes shut in crescents, deep laugh lines | Free hand on her hip or chest, chuckling |
| Sad | Eyes downcast, lips pressed together, brows pinched | Head turned slightly away, shoulders sagging |

## Hoa · chè · glass-sided push cart
- **Who:** about 25. Bright and friendly. Her mother is from Huế, and she treats chè like an art form.
- **Key shapes:** nón lá over a long ponytail · a boxy cart with glass sides · a lantern on a curved pole · a row of
  coloured jars.
- **Outfit:** olive-green shirt `#6f9e45`, dark brown trousers `#3a2012`, sandals. Skin: light. Long dark ponytail
  down her back.
- **Stall:** a metal-and-glass cart (metal ramp) on two wooden-spoked wheels. Through the glass, 4 jars of yellow mung
  bean, red bean, green jelly and orange. Two white bowls on top. A brass lantern on a curved wooden pole, glowing.
- **Street pose:** walking behind the cart, pushing the handle with both hands.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Friendly smile, eyes open | Ponytail over one shoulder |
| Happy | Open smile, sparkle highlight in the eyes, blush | Holding up a glass of chè |
| Sad | Small frown, eyes glistening (1 px cream tear line optional) | Hands clasped, looking down |

## Tâm · hủ tiếu gõ · runner with a wooden noodle cart
- **Who:** about 19. Energetic and fast-talking, calls customers "boss". Runs the orders up the stairs and knocks the
  bamboo clappers ("tock-tock").
- **Key shapes:** flat cap · two bamboo sticks raised · a red wooden cart with a roof and sign.
- **Outfit:** cream short-sleeved shirt with rolled sleeves, brown trousers `#5b3520` rolled at the ankle, sandals,
  brown flat cap `#8a5532`. Skin: medium.
- **Stall:** a red lacquered wooden cart (lacquer ramp) with a small sloped roof. The sign reads **HỦ TIẾU GÕ** in
  cream letters. A steaming metal pot, a stack of white bowls, chilli-sauce and fish-sauce bottles, and one big
  wooden wheel. Motion lines by the clappers.
- **Street pose:** standing in front of the cart mid-stride, both arms up knocking the clappers, mouth open calling out.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Easy grin, one brow slightly higher | Clappers resting on the shoulder |
| Happy | Huge open-mouth grin, eyes squeezed | Clappers raised mid-knock, motion lines |
| Sad | Mouth tilted down at one side, eyes to the side | Cap pulled down, clappers lowered |

## Auntie Thu · bánh giò · basket and stool (Hà Nội, winter)
- **Who:** about 45. Gentle and motherly. Walks the Old Quarter on cold nights, and her call is "the sound of winter".
- **Key shapes:** nón lá · a seated figure on a tiny red stool · a big round basket of green pyramids · a lantern on a
  bamboo pole.
- **Outfit:** padded plum jacket (`#5a3a5e` and its shades, hue-shifted from the night ramp), a thick red scarf
  `#e2553f` wrapped twice, dark trousers. Skin: light, rosy cheeks from the cold.
- **Stall:** a large woven basket of pyramid-shaped dumplings wrapped in banana leaf (leaf ramp), sitting on a clay
  brazier (wood ramp) with a small orange fire glowing underneath. A lantern on a bamboo pole with a hook. Steam.
  A tiny red plastic stool.
- **Street pose:** sitting on the stool beside the basket, leaning in, hands busy with a dumpling.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Calm soft smile | Scarf up to the chin |
| Happy | Warm smile with eyes closed, rosy cheeks brighter | Hands cupped around a steaming dumpling |
| Sad | Brows raised in the middle, mouth hidden a little in the scarf | Pulling the scarf up, shoulders hunched |

## Uncle Hùng · bánh bao · motorbike with a loudspeaker
- **Who:** about 55. A joker with a soft heart. Took over from his father, who called out every night until his voice
  gave up. Now plays a recording, and secretly misses calling himself.
- **Key shapes:** a round helmet · a step-through motorbike · a big box with a round steamer on top · a loudspeaker
  horn on a pole.
- **Outfit:** cream helmet `#f1e7d0`, brown jacket `#8a5532` over a cream shirt, dark trousers, sandals. Skin: medium.
  A small moustache.
- **Stall:** a green-and-cream step-through motorbike (Cub style, leaf + paper ramps) with a headlight glowing.
  On the back rack, a wooden box with the sign **BÁNH BAO** and a bun drawn on it, a round metal steamer on top with
  2–3 white buns and steam, and a grey loudspeaker horn on a short pole with sound-wave lines.
- **Street pose:** sitting on the bike, one foot down, slight smile.

| Emotion | Face | Body (portrait) |
|---|---|---|
| Neutral | Moustache, gentle smile | Helmet on, chin strap visible |
| Happy | Big laugh, moustache lifted, eyes crinkled | Thumbs up, or holding a bun |
| Sad | Moustache drooping, eyes down | Helmet in his hands, looking at it |

## You · the player
- **Who:** a visitor to the street. Kept simple and friendly so anyone can see themselves in them. No strong gender
  cues (vendors call you pretty, handsome or friend, as you choose).
- **Key shapes:** nón lá · **teal shirt** (the one colour no vendor wears, so you always stand out) · navy trousers.
- **Outfit:** teal shirt (teal ramp), navy trousers `#1e4462`, dark sandals. Skin: medium. Short dark hair under the hat.
- **Walking sprite (28×48):** side view, mid-step.
- **Riding sprite (80×72):** you on the **same green-and-cream step-through bike as Uncle Hùng, but without his box**,
  so it reads as "a motorbike" at a glance. Headlight on, small speed lines behind.
- Player has no portrait (the conversation box only shows the vendor).

---

# Part 3 · Master checklist

**Status:** ✅ in the project now (redraw if you like) · 🟡 stand-in on screen, **swap in** · ⬜ missing, **swap in**
· 🔧 drawn by code right now, **needs wiring** when your art is ready.

**Totals:** 127 images. 52 drop straight in (sections A, B, C, E). 75 need wiring (sections D, F, G, H), mostly
because the backgrounds and interface are drawn by code today.
Suggested order: characters first, then the world, then the UI: A → B → C → E → F → D → H → G.

## A. Street sprites: 12 (✅ 10 exist, 🟡 2 stand-ins)
> **Player animation and the girl version:** see [PLAYER-ART.md](PLAYER-ART.md) for all directions, the walk cycle and the frame templates.
Shown standing on the street. Vendors are displayed 170 px tall, street sounds and walking you 113 px.

| File | Native → export | Status | Notes |
|---|---|---|---|
| `images/vendors/banhmi.png` | 72×72 → 288×288 | ✅ | Auntie Lan on her bicycle |
| `images/vendors/hotvitlon.png` | 72×72 → 288×288 | ✅ | Grandma Sáu with pole and baskets |
| `images/vendors/che.png` | 88×72 → 352×288 | ✅ | Hoa pushing the glass cart |
| `images/vendors/hutieugo.png` | 96×72 → 384×288 | ✅ | Tâm and the red cart |
| `images/vendors/banhgio.png` | 72×72 → 288×288 | ✅ | Auntie Thu on her stool by the basket |
| `images/vendors/banhbao.png` | 80×72 → 320×288 | ✅ | Uncle Hùng on the motorbike |
| `images/ambient/moto.png` | 48×48 → 192×192 | ✅ | A parked motorbike, headlight on: the one you can ride |
| `images/ambient/rain.png` | 48×48 → 192×192 | ✅ | A small rain cloud with drops and puddle rings |
| `images/ambient/bell.png` | 48×48 → 192×192 | ✅ | Temple bell under a little red wooden gate |
| `images/ambient/crickets.png` | 48×48 → 192×192 | ✅ | Cricket in grass, crescent moon, sparkles |
| `images/player/walking.png` | 28×48 → 112×192 | 🟡 | You walking. Stand-in: small drawn figure |
| `images/player/riding.png` | 80×72 → 320×288 | 🟡 | You on the motorbike. Stand-in: motorbike picture with the figure on top |

## B. Vendor portraits: 18 (⬜ all)
`images/portraits/` · native **64×64 → 256×256** · shown at about 160 px in the conversation box.
Moods as described in Part 2. Transparent background (the frame behind them is part of the UI).

| Vendor | Neutral | Happy | Sad |
|---|---|---|---|
| Auntie Lan | `banhmi-neutral.png` | `banhmi-happy.png` | `banhmi-sad.png` |
| Grandma Sáu | `hotvitlon-neutral.png` | `hotvitlon-happy.png` | `hotvitlon-sad.png` |
| Hoa | `che-neutral.png` | `che-happy.png` | `che-sad.png` |
| Tâm | `hutieugo-neutral.png` | `hutieugo-happy.png` | `hutieugo-sad.png` |
| Auntie Thu | `banhgio-neutral.png` | `banhgio-happy.png` | `banhgio-sad.png` |
| Uncle Hùng | `banhbao-neutral.png` | `banhbao-happy.png` | `banhbao-sad.png` |

## C. Shop items: 18 (⬜ all)
`images/shop/` · native **32×32 → 256×256 (×8)** · shown on shop cards, in the buy panel and in My bag.
The food on its own, three-quarter view from above, sitting on its plate, bag or bowl, lit from the top left.

| Vendor | Files and what's in them |
|---|---|
| Bánh mì | `banhmi-khong.png` plain golden roll · `banhmi-pate.png` split roll with pâté, pickled carrot, coriander · `banhmi-xiu-mai.png` roll with meatballs in red sauce |
| Hột vịt lộn | `hotvitlon-mot.png` one egg in a small cup with herbs and lime · `hotvitlon-ba.png` three eggs on a plate · `hotvitlon-xao-me.png` eggs in glossy brown tamarind sauce with peanuts |
| Chè | `che-dau-den.png` black beans and coconut milk in a glass · `che-ba-mau.png` tall glass with red, yellow and green layers · `che-thai.png` fruit and jelly in a glass with ice |
| Hủ tiếu gõ | `hutieu-thuong.png` bowl of noodles with pork · `mi-hoanh-thanh.png` egg noodles with wontons · `hutieu-dac-biet.png` loaded bowl with prawns and quail eggs |
| Bánh giò | `banhgio-thuong.png` one leaf-wrapped pyramid · `banhgio-trung-cut.png` opened dumpling showing quail eggs · `banhgio-cha.png` dumpling with a slice of pork roll |
| Bánh bao | `banhbao-chay.png` plain white bun · `banhbao-thit.png` bun torn open showing egg and pork · `banhbao-xa-xiu.png` bun with red barbecue pork showing |

## D. Mini icons: 10 (⬜, optional, needs a small wiring step)
`images/mini/` · native **16×16 → 64×64**. Crisp little versions of each vendor and street sound for the small places
where the big sprite is shrunk now (the "You can hear" list, the build palette, the Mix board tokens, the order list
in Delivery runs). Just the most recognisable part of each: the basket of rolls, two hanging baskets, a jar of chè, a
noodle bowl with clappers, a green pyramid, a steamer with a bun, a motorbike, a cloud, a bell, a cricket.

`banhmi.png` · `hotvitlon.png` · `che.png` · `hutieugo.png` · `banhgio.png` · `banhbao.png` · `moto.png` · `rain.png` · `bell.png` · `crickets.png`

## E. Delivery runs game: 4
`images/game/`

| File | Native → export | Status | Notes |
|---|---|---|---|
| `stall.png` | 32×32 → 128×128 | ⬜ | The pick-up point: a tiny awning with a lantern and a stack of food boxes |
| `house.png` | 32×32 → 128×128 | ⬜ | A narrow tube-house door with a lit window. One design, used for every customer (a food badge goes on top) |
| `scooter.png` | 32×24 → 128×96 | 🟡 | The delivery scooter seen from the side, with a box on the back. Stand-in: the motorbike picture |
| `map.png` | 400×250 → 1600×1000 | 🟡 | Ground texture under the map: tiled roofs, trees, little courtyards, dark and soft. Streets are drawn on top along an 8 × 5 grid of crossings, at x = 25, 75, 125… 375 and y = 25, 75… 225 native px, so leave those lines plain. Swap in now (shown faint); if you'd like your map to replace the drawn streets fully, that's a small wiring step |

## F. Backgrounds and environment: 4 (🔧 needs wiring)

| File | Native → export | Notes |
|---|---|---|
| `images/street/ground.png` | 600×375 → 2400×1500 | **The whole street you walk on.** Keep these bands, from the top, because you can't walk on the roofs: **0–22%** sky and tube-house fronts (lit windows, shop signs, tangled power lines, a few stars) · **22–24%** curb · **24–66%** road with a dashed centre line at **45%** · **66–68%** curb · **68–100%** tiled pavement. Street lamps every 150 native px along both curbs with warm pools of light. Must tile cleanly at the left and right edges. |
| `images/home/skyline.png` | 480×150 → 1920×600 | Home page hero: a row of tube houses against the night sky, lit windows, power lines. The left third stays dark and simple because the title sits on top. Tiles left to right |
| `images/home/mix-board.png` | 320×200 → 1280×800 | Home page Mix board, seen from above: rooftops band (0–22%), curb, road (24–66%) with a dashed line, curb, pavement (68–100%). Muted, since tokens sit on it |
| `images/home/og-image.png` | 300×157 → 1200×628 | Optional: the picture shown when the site link is shared. The logo over the night street with 2–3 vendors |

## G. UI kit: 58 (🔧 needs wiring)
The site's interface is built in CSS right now. These images let it be reskinned to match your art.
**9-slice** means: draw the corners and edges once, and the middle stretches. Keep the corners inside the
"slice" margin given, and make the middle area a flat colour or a pattern that can repeat.

### G1. Panels and frames: 17
| File (`images/ui/`) | Native, slice | Used for |
|---|---|---|
| `panel.png` | 48×48, slice 8 | Every pop-up: shop, My bag, delivery runs, intro card, build panel, story panel |
| `dialog-paper.png` | 48×32, slice 8 | The conversation text box (cream paper in a wooden frame) |
| `portrait-frame.png` | 72×72, slice 6 | Wooden frame around the vendor portrait |
| `name-plate.png` | 48×16, slice 6 | Vendor name under the portrait |
| `buy-paper.png` | 48×32, slice 6 | The buy panel's cream card |
| `hud.png` | 32×32, slice 6 | "You can hear", the speed panel, the money box |
| `card.png` · `card-hover.png` | 40×56, slice 6 | Shop and bag item cards, and the vendor cards on the home page |
| `sold-out.png` | 40×14 | "Sold out" stamp over a card |
| `reply.png` · `reply-hover.png` | 48×16, slice 6 | Reply choices in conversations |
| `speech-bubble.png` | 24×16 + tail, slice 6 | Vendors' calls floating above their heads |
| `name-tag.png` | 24×10, slice 4 | Name under each sprite on the street |
| `press-e.png` | 24×12, slice 5 | The "Press E to talk" bubble beside a vendor |
| `tag.png` | 16×8, slice 3 | Small orange tags: "Left 8/12", stop numbers |
| `pill.png` | 24×12, slice 5 | Wallet pills, the bag count badge |
| `caption-bar.png` | 32×16, slice 4 | Strip at the bottom showing a call and its meaning |

### G2. Buttons: 14
| File (`images/ui/`) | Native, slice | States |
|---|---|---|
| `btn-main.png` · `-hover` · `-pressed` · `-disabled` | 32×14, slice 5 | The orange main action: Buy, Start delivery, Turn on sound, Next ▸ |
| `btn-second.png` · `-hover` · `-pressed` · `-disabled` | 32×14, slice 5 | Outline buttons: Cancel, Build, Mute all, Undo |
| `btn-round.png` · `-hover` · `-pressed` | 16×16 | Round icon buttons: close ×, − and +, the speed buttons |
| `toggle-off.png` · `toggle-on.png` | 24×12, slice 5 | Pill toggles: region filters, Pretty / Handsome / Friend, night difficulty |
| `key.png` | 12×12, slice 3 | Keyboard key caps: E, F, Q, R, W A S D |

### G3. Form controls: 10
| File (`images/ui/`) | Native, slice | Notes |
|---|---|---|
| `field.png` · `field-focus.png` · `field-error.png` | 32×14, slice 4 | Text boxes in "Add a call", the share-code box |
| `check-off.png` · `check-on.png` | 12×12 | The consent checkbox |
| `slider-track.png` · `slider-fill.png` | 32×6, slice 3 | Amount and speed sliders |
| `slider-thumb.png` | 10×10 | Slider handle |
| `meter-track.png` · `meter-fill.png` | 32×4, slice 2 | Loudness bars in "You can hear" |

### G4. Icons: 17
`images/icons/` · native **16×16 → 64×64**, Ink outline, one or two colours from the palette, readable at 16 px on screen.

`back.png` (arrow left) · `bag.png` (My bag, shop) · `build.png` (hammer) · `captions.png` (CC) · `sound-on.png` · `sound-off.png`
· `learn.png` (open book) · `chat.png` (speech bubble) · `leave.png` (door with arrow) · `next.png` (▸) · `close.png` (×)
· `coin.png` (đồng coin, for wallets) · `delivery.png` (scooter with box) · `star-on.png` · `star-off.png` · `check.png` (delivered) · `play.png`

## H. Branding and home page: 3 (🔧 needs wiring)
| File | Native → export | Notes |
|---|---|---|
| `images/brand/logo.png` | 160×32 → 640×128 | The **TIẾNG RAO** wordmark: chunky pixel letters, sodium orange with an Ink outline and a warm glow. The ẾNG marks must be clear |
| `images/brand/favicon.png` | 32×32 (also export 180×180) | Browser tab icon: a nón lá, or the Ế, on night blue |
| `images/home/listener.png` | 16×16 → 64×64 | The "You" marker on the Mix board: your nón lá seen from above |

---

## Quick count
| Section | Images | Drops straight in? |
|---|---|---|
| A. Street sprites | 12 | ✅ yes |
| B. Portraits | 18 | ✅ yes |
| C. Shop items | 18 | ✅ yes |
| D. Mini icons | 10 | small wiring step |
| E. Delivery game | 4 | ✅ yes |
| F. Backgrounds | 4 | 🔧 wiring |
| G. UI kit | 58 | 🔧 wiring |
| H. Branding | 3 | 🔧 wiring |
| **Total** | **127** | 52 drop in · 75 need wiring |

**Fonts aren't images**, but if your UI redesign uses a pixel font, check that it has full Vietnamese support before you
pick it. Test it with: **Tiếng Rao · Bánh mì nóng giòn đây · Hột vịt lộn · Hủ tiếu gõ · Ai ăn chè không? · nóng hổi · Đồng**.
If any mark is missing or overlaps, keep the current fonts for text and use the pixel font only for headings that
don't need those marks.
