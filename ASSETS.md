# Images to make for Tiếng Rao

Drop each file into the project with **exactly** the name shown. The site picks it up on the next reload, with no code changes.
Until a file exists, the site shows a placeholder (usually a dashed box with the file name), so nothing breaks while you work.

- **Style:** pixel art like the vendor pictures, on a **transparent background** (PNG).
- **Facing:** characters and vehicles face **right**. The site flips them when they move left.
- **Sizes** below are what to export at. They're about double the size shown on screen, so they stay sharp.

**To make: 42 images** (38 required, 4 that improve stand-ins already on screen) · Already done: 10

---

## 1. Vendor portraits: 18 images, required
Folder: `images/portraits/` · 256 × 256 px, square, shoulders-up, facing the viewer.
Shown in the conversation box. Each vendor needs 3 moods: **neutral** (normal talking), **happy** (greeting, thank-you), **sad** (when you leave mid-sentence).

| Vendor | Neutral | Happy | Sad |
|---|---|---|---|
| Auntie Lan, bánh mì | `banhmi-neutral.png` | `banhmi-happy.png` | `banhmi-sad.png` |
| Grandma Sáu, hột vịt lộn | `hotvitlon-neutral.png` | `hotvitlon-happy.png` | `hotvitlon-sad.png` |
| Hoa, chè | `che-neutral.png` | `che-happy.png` | `che-sad.png` |
| Tâm, hủ tiếu gõ | `hutieugo-neutral.png` | `hutieugo-happy.png` | `hutieugo-sad.png` |
| Auntie Thu, bánh giò | `banhgio-neutral.png` | `banhgio-happy.png` | `banhgio-sad.png` |
| Uncle Hùng, bánh bao | `banhbao-neutral.png` | `banhbao-happy.png` | `banhbao-sad.png` |

## 2. Shop items: 18 images, required
Folder: `images/shop/` · 256 × 256 px, square, the food on its own.
Shown on the shop cards and in the buy panel.

| Vendor | Item 1 | Item 2 | Item 3 |
|---|---|---|---|
| Bánh mì | `banhmi-khong.png` (Plain roll) | `banhmi-pate.png` (Pâté bánh mì) | `banhmi-xiu-mai.png` (Meatball bánh mì) |
| Hột vịt lộn | `hotvitlon-mot.png` (One egg) | `hotvitlon-ba.png` (Three eggs) | `hotvitlon-xao-me.png` (Tamarind eggs) |
| Chè | `che-dau-den.png` (Black bean chè) | `che-ba-mau.png` (Three-colour chè) | `che-thai.png` (Thai-style chè) |
| Hủ tiếu gõ | `hutieu-thuong.png` (Pork noodle soup) | `mi-hoanh-thanh.png` (Wonton noodles) | `hutieu-dac-biet.png` (The special) |
| Bánh giò | `banhgio-thuong.png` (One dumpling) | `banhgio-trung-cut.png` (Quail egg dumpling) | `banhgio-cha.png` (Dumpling with pork roll) |
| Bánh bao | `banhbao-chay.png` (Plain bun) | `banhbao-thit.png` (Pork and egg bun) | `banhbao-xa-xiu.png` (BBQ pork bun) |

## 3. Player: 2 images, improves a stand-in
Folder: `images/player/` · side view, feet at the bottom edge, facing right.

| File | Size | What it is | Until it exists |
|---|---|---|---|
| `walking.png` | about 180 × 260 px | You walking around the street (keep the teal shirt so you stand out from vendors) | The small pixel figure in a nón lá |
| `riding.png` | about 340 × 300 px | You sitting on the motorbike, ready to ride | The Motorbikes picture with the pixel figure on top |

## 4. Delivery runs game: 4 images
Folder: `images/game/`

| File | Size | What it is | Until it exists |
|---|---|---|---|
| `stall.png` | 128 × 128 px | **Required.** The stall where you pick up food and reload: the start and end of every route | Orange dashed circle saying "Stall" |
| `house.png` | 128 × 128 px | **Required.** A customer's house or doorway, used for every delivery stop (a small food icon is added on top automatically) | Dashed circle with the stop number |
| `scooter.png` | 128 × 96 px | *Improves a stand-in.* The delivery scooter that rides the route, seen from the side | The Motorbikes picture |
| `map.png` | 1600 × 1000 px | *Improves a stand-in.* Ground texture for the neighbourhood map (roofs, trees, pavement). Streets and blocks are drawn on top, so keep it soft and dark | Drawn blue blocks on a dark background |

---

## Already done (10)
These are in the project and working.

- `images/vendors/`: `banhmi.png`, `hotvitlon.png`, `che.png`, `hutieugo.png`, `banhgio.png`, `banhbao.png`
- `images/ambient/`: `moto.png`, `rain.png`, `bell.png`, `crickets.png`
