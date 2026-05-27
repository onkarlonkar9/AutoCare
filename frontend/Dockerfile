# syntax=docker/dockerfile:1
FROM node:20-alpine AS deps
WORKDIR /app
COPY frontend/package.json ./
RUN npm install

FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:4000/api
ENV VITE_API_URL=${VITE_API_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY frontend .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
