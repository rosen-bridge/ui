FROM node:18.12.0 AS builder
WORKDIR /app
COPY package*.json .nvmrc .prettierrc ./
COPY .husky ./.husky
COPY packages ./packages
RUN npm ci 
RUN npm run build --workspace packages/constants 
RUN npm run build --workspace packages/types 
RUN npm run build --workspace packages/utils 
RUN npm run build --workspace packages --if-present

FROM builder AS watcher-builder
COPY apps/watcher ./apps/watcher
RUN npm ci
WORKDIR /app/apps/watcher
RUN npm run build

FROM builder AS guard-builder
COPY apps/guard ./apps/guard
RUN npm ci
WORKDIR /app/apps/guard
RUN npm run build

FROM nginx:1.25 AS watcher
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of watcher owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY --from=watcher-builder /app/apps/watcher/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=watcher
ENV SERVICE_PORT=3000
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM nginx:1.25 AS guard
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of guard owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY --from=guard-builder /app/apps/guard/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=guard
ENV SERVICE_PORT=8080
ENTRYPOINT ["bash", "entrypoint.sh"]
