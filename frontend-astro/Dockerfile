FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++ 
WORKDIR /app/frontend-astro
COPY frontend-astro/package*.json ./
RUN npm install

COPY frontend-astro .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/frontend-astro/dist ./dist
COPY --from=builder /app/frontend-astro/package*.json ./
COPY --from=builder /app/frontend-astro/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

EXPOSE 3000

CMD ["node", "dist/server/entry.mjs"]
