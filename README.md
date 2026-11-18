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
| `GET/POST/DELETE /api/documents`, `GET /:id/file` | both | Private document uploads |

## What this does not do yet

- **No payment gateway.** Drivers pay owners directly and owners mark payments as received. Integrate PayFast/Ozow/Stitch to automate collection.
- **No admin/verification.** Documents are stored and visible to the relevant owner but not verified by Drive2Own staff.
- **No notifications** (SMS/email/WhatsApp) and no password reset.
- **No rental agreement / insurance workflow.** Owners and drivers should sign a written agreement and confirm the vehicle's insurance covers e-hailing use.
