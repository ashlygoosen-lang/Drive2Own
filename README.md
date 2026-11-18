# Drive2Own

A marketplace where **vehicle owners** rent cars to **drivers** who want to work on **Uber, inDrive and Bolt**.

- **Owners** list vehicles (weekly rate, deposit, approved platforms, photo), review driver requests and their documents, hand over the car, and confirm weekly payments.
- **Drivers** upload their ID, driver's licence and PrDP once, browse and filter vehicles, send rental requests, and track payments.

## Stack

| | |
|---|---|
| Frontend | React 18, Vite, Tailwind 4, React Router 7 (`/src`) |
| Backend | Node 20+, Express, TypeScript, SQLite (better-sqlite3), JWT auth (`/server`) |

## Run locally

```bash
npm run setup          # installs frontend + backend dependencies
npm run server:seed    # optional demo data
npm run server:dev     # API on http://localhost:4000
npm run dev            # frontend on http://localhost:5173 (proxies /api to the API)
```

Demo logins after seeding (password `Password123!`): owners `0821234567`, `0837654321`; driver `0829876543`.

## Production (single server)

```bash
npm run build                      # builds the frontend into /dist
cd server && npm run build
JWT_SECRET=$(openssl rand -hex 32) NODE_ENV=production DATA_DIR=/var/data/drive2own npm start
```

The API serves `/dist` automatically when it exists, so one process serves the site and the API.
Set `CLIENT_ORIGIN` if the frontend is hosted on a different origin, and `VITE_API_URL` at build time to point the frontend at it.
Copy `server/.env.example` for the available settings. **`JWT_SECRET` is required in production**, and `DATA_DIR` (database + uploads) must be on persistent storage and backed up.

## API overview

| Endpoint | Who | Purpose |
|---|---|---|
| `POST /api/auth/register`, `/login`, `GET/PATCH /api/auth/me` | all | Accounts (phone + password) |
| `GET /api/vehicles` (`platform`, `q`, `maxRate`, `sort`), `GET /api/vehicles/:id` | public | Browse |
| `POST/PUT/DELETE /api/vehicles`, `PATCH /:id/visibility`, `POST /:id/image` | owner | Manage listings |
| `POST /api/rentals` | driver | Request a vehicle (needs ID, licence, PrDP uploaded) |
| `GET /api/rentals` | both | My requests / requests on my vehicles |
| `POST /api/rentals/:id/approve｜decline｜activate｜complete` | owner | Rental lifecycle; `activate` creates the payment schedule |
| `POST /api/rentals/:id/cancel` | driver | Cancel pending/approved request |
| `GET /api/rentals/:id/payments`, `POST …/payments/:pid/paid` | both / owner | Payment ledger |
| `GET/POST/DELETE /api/documents`, `GET /:id/file` | both | Private document uploads (PDF/JPG/PNG/WebP, content-checked) |
| `GET /api/rentals/:id/agreement`, `POST …/agreement/accept` | both | Rental agreement |
| `POST /api/auth/forgot`, `/auth/reset` | all | SMS password reset |
| `GET /api/notifications`, `POST …/read-all`, `…/:id/read` | all | In-app notifications |
| `POST /api/payments/:id/payfast`, `POST /api/payfast/itn` | driver / PayFast | Online payment |
| `GET /api/admin/stats`, `…/documents`, `POST …/documents/:id/review` | admin | Document verification |

## Online payments (PayFast)

Set `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY` (and `PAYFAST_PASSPHRASE`, `PAYFAST_SANDBOX=1` while testing) plus `PUBLIC_API_URL` / `PUBLIC_SITE_URL` (see `server/.env.example`). Drivers then get a **Pay online** button on each pending payment. PayFast calls `POST /api/payfast/itn`; a payment is only marked paid after the signature, merchant, amount and PayFast's own server-side validation all pass. Without these settings, payments stay manual (owners mark them as received).

Money paid online lands in **your** PayFast account. Paying owners out and taking a commission is a business and compliance decision that is not automated here.

## Admin

Create an admin from an existing account: `cd server && npm run make-admin -- 0821234567`. Admins get an **Admin** page to verify or reject uploaded documents (users are notified). Set `REQUIRE_VERIFIED_DOCS=1` to stop owners handing over a vehicle until the driver's ID, licence and PrDP are verified.

## Notifications and password reset

In-app notifications (bell icon) are created for requests, approvals, agreements, handover, payments and document reviews. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` to also send SMS for time-sensitive events and password-reset codes; without them SMS is printed to the server console in development (and the reset code is returned to the browser, development only).

## Rental agreement

When an owner approves a request, a rental agreement is generated and frozen for that rental. The owner (who must confirm the vehicle is insured for e-hailing use) and the driver each accept it in the dashboard, and handover is blocked until both have. The text is a template, **not legal advice**: have a South African attorney review it before launch.

## Still not covered

- Payout of online payments to owners, commissions and refunds.
- Email notifications (SMS and in-app only), WhatsApp, push notifications.
- Automatic overdue reminders and late fees; dispute handling; ratings and reviews.
- Digital signatures (acceptance is recorded with a timestamp, not a signature) and insurance-policy document checks.
- The PayFast integration was tested against a local stub, not PayFast's live sandbox: run a sandbox payment before going live.
