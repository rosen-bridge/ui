# @rosen-network/bitcoin

## 1.0.1

### Patch Changes

- Updated the @rosen-ui/constants@0.0.5 dependency

## 1.0.0

### Major Changes

- Update the input parameter of the `generateUnsignedTx` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Enhance the generateUnsignedTx utility functions within the networks package
- update address-codec package
- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Add the tokenMap configuration to the wallet creator's setup.

## 0.2.0

### Minor Changes

- Setup test environment and add unit tests.

### Patch Changes

- Eliminate unnecessary global type declarations.
- Update the usage of the Network's constant
- Updated dependencies
  - @rosen-ui/constants@0.0.3
  - @rosen-ui/wallet-api@1.0.2

## 0.1.1

### Patch Changes

- Package the Bitcoin/Ergo logic as a standalone module to ensure its independence and maintainability.
