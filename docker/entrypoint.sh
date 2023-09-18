#!/bin/bash

sed -i 's/SERVER_NAME_PLACEHOLDER/'"$SERVICE_NAME"'/g' /etc/nginx/nginx.conf
sed -i 's/SERVER_PORT_PLACEHOLDER/'"$SERVICE_PORT"'/g' /etc/nginx/nginx.conf
sed -i 's/HOSTNAME/'"$HOSTNAME"'/g' /etc/nginx/nginx.conf

exec nginx -g "daemon off;"
