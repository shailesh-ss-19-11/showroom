# Revolt Motors — Multi-Brand EV Bike Showroom

A full-stack electric-bike showroom website with a public site and an admin panel to manage
bike listings, colors, photos, enquiries, test-ride bookings, and admin accounts.

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Recharts
- **Backend:** Java 21 + Spring Boot + Spring Data JPA (Hibernate) + Flyway + PostgreSQL
- **Auth:** JWT-based admin login, real DB-backed accounts with Owner/Staff roles (bcrypt-hashed passwords)
- **Photos:** Uploaded via the admin panel, stored in [Garage](https://garagehq.deuxfleurs.fr/)
  (self-hosted, S3-compatible object storage) running in Docker, proxied through the API so
  every image URL returned by the API is a complete, directly-viewable link
  (`http://localhost:8080/uploads/<key>`)

## Project structure

```
showroom/
├── client/            # React frontend (public site + admin panel)
├── server/
│   └── showroom/      # Spring Boot API (Java 21, Maven)
├── garage/            # Garage (S3-compatible storage) config + one-time bootstrap script
└── docker-compose.yml # PostgreSQL + Garage for local development
```

## Prerequisites

- Node.js 18+ (frontend)
- Java 21+ and Maven (backend — the bundled `mvnw` wrapper downloads Maven itself, no separate install needed)
- Docker (for PostgreSQL and Garage) — or your own PostgreSQL instance + S3-compatible storage

## 1. Start PostgreSQL and Garage

```bash
cp garage/garage.toml.example garage/garage.toml
# then replace the three GENERATE_WITH_openssl_rand_hex_32 placeholders, e.g.:
#   sed -i '' "s/GENERATE_WITH_openssl_rand_hex_32/$(openssl rand -hex 32)/" garage/garage.toml
# (run that three times, once per placeholder, since each needs a distinct value)

docker compose up -d
./garage/setup.sh   # one-time: creates the cluster layout, bucket, and access key

# The Java backend keeps its own database, separate from anything else in the same
# Postgres instance:
docker exec showroom-postgres psql -U showroom -d showroom -c "CREATE DATABASE showroom_java;"
```

`setup.sh` prints a **Key ID** and **Secret key** the first time it creates the access key —
copy those into `server/showroom/.env` as `GARAGE_ACCESS_KEY_ID` / `GARAGE_SECRET_ACCESS_KEY`.

This starts Postgres on `localhost:5434` and Garage's S3 API on `localhost:3900` (mapped from
their container defaults to avoid clashing with other local services — change the port mappings
in `docker-compose.yml` if you prefer different ones, and update `DB_URL` / `GARAGE_ENDPOINT` in
`server/showroom/.env` to match).

## 2. Backend setup

```bash
cd server/showroom
cp .env.example .env   # adjust values if needed (DB creds, JWT secret, Garage keys)
./run.sh                # loads .env, then runs `mvnw spring-boot:run` on http://localhost:8080
```

On first run, Flyway creates the schema and a data seeder bootstraps:
- one **owner** admin account, from `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
  (defaults to `admin@varexa.in` / `Admin@123`)
- one sample bike (Revolt RV400), if the bikes table is empty

**Change the admin password before deploying**, and manage additional staff/owner accounts
from the admin panel's **Admins** tab (owner-only) once logged in.

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

If Vite picks a different port than 5173 (because it's already in use), update `CLIENT_URL`
in `server/showroom/.env` to match, so CORS allows the frontend to call the API — though in
development any `localhost:*` origin is already allowed regardless.

## Features

**Public site**
- Home, About Us, Services, Contact Us pages
- EV bike listing with search, brand/category filters, and sorting
- Bike detail page with color variants, photo gallery, EV specs (battery capacity, range,
  charging time, top speed, power), an enquiry form, and a test-ride booking form

**Admin panel** (`/admin/login`)
- Dashboard with bike/enquiry/booking stats and charts (enquiries over time, bikes by brand,
  most-enquired bikes)
- Bikes: search/filter by brand, category, and published/draft status; bulk feature/publish/
  delete; duplicate a bike as a starting point for a variant; drag-to-reorder photos
  - `POST /api/bikes` accepts `multipart/form-data` with an `images` field to upload photos in
    the same request that creates the bike (max 5MB per photo, JPEG/PNG/WEBP/AVIF only)
- Enquiries: status tracking (New/Contacted/Converted/Closed) and CSV export
- Test-ride bookings: status tracking (Pending/Confirmed/Completed/Cancelled)
- Admins tab (owner-only): add/remove staff or owner accounts, change roles

## Notes

- Uploaded photos live in the Garage `bike-photos` bucket (Docker volumes
  `showroom_garage_meta` / `showroom_garage_data`) — back these up, or point `GARAGE_ENDPOINT`
  and friends at a hosted S3-compatible provider, before scaling past a single server.
- `garage/garage.toml` is gitignored (it holds generated secrets) — each environment should
  generate its own via `garage/garage.toml.example`.
- `server/showroom/.env` is gitignored; Java/Spring Boot has no built-in `.env` loader, so
  `run.sh` sources it into the shell before starting the app. If you run the app from an IDE
  instead, set the same variables in its run configuration.
- Change `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` before deploying to production.
- The backend's schema is managed by Flyway (`server/showroom/src/main/resources/db/migration`)
  with Hibernate in `validate`-only mode — add new migrations rather than letting Hibernate
  auto-generate DDL.
