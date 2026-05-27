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

> This project uses MongoDB Atlas. Set `DATABASE_URL` in `.env` to the Atlas connection string.
> Set `AI_GATEWAY_URL` and `AI_GATEWAY_API_KEY` in `backend/.env` for local backend development, or in the root `.env` for Docker Compose.
> For direct Gemini API usage, set `AI_GATEWAY_URL` to `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent` and `AI_GATEWAY_API_KEY` to your Google API key.
> The backend loader now reads both backend and root `.env` files, so the AI assistant can start in either mode.
>
> The AI assistant responds only to vehicle maintenance, cars, workshop operations, and AutoCare application questions.
>
> Seeded admin users are available after reset with full access to all features and plans without payment:
> - `admin@autocare.ai`
> - `admin1@autocare.ai`
> - `admin2@autocare.ai`
> - `admin3@autocare.ai`
> - `admin4@autocare.ai`
>
> All seeded admin accounts use the password `ChangeMe123!`.
>
### Reset the database and recreate required collections

```bash
cd backend
npm run db:reset
```

This drops the current database, pushes the Prisma schema, and seeds the default admin user and service center config.

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
