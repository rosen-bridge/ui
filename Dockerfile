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
