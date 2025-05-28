#!/bin/bash

# A temporary script for building rosen app inside vercel, due to vercel
# character limitation for build command
# This file should be removed when #24 is implemented


# Default app is default if not specified
APP=${1:-default}

echo "building monorepo packages for app '$APP' ..."


if [ "$APP" == "rosen-service" ]; then
  npm run build --workspace packages/constants
  npm run build --workspace packages/asset-calculator
fi

if [ "$APP" == "guard" ] || [ "$APP" == "watcher" ] ||  [ "$APP" == "rosen" ] ||  [ "$APP" == "default" ]; then
  npm run build --workspace packages/constants
  npm run build --workspace packages/types
  npm run build --workspace packages/utils
  npm run build --workspace packages/icons
  npm run build --workspace packages/swr-helpers
  npm run build --workspace packages/swr-mock
  npm run build --workspace packages/ui-kit
fi

if [ "$APP" == "rosen" ] || [ "$APP" == "default" ]; then
  npm run build --workspace packages/asset-calculator
  npm run build --workspace wallets/wallet-api
  npm run build --workspace networks/base
  npm run build --workspace networks/evm
  npm run build --workspace networks/binance
  npm run build --workspace networks/bitcoin
  npm run build --workspace networks/doge
  npm run build --workspace networks/cardano
  npm run build --workspace networks/ergo
  npm run build --workspace networks/ethereum
  npm run build --workspace wallets/eternl
  npm run build --workspace wallets/lace
  npm run build --workspace wallets/metamask
  npm run build --workspace wallets/nautilus
  npm run build --workspace wallets/okx
  npm run build --workspace wallets/my-doge
  npm run build --workspace wallets/xverse
  npm run build --workspace wallets/wallet-connect
fi

if [ "$APP" == "public-status" ] || [ "$APP" == "default" ]; then
  npm run build --workspace packages/public-status-logic
fi

# Check if Discord webhook URL is set
if [ -z "$DISCORD_NOTIFICATION_WEBHOOK_URL" ]; then
  echo "Discord webhook URL not set. Skipping notification."
  exit 0
fi

# Prepare the embed JSON
JSON_PAYLOAD=$(cat <<EOF
{
  "embeds": [
    {
      "title": "🚀 New Deployment Notification",
      "color": 3447003,
      "description": "A new deployment has been triggered on **Vercel**.",
      "fields": [
        {
          "name": "📱 App",
          "value": "${APP}",
          "inline": false
        },
        {
          "name": "🌍 Branch URL",
          "value": "$([ -n "$VERCEL_BRANCH_URL" ] && echo "[$VERCEL_BRANCH_URL](https://$VERCEL_BRANCH_URL)" || echo "N/A")",
          "inline": false
        },
        {
          "name": "📜 Commit Message",
          "value": "${VERCEL_GIT_COMMIT_MESSAGE:-N/A}",
          "inline": false
        },
        {
          "name": "🔖 Commit Ref",
          "value": "${VERCEL_GIT_COMMIT_REF:-N/A}",
          "inline": false
        }
      ],
      "timestamp": "$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    }
  ]
}
EOF
)

# Send the message via Discord webhook
curl -X POST \
     -H "Content-Type: application/json" \
     -d "$JSON_PAYLOAD" \
     "$DISCORD_NOTIFICATION_WEBHOOK_URL"

echo "Discord notification sent!"
