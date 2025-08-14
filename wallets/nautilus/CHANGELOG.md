# @rosen-ui/nautilus-wallet

## 3.1.1

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/wallet-api@3.0.3
  - @rosen-ui/types@0.3.7
  - @rosen-network/ergo@2.4.1

## 3.1.0

### Minor Changes

- Update the `disconnect`, `switchChain`, and `isConnected` methods to align with the latest changes in the wallet abstract class

### Patch Changes

- Import network types directly from the network package instead of importing them from `@rosen-ui/wallet-api`
- Update dependencies
  - @rosen-network/ergo@2.2.0
  - @rosen-ui/wallet-api@3.0.0

## 3.0.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Integrate `BalanceFetchError` handling into the `getBalance` method and update the `Wallet` class to reflect the latest changes in the wallet API, enhancing maintainability
- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-bridge/tokens@3.1.1
  - @rosen-network/ergo@2.1.3
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

## 2.3.4

### Patch Changes

- Refactor methods to arrow functions for improved code consistency.
- Updated dependency @rosen-bridge/icons@1.4.0

## 2.3.3

### Patch Changes

- Updated all wallets to inherit from the abstract Wallet class, combining shared core logic with their unique custom behaviors.
- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/wallet-api@1.4.0
  - @rosen-ui/utils@0.5.0
  - @rosen-ui/types@0.3.5

## 2.3.2

### Patch Changes

- Improve wallet integrations by adding robust availability checks and gracefully handling unsupported or inaccessible wallets.
- Updated dependencies
  - @rosen-ui/wallet-api@1.3.1
  - @rosen-bridge/icons@1.3.0

## 2.3.1

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package
- Handle the `ConnectionTimeoutError` exception during the connection process
- Updated dependencies
  - @rosen-bridge/icons@1.2.0
  - @rosen-ui/wallet-api@1.3.0
  - @rosen-network/ergo@2.1.2

## 2.3.0

### Minor Changes

- Implement a new method to handle wallet disconnections.

### Patch Changes

- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-network/ergo@2.1.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/wallet-api@1.2.1
  - @rosen-ui/types@0.3.4
  - @rosen-ui/utils@0.4.5

## 2.2.0

### Minor Changes

- Add a supportedChains feature to display which chains/networks are supported by the wallet

### Patch Changes

- Updated dependencies
  - @rosen-ui/wallet-api@1.2.0
  - @rosen-ui/constants@0.1.0
  - @rosen-network/ergo@2.1.0
  - @rosen-ui/types@0.3.3
  - @rosen-ui/utils@0.4.4

## 2.1.0

### Minor Changes

- Revise the connect method to align with the Wallet interface, and implement a new method called icConnected to determine whether the application has access to the wallet extension

### Patch Changes

- Convert unknown errors into identifiable ones to ensure consistent error messaging, making it easier to manage errors at higher levels
- Updated dependency @rosen-ui/wallet-api@1.1.0

## 2.0.0

### Major Changes

- Encapsulate wallet functionalities into a single class following a unified interface to simplify maintenance and enable quick addition of new wallet types by implementing the interface.

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-network/ergo@2.0.0

## 1.0.3

### Patch Changes

- Fix missing dependencies and remove unused packages
- Updated the @rosen-ui/utils@0.4.2 dependency

## 1.0.2

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration
- Updated the @rosen-bridge/icons@0.7.0 dependency

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
