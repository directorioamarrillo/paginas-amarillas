# ---- Build stage ----
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY frontend-astro/package*.json frontend-astro/
RUN cd frontend-astro && npm install

COPY frontend-astro frontend-astro/
RUN cd frontend-astro && npm run build

# ---- Production stage ----
FROM node:22-alpine
WORKDIR /app

# Copiar artefactos del build
COPY --from=builder /app/frontend-astro/dist ./dist
COPY --from=builder /app/frontend-astro/node_modules ./node_modules
COPY --from=builder /app/frontend-astro/package.json ./

# Script de arranque que fuerza binding a 0.0.0.0
COPY frontend-astro/start.mjs ./start.mjs

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

# Usar start.mjs para parchear el binding antes de arrancar Astro
CMD ["node", "./start.mjs"]
