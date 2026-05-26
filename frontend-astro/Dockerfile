# ---- Build stage ----
FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app

COPY frontend-astro/package*.json frontend-astro/
RUN cd frontend-astro && npm install

COPY frontend-astro frontend-astro/

# PUBLIC_BACKEND_URL se pasa como build arg para que Astro lo incluya en el bundle
ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=${PUBLIC_BACKEND_URL}

RUN cd frontend-astro && npm run build

# ---- Production stage ----
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app/frontend-astro/dist ./dist
COPY --from=builder /app/frontend-astro/node_modules ./node_modules
COPY --from=builder /app/frontend-astro/package.json ./
COPY frontend-astro/server.mjs ./server.mjs

ENV NODE_ENV=production
# NO fijar PORT aquí - Railway inyecta el suyo y enruta a él

EXPOSE 3000

CMD ["node", "./server.mjs"]
