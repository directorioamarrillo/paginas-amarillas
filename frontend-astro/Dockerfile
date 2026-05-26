FROM node:22-alpine AS builder
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY frontend-astro/package*.json frontend-astro/
RUN cd frontend-astro && npm install

COPY frontend-astro frontend-astro/
RUN cd frontend-astro && npm run build

FROM nginx:alpine
COPY --from=builder /app/frontend-astro/dist /usr/share/nginx/html
COPY frontend-astro/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
