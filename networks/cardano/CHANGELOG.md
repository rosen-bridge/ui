# @rosen-network/cardano

## 2.2.0

### Minor Changes

- Add relevant `constants`, `types`, and `utility` functions related to the context, as defined in the `@rosen-ui/wallet-api` package

### Patch Changes

- Update dependency @rosen-bridge/icons@2.1.0

## 2.1.4

### Patch Changes

- Optimize the structure to enhance compatibility with wallet packages and streamline usage within the Rosen App
- Update dependencies
  - @rosen-bridge/icons@2.0.0
  - @rosen-bridge/tokens@3.1.1
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

## 2.1.3

### Patch Changes

- Temporary fix for transaction fee calculation

## 2.1.2

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package

## 2.1.1

### Patch Changes

- Update server functions to work with the asynchronously loaded token map
- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability

## 2.1.0

### Minor Changes

- Encapsulate the network context within a class to enhance maintainability and simplify future modifications
- Define the getMaxTransfer function to enhance maintainability and achieve better encapsulation

## 2.0.0

### Major Changes

- Eliminate the reliance on the @rosen-ui/wallet-api package and remove any unrelated type definitions

## 1.0.1

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration

## 1.0.0

### Major Changes

- Update the input parameter of the `generateUnsignedTx` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Enhance the generateUnsignedTx utility functions within the networks package
- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Add the tokenMap configuration to the wallet creator's setup.

## 0.1.1

### Patch Changes

- Package the Cardano logic as a standalone module to ensure its independence and maintainability.
