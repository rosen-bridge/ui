FROM node:18.12.0 AS builder
WORKDIR /app
COPY . .
RUN npm ci 
RUN npm run build --workspace packages/constants \
    && npm run build --workspace packages/types \
    && npm run build --workspace packages/utils \
    && npm run build --workspace packages --if-present
ARG SERVER_NAME
ARG SERVER_PORT
RUN sed -i 's/SERVER_NAME_PLACEHOLDER/'"$SERVER_NAME"'/g' nginx.conf \
    && sed -i 's/SERVER_PORT_PLACEHOLDER/'"$SERVER_PORT"'/g' nginx.conf

FROM builder AS watcher-builder
WORKDIR /app/apps/watcher
RUN npm run build

FROM builder AS guard-builder
WORKDIR /app/apps/guard
RUN npm run build

FROM nginx:stable-alpine3.17 AS watcher
COPY --from=watcher-builder /app/apps/watcher/out/ /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT ["nginx", "-g","daemon off;"]

FROM nginx AS ts-guard
COPY --from=guard-builder /app/apps/guard/out/ /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf
ENTRYPOINT ["nginx", "-g","daemon off;"]
