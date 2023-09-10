FROM node:18.12.0 AS builder
WORKDIR /app
COPY . .
RUN npm ci 
RUN npm run build --workspace packages/constants \
    && npm run build --workspace packages/types \
    && npm run build --workspace packages/utils \
    && npm run build --workspace packages --if-present

FROM builder AS watcher-builder
WORKDIR /app/apps/watcher
RUN npm run build

FROM builder AS guard-builder
WORKDIR /app/apps/guard
RUN npm run build

FROM nginx:1.25 AS watcher
COPY --from=watcher-builder /app/apps/watcher/out/ /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/entrypoint.sh ./
ENV SERVICE_NAME=watcher
ENV SERVICE_PORT=3000
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM nginx:1.25 AS guard
COPY --from=guard-builder /app/apps/guard/out/ /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/entrypoint.sh ./
ENV SERVICE_NAME=guard
ENV SERVICE_PORT=8080
ENTRYPOINT ["bash", "entrypoint.sh"]
