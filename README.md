# عالم السنوكر — World of Snooker

Premium digital platform for a billiards & snooker club in **Irbid – Al Sultan Roundabout, Jordan**.

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Django 6 + Django REST Framework + Channels (WebSockets) |
| Auth | JWT (admin/staff only — customers never register) |
| Database | PostgreSQL (production) / SQLite (local default) |

---

## Features

### Customer website (no login)
- Luxury RTL homepage with club branding
- Table booking (billiards / snooker / cards)
- Tournaments list + detail (bracket, schedule, results)
- Live matches center (WebSocket updates)
- News / offers feed

### Admin dashboard (`/admin`)
- Stats: bookings, live games, tournaments, revenue, tables
- Table CRUD + hourly prices
- Booking confirm / cancel / calendar filters
- Tournament create, players, auto bracket/schedule
- Live match score control
- Content publishing (news, winners, offers)

---

## Project structure

```
├── backend/                 # Django API
│   ├── apps/
│   │   ├── accounts/        # JWT users + dashboard stats
│   │   ├── tables/          # Physical tables
│   │   ├── bookings/        # Guest reservations
│   │   ├── tournaments/     # Tournaments, players, brackets
│   │   ├── matches/         # Match schedule & scoring
│   │   ├── live/            # Live sessions + WebSockets
│   │   └── content/         # Posts + club settings
│   ├── config/              # Settings, URLs, ASGI
│   ├── manage.py
│   └── requirements.txt
├── frontend/                # Next.js app
│   └── src/app/             # Public + /admin pages
├── docker-compose.yml
└── README.md
```

---

## Quick start (local development)

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows PowerShell
.\venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # or: cp .env.example .env

python manage.py migrate
python manage.py seed_club
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

API: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/api/docs/  
WebSocket live: `ws://127.0.0.1:8000/ws/live/`  
WebSocket bookings: `ws://127.0.0.1:8000/ws/bookings/`

**Default admin**
- Username: `admin`
- Password: `admin123`

**Staff**
- Username: `staff`
- Password: `staff123`

> Change these passwords before production.

### 2. Frontend

```bash
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Site: http://localhost:3000  
Admin: http://localhost:3000/admin/login

---

## PostgreSQL (optional local / required production)

1. Start Postgres (or use Docker: `docker compose up db -d`)
2. In `backend/.env`:

```env
USE_POSTGRES=True
DB_NAME=alam_alsnooker
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

3. Migrate & seed again.

For Redis-backed WebSockets:

```env
REDIS_URL=redis://localhost:6379/0
```

---

## Docker deployment

```bash
# Configure backend/.env (USE_POSTGRES=True, secrets, CORS, WhatsApp)
docker compose up --build -d
```

Services:
- Frontend → `:3000`
- Backend (Daphne ASGI) → `:8000`
- PostgreSQL → `:5432`
- Redis → `:6379`

After first boot:

```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py seed_club
```

---

## Main API endpoints

| Method | Path | Access |
|--------|------|--------|
| POST | `/api/auth/login/` | Public (staff) |
| GET | `/api/accounts/me/` | Auth |
| GET | `/api/dashboard/stats/` | Auth |
| GET/POST | `/api/tables/` | Public read / Auth write |
| GET | `/api/tables/summary/` | Public |
| POST | `/api/bookings/` | Public (guest book) |
| GET | `/api/bookings/availability/` | Public |
| GET/POST | `/api/tournaments/` | Public read / Auth write |
| POST | `/api/tournaments/{slug}/generate_bracket/` | Auth |
| GET | `/api/matches/live/` | Public |
| POST | `/api/matches/{id}/start/` | Auth |
| POST | `/api/matches/{id}/score/` | Auth |
| POST | `/api/matches/{id}/finish/` | Auth |
| GET | `/api/live/feed/` | Public |
| GET/POST | `/api/content/posts/` | Public read / Auth write |
| GET | `/api/content/club/` | Public |

---

## Club defaults (seeded)

| Game | Tables |
|------|--------|
| Billiards (بلياردو) | 5 |
| Snooker (سنوكر) | 6 |
| Cards (ورق) | 5 |

Location: إربد - دوار السلطان  
Hours: 10:00 ص — 2:00 ص

Update WhatsApp number via `CLUB_WHATSAPP` in `.env` or `/api/content/club/`.

---

## Production checklist

1. Set strong `SECRET_KEY` and disable `DEBUG`
2. Restrict `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
3. Use PostgreSQL + Redis
4. Serve media/static via CDN or nginx
5. Put Daphne behind nginx / Cloudflare with TLS
6. Rotate default admin passwords
7. Set real WhatsApp number and social links
8. Build frontend: `npm run build && npm start` (or Docker)

---

## License

Private project for عالم السنوكر club.
