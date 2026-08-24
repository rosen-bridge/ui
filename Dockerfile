FROM nginx:stable AS watcher
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of watcher owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY ./apps/watcher/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=service
ENV SERVICE_PORT=3000
ENV APP_NAME=watcher
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
ENV APP_NAME=guard
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM node:22.18 AS prepare
WORKDIR /app
COPY . .
RUN --mount=type=cache,target=/root/.npm npm i -g npm@11.6.2
RUN --mount=type=cache,target=/root/.npm npm install turbo --no-save --ignore-scripts --no-package-lock
RUN npm exec -- turbo prune @rosen-bridge/rosen-service --docker

FROM node:22.18 AS builder
WORKDIR /app
RUN --mount=type=cache,target=/root/.npm npm i -g npm@11.6.2
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/package-lock.json ./package-lock.json
RUN --mount=type=cache,target=/root/.npm npm install
COPY --from=prepare /app/out/full/ .
RUN npm run bootstrap --workspace=@rosen-bridge/rosen-service && \
    mkdir -p /tmp/dist && \
    find . -type d -name "dist" -not -path "*/node_modules/*" -exec cp --parents -r {} /tmp/dist/ \;

FROM node:22.18 AS rosen-service
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the rosen-service owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
RUN adduser --disabled-password --home /app --gecos "ErgoPlatform" ergo && \
    install -m 0740 -o ergo -g ergo -d /app/apps/rosen-service/logs \
    && chown -R ergo:ergo /app/ && umask 0077

RUN --mount=type=cache,target=/root/.npm npm i -g npm@11.6.2
WORKDIR /app

COPY --from=prepare --chown=ergo:ergo /app/out/package-lock.json ./package-lock.json
COPY --from=prepare --chown=ergo:ergo /app/out/full/ .
COPY --from=builder --chown=ergo:ergo /tmp/dist/ .
RUN --mount=type=cache,target=/root/.npm HUSKY=0 npm install --omit=dev

USER ergo
WORKDIR  /app/apps/rosen-service/
ENTRYPOINT ["npm", "run", "start"]
