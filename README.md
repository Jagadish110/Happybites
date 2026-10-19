# Happybites — campus canteen

A prepaid canteen wallet. Parents top up their child's card with Razorpay; at the
counter staff scan the card and the wallet is charged; the owner watches the money
in the admin portal.

React + Vite on the front, a small Node server (Express + SQLite) behind it.

## Run it

```bash
npm install
cp .env.example .env        # then fill it in (see "Razorpay setup")
npm run dev:all             # website on :5180, API on :8787
```

Open http://localhost:5180/. Without a `.env` it still runs in demo mode (see
"Demo logins"), but **top-ups stay off until Razorpay keys are added**.

| Command | What it does |
| --- | --- |
| `npm run dev:all` | website + API together |
| `npm run server` | API only |
| `npm run build` then `npm start` | one server hosting the built site and the API |
| `npm run test:server` | the payment and wallet tests |

## The three sides

| Route | Who | What it does |
| --- | --- | --- |
| `/` | Counter staff | Tap dishes, search, then **Scan card & charge**. Staff sign in once per shift; the camera reads the student's QR (student ID), with manual entry as a fallback. |
| `/parent` | Parents | Sign in with the secret code on the back of the card. See the wallet and history, **top up through Razorpay**, set daily / per-order limits and blocked categories, block the card. |
| `/admin` | Owner | Owner PIN only. Today's sales, all-time earnings, day / week / month trend, most-selling items, and **where the money is**. Menu and offers editing. |

### Demo logins (dev only)

- Parent card codes: `KX7M2Q` (Aarav), `PD4B9T` (Ananya)
- Counter staff: `CNT-01` / `1234`
- Owner: `ADMIN` / `4321`

In production (`NODE_ENV=production`) none of these exist: set `COUNTER_PIN`,
`ADMIN_PIN` and `APP_SECRET` before the first start, and no demo students are created.

## How the money moves

1. **Parent pays** — the server asks Razorpay for an order for exactly the amount
   chosen, the browser opens Razorpay Checkout, the parent pays by UPI / card /
   netbanking.
2. **Razorpay → your bank** — Razorpay collects the payment and settles it into the
   bank account on your Razorpay dashboard, on its normal settlement schedule. That
   is how the money reaches the owner. This app does not move bank money itself.
3. **Wallet is credited** — only after the server verifies the payment, either from
   the signed callback the browser sends or from Razorpay's signed webhook
   (whichever arrives first; the second is ignored, so it can never double-credit).
4. **Counter charge** — scanning a card subtracts the order total from the student's
   wallet and records a sale. This is a ledger entry: the cash is already in your
   bank from step 2. The admin **Where the money is** panel shows *paid in*,
   *spent at the counter* and *still in wallets* so the books can be checked.

Every rule a parent sets (daily limit, per-order cap, blocked categories, blocked
card) is enforced on the server at charge time, inside the same transaction as the
debit. Amounts are stored as integer paise, and the wallet ledger always adds up to
the balance (tested).

## Razorpay setup

1. Create a Razorpay account and open **Account & Settings → API Keys**. Generate
   **test** keys first (`rzp_test_…`).
2. Put them in `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxx
   ```
   The secret stays on the server. Only the public key id is ever sent to the browser.
3. **Webhook** (so a payment is credited even if the parent closes the tab): in the
   dashboard go to **Webhooks → Add**, URL `https://YOUR-DOMAIN/api/razorpay/webhook`,
   event `payment.captured`, choose a secret and put it in
   `RAZORPAY_WEBHOOK_SECRET`. For local testing use a tunnel such as ngrok.
4. Restart the server. The startup log says `Razorpay: test keys loaded`.
5. Pay with Razorpay's test UPI / card details. Move to live keys only after a full test.

## Before real money

- **Use HTTPS.** Browsers only allow the camera on `https` or `localhost`.
- Set `NODE_ENV=production`, a long random `APP_SECRET`, `COUNTER_PIN` and `ADMIN_PIN`.
- Back up `server/data/happybites.db` (it is the ledger). It is git-ignored.
- Menu prices and offers still live in each browser (localStorage), and the counter
  sends the prices it shows. Move the menu to the server before running several
  counters, so every till shows the same prices and the server can price orders itself.
- Students are demo data. A production import (name, class, student ID, secret code)
  and printed cards with the QR are still to do.
- Not built yet: refunds, receipts / SMS, Razorpay payouts reconciliation reports,
  card re-issue when a secret code is lost.

## Layout

```
server/            Express API, SQLite ledger, Razorpay, tests
  wallet.js        top-ups and charges (all the money rules)
  razorpay.js      orders and signature checks
  reports.js       owner dashboard queries
  test/            payment tests against a fake Razorpay
src/               React app
  api/client.js    talks to the server
  pages/           counter, parent/, admin/
public/icons/      dish pictures (built by tools/)
```
