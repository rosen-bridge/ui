#!/bin/bash

sed -i 's/SERVER_NAME_PLACEHOLDER/'"$SERVICE_NAME"'/g' /etc/nginx/nginx.conf
sed -i 's/SERVER_PORT_PLACEHOLDER/'"$SERVICE_PORT"'/g' /etc/nginx/nginx.conf
sed -i 's/HOSTNAME/'"$HOSTNAME"'/g' /etc/nginx/nginx.conf

if [ "$APP_NAME" = "guard" ]; then
    sed -i 's@# GUARD_RESTRICTIONS_PLACEHOLDER@location ~ ^/api/(p2p|tss)(/|$) { return 403; }@' /etc/nginx/nginx.conf
else
    sed -i '/# GUARD_RESTRICTIONS_PLACEHOLDER/d' /etc/nginx/nginx.conf
fi

exec nginx -g "daemon off;"
