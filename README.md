# Happybites — campus canteen

React + Vite. UI stage only: every screen runs on sample data in
`src/data/menu.js`; nothing is wired to a backend yet.

Every dish has a picture in `public/icons/`, built from the supplied icon set by
three small passes in `tools/`: `crop-icons.py` strips the sheet captions and
neighbouring tiles, `normalise-icons.py` reframes each one so the food always
covers the same share of the tile, and `cutout-icons.py` makes the background
transparent so it sits cleanly on the plate. If an
item has no picture it falls back to a drawn SVG illustration
(`src/components/FoodArt.jsx`), then to an emoji. A photo uploaded in admin
overrides both for that item. Long sections show two rows and a
**Show all** toggle rather than a sideways swipe.

Styled on the **Foody** reference: warm cream ground, tomato-red accents,
Poppins + Caveat type, and tinted dish cards with a round plate on top. The
palette lives in the `:root` block of `src/styles/index.css` — change the tokens
there and every screen follows.

The menu is the real Happy Bites board (Sept 2026 card): **Tea & Snacks**,
**Juices** (all ₹69, half-litre mug), **Snacks**, and the three **Healthy
Nutritious Bowl** packs — 47 items in all.

## Run

```bash
npm install
npm run dev
```

Port 5173 is often taken by another project on this machine; `npm run dev -- --port 5180`
puts it on its own port.

The dev server binds to all interfaces (`vite --host`), so it is reachable from a
phone on the same Wi-Fi at `http://<your-lan-ip>:5173/`.

## Three separate sides

| Route | Who | What it shows |
| --- | --- | --- |
| `/` | Canteen staff | The counter. Tap a dish, adjust portions with + / −, open the order box in the middle of the screen and charge the student's card. The menu button (top right) expands to the two portals. |
| `/parent` | Parents | Sign in with the **secret code** printed on the back of the child's canteen card — it resolves to their student ID. |
| `/parent/:id` | | Child detail: card, wallet, today's limit, spend history |
| `/parent/:id/topup` | | Add money — presets, custom amount, auto top-up, Razorpay (*Coming soon*) |
| `/parent/:id/limits` | | Daily limit, per-order cap, which categories they may buy |
| `/parent/activity` | | Every transaction across all linked children |
| `/admin` | Canteen admin | Staff ID + PIN. All-time earnings since opening day, today's orders, revenue, items sold, target progress; sales progress by **day / week / month**; most-selling items |
| `/admin/items` | | Add dishes (with a photo from the camera or device), change availability, filter by category |
| `/admin/offers` | | Create and pause combo offers — anything switched on appears on the counter at once |

### Demo logins

- **Parent** — card codes `KX7M2Q` (Aarav) and `PD4B9T` (Ananya). Entering a
  second code on the Children screen links another child.
- **Admin** — any staff ID and any 4-digit PIN.

## Still to build

- Real auth: card codes checked against the database; admin accounts with roles.
- Backend for menu, orders, wallet ledger, limits and daily reports.
- Razorpay checkout on the top-up screen, with webhook-confirmed wallet credits.
- Charging an order against the scanned card (today it only shows a confirmation).

## Structure

```
src/
  App.jsx               routes for the three sides
  data/menu.js          menu (from the printed board), children + card codes, offers, trends
  store/MenuStore.jsx   shared menu + offers, saved to localStorage
  components/           FoodArt (dish illustrations), NavLogins, MenuSection, FoodCard,
                        OrderModal, ParentLayout, AdminLayout, Icons
  pages/CounterPage.jsx canteen counter
  pages/parent/         Login (card code), Children, ChildDetail, TopUp, Limits, Activity
  pages/admin/          Login, Dashboard, Items, Offers
  styles/index.css      design tokens + all styling
```
