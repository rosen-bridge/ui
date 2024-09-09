#!/bin/bash

# A temporary script for building rosen app inside vercel, due to vercel
# character limitation for build command
# This file should be removed when #24 is implemented

echo "building monorepo packages..."

npm run build --workspace packages/utils
npm run build --workspace packages/constants
npm run build --workspace packages/types
npm run build --workspace packages/shared-contexts
npm run build --workspace packages --if-present
npm run build --workspace wallets/wallet-api
npm run build --workspace networks/bitcoin
npm run build --workspace networks/cardano
npm run build --workspace networks/ergo
npm run build --workspace wallets/nami-wallet
npm run build --workspace wallets/lace-wallet
npm run build --workspace wallets/metamask-wallet
npm run build --workspace wallets/eternl-wallet
npm run build --workspace wallets/flint-wallet
npm run build --workspace wallets/vespr-wallet
npm run build --workspace wallets/nautilus-wallet
npm run build --workspace wallets/xdefi-wallet
