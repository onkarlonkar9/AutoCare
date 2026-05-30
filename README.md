# AutoCare AI

Vehicle maintenance and workshop management platform.

## Architecture

- Frontend: React, TypeScript, and Vite, served by Nginx
- Backend: Express, TypeScript, and Prisma
- Database: MongoDB Atlas
- Browser API path in containers: `/api`, proxied by Nginx to the backend

## Run With Docker Compose

1. Create your local environment file:

   ```sh
   cp .env.example .env
   ```

2. Set `DATABASE_URL` and a long random `JWT_SECRET` in `.env`.

3. Build and start the stack:

   ```sh
   docker compose up --build -d
   ```

4. Open `http://localhost:8080`.

Useful checks:

```sh
docker compose ps
docker compose logs -f
curl http://localhost:8080/health
curl http://localhost:4000/health
```

Uploaded files are stored in the named Docker volume `uploads`. The backend
connects to MongoDB Atlas; Compose does not run a local database.

## Container Configuration

- `FRONTEND_PORT`: host port for the frontend, default `8080`
- `BACKEND_PORT`: host port for direct backend access, default `4000`
- `VITE_API_URL`: frontend build-time API path, default `/api`
- `DATABASE_URL`: required MongoDB Atlas connection string
- `JWT_SECRET`: required authentication signing secret
- `CORS_ORIGIN`: allowed browser origin, default `http://localhost:8080`

The Compose setup uses non-root containers, health checks, read-only root
filesystems, dropped Linux capabilities, restart policies, deterministic npm
installs, and a persistent uploads volume.

## AWS Load Balancing And Autoscaling

The [`terraform`](terraform/README.md) directory contains an AWS Application
Load Balancer and Auto Scaling Group deployment. It starts with two instances,
scales between two and four based on CPU usage, and reads runtime secrets from
AWS Systems Manager Parameter Store.

## Local Development

```sh
npm run install:frontend
npm run install:backend
npm run backend:prisma:generate
npm run dev:frontend
npm run dev:backend
```

## Build And Test

```sh
npm run build:frontend
npm run build:backend
npm run test:frontend
npm run lint:frontend
```
