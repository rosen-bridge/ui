FROM nginx:1.25 AS watcher
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of watcher owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY ./apps/watcher/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=service
ENV SERVICE_PORT=3000
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM nginx:1.25 AS guard
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the front-end of guard owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
COPY ./apps/guard/out/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh ./
ENV SERVICE_NAME=service
ENV SERVICE_PORT=8080
ENTRYPOINT ["bash", "entrypoint.sh"]

FROM node:22.18 AS rosen-service
LABEL maintainer="rosen-bridge team <team@rosen.tech>"
LABEL description="Docker image for the rosen-service owned by rosen-bridge organization."
LABEL org.label-schema.vcs-url="https://github.com/rosen-bridge/ui"
RUN adduser --disabled-password --home /app --gecos "ErgoPlatform" ergo && \
    install -m 0740 -o ergo -g ergo -d /app/apps/rosen-service/logs \
    && chown -R ergo:ergo /app/ && umask 0077

RUN npm i -g npm@11.6.2
WORKDIR /app
COPY package* ./
COPY apps/rosen-service/package.json ./apps/rosen-service/
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . /app
RUN ./build.sh rosen-service
USER ergo
WORKDIR  /app/apps/rosen-service/
ENTRYPOINT ["npm", "run", "start"]
