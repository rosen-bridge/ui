# @rosen-network/ergo

## 2.4.0

### Minor Changes

- Implement the `calculateFee` utility function to compute transaction fees
- Implement the `getMinTransferCreator` utility function to get min transfer amount

### Patch Changes

- Update dependency @rosen-network/base@0.4.0

## 2.3.0

### Minor Changes

- Add a public method named `validateAddress` to the Network class to validate network addresses

### Patch Changes

- Resolve the `Not enough assets` error on the Ergo network
- Update dependencies
  - @rosen-network/base@0.3.0
  - @rosen-bridge/icons@2.3.0

## 2.2.1

### Patch Changes

- Update the @rosen-bridge/ergo-box-selection@1.1.1 dependency
- Fix min box value for the ErgoBoxSelection
- Update dependency @rosen-bridge/icons@2.2.0

## 2.2.0

### Minor Changes

- Add relevant `types` related to the context, as defined in the `@rosen-ui/wallet-api` package

### Patch Changes

- Resolve the issue concerning the maximum number of tokens allowed in an Ergo Box
- Fix invalid transaction generation bug due to wrong ERG value in change box
- Update dependency @rosen-bridge/icons@2.1.0

## 2.1.3

### Patch Changes

- Optimize the structure to enhance compatibility with wallet packages and streamline usage within the Rosen App
- Update dependencies
  - @rosen-bridge/icons@2.0.0
  - @rosen-bridge/tokens@3.1.1
  - @rosen-clients/ergo-explorer@1.1.5
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

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

## 1.0.0

### Major Changes

- Update the input parameter of the `generateUnsignedTx` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Enhance the generateUnsignedTx utility functions within the networks package
- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Add the tokenMap configuration to the wallet creator's setup.

## 0.1.2

### Patch Changes

- Eliminate unnecessary global type declarations.
- Updated dependencies
  - @rosen-ui/wallet-api@1.0.2

## 0.1.1

### Patch Changes

- Package the Bitcoin/Ergo logic as a standalone module to ensure its independence and maintainability.
