# @rosen-ui/wallet-api

## 1.0.3

### Patch Changes

- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.3.0

## 1.0.1

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.2.0

## 1.0.0

### Major Changes

- Add mandatory `getAddress` to `Wallet` interface, with the purpose of returning the address associated with current wallet

## 0.3.0

### Minor Changes

- set a maximum page size of 100 for events api
- use the shared hooks package instead of utils package to prevent server component problems

### Patch Changes

- fix app crash when a token fetched from database is not found
- Update dependencies
  - @rosen-ui/common-hooks@0.1.0
  - @rosen-ui/utils@0.1.0
  - @rosen-ui/eternl-wallet@0.0.2
  - @rosen-ui/flint-wallet@0.0.2
  - @rosen-ui/lace-wallet@0.0.2
  - @rosen-ui/nami-wallet@0.0.2
  - @rosen-ui/nautilus-wallet@0.0.2
  - @rosen-ui/vespr-wallet@0.0.2
  - @rosen-ui/wallet-api@0.0.2

## 0.2.1

### Patch Changes

- Fix issue with wallet index when having multiple wallets

## 0.2.0

### Minor Changes

- Add multi-wallet support ([@Mercurial](https://github.com/Mercurial))
- Add Eternl, Flint and Lace wallets for Cardano chain ([@Mercurial](https://github.com/Mercurial))
