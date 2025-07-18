# @rosen-ui/wallet-api

## 3.0.0

### Major Changes

- Remove support for `Ergo` and `Cardano` network types and utilities, and relocate them to their respective packages
- Enhance the wallet abstract class to ensure its methods are securely callable

## 2.0.0

### Major Changes

- Enhance the abstract class named `Wallet` by simplifying and optimizing the `transfer`, `currentNetwork`, `connect`, `getAddress`, and `getBalance` methods to reduce code duplication and improve maintainability

### Patch Changes

- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Add a new error named `BalanceFetchError` for use during wallet balance retrieval, and update the method signature to prevent duplicate implementations of the `getBalance` method.
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-ui/utils@0.6.0
  - @rosen-ui/types@0.3.6

## 1.4.0

### Minor Changes

- Add the fromChain field to the wallet-api and fix the generateTxParameters function on EVM networks.
- Convert the Wallet from an interface to an abstract class to provide shared functionality while supporting different wallet implementations.

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.5.0
  - @rosen-ui/types@0.3.5

## 1.3.1

### Patch Changes

- Implement proper error to ensure graceful failure when the wallet API is unavailable.

## 1.3.0

### Minor Changes

- Define an error named `ConnectionTimeoutError` to handle connection timeouts for wallet extensions

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package

## 1.2.1

### Patch Changes

- Standardize tsconfig.json file and eliminate the src directory from the output path
- Implement proper error to manage rejection cases during the disconnection process.
- Updated dependencies
  - @rosen-ui/types@0.3.4
  - @rosen-ui/utils@0.4.5

## 1.2.0

### Minor Changes

- Add a supportedChains feature to display which chains/networks are supported by the wallet

### Patch Changes

- Updated dependencies
  - @rosen-ui/types@0.3.3
  - @rosen-ui/utils@0.4.4

## 1.1.0

### Minor Changes

- Implement standardized error messages for wallets to centralize and streamline error reporting
- Implement the isConnected method to verify whether the connection to the wallet extension is established
- Implement the custom error class named CurrentChainError
- Integrate the identified errors for use in wallets
- Introduce a utility to normalize errors and ensure consistency across all custom error classes

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
