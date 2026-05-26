FROM node:22-alpine AS builder
WORKDIR /app/frontend-astro
COPY frontend-astro/package*.json ./
RUN npm ci

COPY frontend-astro . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/frontend-astro/dist ./dist
COPY --from=builder /app/frontend-astro/package*.json ./

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "dist/server/entry.mjs"]
