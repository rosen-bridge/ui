FROM nginx:stable AS watcher
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of watcher owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY ./apps/watcher/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=service
ENV SERVICE_PORT=3000
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM nginx:stable AS guard
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of guard owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY ./apps/guard/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=service
ENV SERVICE_PORT=8080
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM node:22.18 AS builder
WORKDIR /app
COPY . .
RUN npx turbo prune @rosen-bridge/rosen-service --docker

FROM node:22.18 AS rosen-service
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the rosen-service owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
RUN adduser --disabled-password --home /app --gecos "ErgoPlatform" ergo && \
    install -m 0740 -o ergo -g ergo -d /app/apps/rosen-service/logs \
    && chown -R ergo:ergo /app/ && umask 0077

RUN npm i -g npm@11.6.2
WORKDIR /app

COPY --from=builder --chown=ergo:ergo /app/out/json/ .
COPY --from=builder --chown=ergo:ergo /app/tsconfig.json .
COPY --from=builder --chown=ergo:ergo /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm HUSKY=0 npm install

COPY --from=builder --chown=ergo:ergo /app/out/full/ .
RUN npm run bootstrap --workspace=@rosen-bridge/rosen-service
USER ergo
WORKDIR  /app/apps/rosen-service/
ENTRYPOINT ["npm", "run", "start"]
