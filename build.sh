#!/bin/bash

# A temporary script for building rosen app inside vercel, due to vercel
# character limitation for build command
# This file should be removed when #24 is implemented

echo "building monorepo packages..."

npm run build --workspace packages/constants
npm run build --workspace packages/types
npm run build --workspace packages/utils
npm run build --workspace packages/public-status-logic
npm run build --workspace packages --if-present
npm run build --workspace wallets/wallet-api
npm run build --workspace networks/base
npm run build --workspace networks/evm
npm run build --workspace networks/binance
npm run build --workspace networks/bitcoin
npm run build --workspace networks/cardano
npm run build --workspace networks/ergo
npm run build --workspace networks/ethereum
npm run build --workspace wallets/eternl
npm run build --workspace wallets/lace
npm run build --workspace wallets/metamask
npm run build --workspace wallets/nautilus
npm run build --workspace wallets/okx
