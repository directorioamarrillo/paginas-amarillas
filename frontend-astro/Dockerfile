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

# Copy built output from builder
COPY --from=builder /app/frontend-astro/dist ./dist
COPY --from=builder /app/frontend-astro/node_modules ./node_modules
COPY --from=builder /app/frontend-astro/package.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "./dist/server/entry.mjs"]
