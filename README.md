# Revolt Motors — Multi-Brand Bike Showroom

A full-stack bike showroom website with a public site and an admin panel to manage bike listings, colors, and photos.

- **Frontend:** React (Vite) + Tailwind CSS + React Router
- **Backend:** Node.js + Express + Prisma + PostgreSQL
- **Auth:** JWT-based admin login (hardcoded credentials, env-configurable)
- **Photos:** Uploaded via the admin panel, stored in [Garage](https://garagehq.deuxfleurs.fr/)
  (self-hosted, S3-compatible object storage) running in Docker, proxied through the API so
  every image URL returned by the API is a complete, directly-viewable link
  (`http://localhost:5001/uploads/<key>`)

## Project structure

```
showroom/
├── client/          # React frontend (public site + admin panel)
├── server/          # Express API + Prisma schema
├── garage/           # Garage (S3-compatible storage) config + one-time bootstrap script
└── docker-compose.yml  # PostgreSQL + Garage for local development
```

## Prerequisites

- Node.js 18+
- Docker (for PostgreSQL and Garage) — or your own PostgreSQL instance + S3-compatible storage

## 1. Start PostgreSQL and Garage

```bash
cp garage/garage.toml.example garage/garage.toml
# then replace the three GENERATE_WITH_openssl_rand_hex_32 placeholders, e.g.:
#   sed -i '' "s/GENERATE_WITH_openssl_rand_hex_32/$(openssl rand -hex 32)/" garage/garage.toml
# (run that three times, once per placeholder, since each needs a distinct value)

docker compose up -d
./garage/setup.sh   # one-time: creates the cluster layout, bucket, and access key
```

`setup.sh` prints a **Key ID** and **Secret key** the first time it creates the access key —
copy those into `server/.env` as `GARAGE_ACCESS_KEY_ID` / `GARAGE_SECRET_ACCESS_KEY`.

This starts Postgres on `localhost:5434` and Garage's S3 API on `localhost:3900` (mapped from
their container defaults to avoid clashing with other local services — change the port mappings
in `docker-compose.yml` if you prefer different ones, and update `DATABASE_URL` /
`GARAGE_ENDPOINT` in `server/.env` to match).

## 2. Backend setup

```bash
cd server
cp .env.example .env   # adjust values if needed
npm install
npm run prisma:migrate # creates tables
npm run seed            # creates a sample bike
npm run dev              # starts the API on http://localhost:5001
```

Admin login credentials are set via `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `server/.env`
(defaults to `admin` / `Admin@123`):
- Username: `admin`
- Password: `Admin@123`

**Change these before deploying.**

## 3. Frontend setup

```bash
cd client
cp .env.example .env   # adjust API URL / WhatsApp number if needed
npm install
npm run dev              # starts Vite on http://localhost:5173 (or next free port)
```

Set `VITE_WHATSAPP_NUMBER` in `client/.env` to your real WhatsApp Business number
(international format, no `+` or spaces, e.g. `919876543210`) — it powers the floating
WhatsApp button and all "Enquire" links.

If Vite picks a different port than 5173 (because it's already in use), update
`CLIENT_URL` in `server/.env` to match, so CORS allows the frontend to call the API.

## Features

**Public site**
- Home, About Us, Services, Contact Us pages
- Bike listing with search, brand/category filters, and sorting
- Bike detail page with color variants, photo gallery, specs, and an enquiry form
- Floating WhatsApp button on every page

**Admin panel** (`/admin/login`)
- Dashboard with bike/enquiry stats
- Add / edit / delete bikes (name, brand, category, price, specs, description)
  - `POST /bikes` accepts either JSON, or `multipart/form-data` with an `images` field to
    upload 2+ photos in the same request that creates the bike
- Manage color variants per bike
- Upload and manage bike photos (assign to a color, mark as primary) — each photo is stored
  in Garage and deleted from Garage automatically when the photo or its bike is deleted
- View and manage customer enquiries

## API docs

Interactive Swagger UI: `http://localhost:5001/api/docs` (raw spec at `/api/docs.json`).

## Notes

- Uploaded photos live in the Garage `bike-photos` bucket (Docker volumes
  `showroom_garage_meta` / `showroom_garage_data`) — back these up, or point `GARAGE_ENDPOINT`
  and friends at a hosted S3-compatible provider, before scaling past a single server.
- `garage/garage.toml` is gitignored (it holds generated secrets) — each environment should
  generate its own via `garage/garage.toml.example`.
- Change `JWT_SECRET`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD` before deploying to production.
- Admin auth is a single hardcoded username/password pair (env-configurable) — there is no
  multi-admin support or DB-backed accounts. The unused `Admin` table in the Prisma schema
  can be removed if you don't plan to add real accounts later.
