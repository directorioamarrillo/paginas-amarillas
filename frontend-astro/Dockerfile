FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY frontend-astro/package*.json frontend-astro/
RUN cd frontend-astro && npm install

COPY frontend-astro frontend-astro/
RUN cd frontend-astro && npm run build

FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache dumb-init
COPY --from=builder /app/frontend-astro/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["node", "dist/server/entry.mjs"]
