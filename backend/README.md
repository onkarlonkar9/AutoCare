# Backend (Express + Prisma)

## 1) Setup

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend runs at `http://localhost:4000`.

## 2) API summary

- `GET /health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET/POST /api/owner/vehicles`
- `GET/POST /api/owner/service-records`
- `GET/POST /api/service-center/job-cards`
- `PATCH /api/service-center/job-cards/:id`
- `GET/POST /api/service-center/customers`
- `GET/POST /api/service-center/mechanics`

## 3) Frontend env

Add in root `.env`:

```env
VITE_API_URL="http://localhost:4000/api"
```

## 4) Migration approach

Keep existing Supabase integration alive while migrating module-by-module to backend API.
