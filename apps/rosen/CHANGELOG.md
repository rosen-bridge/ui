# @rosen-bridge/rosen-app

## 0.5.0

### Minor Changes

- upgrade extractor packages

## 0.4.0

### Minor Changes

- display service and ui versions in the sidebar

### Patch Changes

- fix the floating point number conversion to bigint problem
- upgrade nextjs version
- updated dependencies
  - @rosen-ui/eternl-wallet@0.0.3
  - @rosen-ui/flint-wallet@0.0.3
  - @rosen-ui/lace-wallet@0.0.3
  - @rosen-ui/nami-wallet@0.0.3
  - @rosen-ui/nautilus-wallet@0.0.3
  - @rosen-ui/vespr-wallet@0.0.3

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
