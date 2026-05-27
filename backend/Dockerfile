# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY backend/package.json backend/
WORKDIR /app/backend
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app/backend
COPY --from=deps /app/backend/node_modules ./node_modules
COPY package.json ../package.json
COPY backend/package.json ./package.json
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/prisma ./prisma
COPY backend/src ./src
RUN npm run prisma:generate
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app/backend
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/node_modules ./node_modules
COPY backend/uploads ./uploads
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/server.js"]
