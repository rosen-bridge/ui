#!/bin/bash

# A temporary script for building rosen app inside vercel, due to vercel
# character limitation for build command
# This file should be removed when #24 is implemented

cd ../..

echo "building monorepo packages..."

npm run build --workspace packages/utils
npm run build --workspace packages/constants
npm run build --workspace packages/types
npm run build --workspace packages/shared-contexts
npm run build --workspace packages --if-present
npm run build --workspace wallets/wallet-api
npm run build --workspace wallets/nami-wallet
npm run build --workspace wallets/nautilus-wallet

cd apps/rosen

npm run build
