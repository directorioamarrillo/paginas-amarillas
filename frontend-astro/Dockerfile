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

# Servidor custom que escucha en 0.0.0.0 explícitamente
COPY frontend-astro/server.mjs ./server.mjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Arrancar con servidor custom (NO con entry.mjs de Astro directamente)
CMD ["node", "./server.mjs"]
