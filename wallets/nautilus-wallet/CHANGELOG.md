# @rosen-ui/nautilus-wallet

## 1.0.1

### Patch Changes

- Updated the @rosen-bridge/icons@0.6.0 dependency

## 1.0.0

### Major Changes

- Change the output type of the `getBalance` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types

## 0.2.0

### Minor Changes

- Include the specific global type declaration.

### Patch Changes

- Updated dependencies
  - @rosen-network/ergo@0.1.2
  - @rosen-ui/wallet-api@1.0.2

## 0.1.1

### Patch Changes

- Package the Bitcoin/Ergo logic as a standalone module to ensure its independence and maintainability.
- Updated dependencies
  - @rosen-network/ergo@0.1.1

## 0.1.0

### Minor Changes

- Add `getAddress` public API for accessing current wallet address

### Patch Changes

- Refactor the Nautilus wallet logic to reside within its own package
- Updated dependencies
  - @rosen-ui/wallet-api@1.0.0

## 0.0.4

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@0.4.0

## 0.0.3

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@0.3.0

## 0.3.0

### Minor Changes

- Set a maximum page size of 100 for events api
- Use the shared hooks package instead of utils package to prevent server component problems

### Patch Changes

- Fix app crash when a token fetched from database is not found
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
