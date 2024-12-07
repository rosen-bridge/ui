# @rosen-ui/xdefi-wallet

## 1.0.3

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration
- Updated dependencies
  - @rosen-bridge/icons@0.7.0
  - @rosen-network/bitcoin@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies
  - @rosen-ui/constants@0.0.5
  - @rosen-network/bitcoin@1.0.1

## 1.0.1

### Patch Changes

- Updated the @rosen-bridge/icons@0.6.0 dependency

## 1.0.0

### Major Changes

- Modify the `transferCreator` function parameter to accept `WRAPPED-VALUE`.
- Change the output type of the `getBalance` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Revise the wallet creation logic and update the access type for each API.
- Remove redundant package dependency
- Strengthen type safety and enforce robust typing for Chain and Network types

## 0.4.0

### Minor Changes

- Include the specific global type declaration.

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.3.0
  - @rosen-network/bitcoin@0.2.0
  - @rosen-ui/constants@0.0.3
  - @rosen-ui/wallet-api@1.0.2

## 0.3.2

### Patch Changes

- Package the Bitcoin/Ergo logic as a standalone module to ensure its independence and maintainability.
- Updated dependencies
  - @rosen-network/bitcoin@0.1.1

## 0.3.1

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.2.0
  - @rosen-ui/wallet-api@1.0.1

## 0.3.0

### Minor Changes

- Add `getAddress` public API for accessing current wallet address

### Patch Changes

- Updated dependencies
  - @rosen-ui/wallet-api@1.0.0

## 0.2.1

### Patch Changes

- Refactor the xdefi-wallet package to encapsulate the logic in its package
- Updated dependencies
  - @rosen-ui/constants@0.0.2
  - @rosen-ui/utils@0.1.2

## 0.2.0

### Minor Changes

- Export some types from sats-connect

### Patch Changes

- Export AddressType from sats-connect lib
- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-ui/utils@0.1.1

## 0.1.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@0.3.0
