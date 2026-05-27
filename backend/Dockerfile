# syntax=docker/dockerfile:1
FROM node:20-bullseye-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
WORKDIR /app/backend
RUN npm install

FROM node:20-bullseye-slim AS build
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY package.json ../package.json
COPY backend/package.json ./package.json
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/prisma ./prisma
COPY backend/src ./src
RUN npm run prisma:generate
RUN npm run build

FROM node:20-bullseye-slim AS runtime
WORKDIR /app/backend
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
RUN apt-get update && apt-get install -y openssl libssl1.1 && rm -rf /var/lib/apt/lists/*
COPY backend/uploads ./uploads
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
