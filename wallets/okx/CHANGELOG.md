# @rosen-ui/okx-wallet

## 2.1.2

### Patch Changes

- Update dependencies
  - @rosen-network/bitcoin@2.4.0
  - @rosen-ui/wallet-api@3.0.4
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/types@0.3.8

## 2.1.1

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/wallet-api@3.0.3
  - @rosen-network/bitcoin@2.3.1
  - @rosen-ui/types@0.3.7

## 2.1.0

### Minor Changes

- Update the `disconnect`, `switchChain`, and `isConnected` methods to align with the latest changes in the wallet abstract class

### Patch Changes

- Update dependency @rosen-ui/wallet-api@3.0.0

## 2.0.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Integrate `BalanceFetchError` handling into the `getBalance` method and update the `Wallet` class to reflect the latest changes in the wallet API, enhancing maintainability
- Refine the `isConnected` logic to maintain the Rosen app's wallet connection during refreshes, eliminating the need for users to manually reconnect
- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-network/bitcoin@2.1.4
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

## 1.3.4

### Patch Changes

- Refactor methods to arrow functions for improved code consistency.
- Updated dependency @rosen-bridge/icons@1.4.0

## 1.3.3

### Patch Changes

- Updated all wallets to inherit from the abstract Wallet class, combining shared core logic with their unique custom behaviors.
- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/wallet-api@1.4.0
  - @rosen-network/bitcoin@2.1.3
  - @rosen-ui/types@0.3.5

## 1.3.2

### Patch Changes

- Improve wallet integrations by adding robust availability checks and gracefully handling unsupported or inaccessible wallets.
- Updated dependencies
  - @rosen-ui/wallet-api@1.3.1
  - @rosen-bridge/icons@1.3.0

## 1.3.1

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package
- Updated dependencies
  - @rosen-bridge/icons@1.2.0
  - @rosen-ui/wallet-api@1.3.0
  - @rosen-network/bitcoin@2.1.2

## 1.3.0

### Minor Changes

- Implement a new method to handle wallet disconnections.

### Patch Changes

- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-network/bitcoin@2.1.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/wallet-api@1.2.1
  - @rosen-ui/types@0.3.4

## 1.2.0

### Minor Changes

- Add a supportedChains feature to display which chains/networks are supported by the wallet

### Patch Changes

- Resolve the issue concerning the detection of the wallet's connection status
- Improve OKXwallet code base by define an interface
- Updated dependencies
  - @rosen-ui/wallet-api@1.2.0
  - @rosen-ui/constants@0.1.0
  - @rosen-network/bitcoin@2.1.0
  - @rosen-ui/types@0.3.3

## 1.1.0

### Minor Changes

- Revise the connect method to align with the Wallet interface, and implement a new method called icConnected to determine whether the application has access to the wallet extension

### Patch Changes

- Convert unknown errors into identifiable ones to ensure consistent error messaging, making it easier to manage errors at higher levels
- Updated dependencies
  - @rosen-ui/wallet-api@1.1.0
  - @rosen-network/bitcoin@2.0.1

## 1.0.0

### Major Changes

- Encapsulate wallet functionalities into a single class following a unified interface to simplify maintenance and enable quick addition of new wallet types by implementing the interface.

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-network/bitcoin@2.0.0

## 0.1.0

### Minor Changes

- Implement the OKX wallet package

### Patch Changes

- Updated the @rosen-bridge/icons@0.7.0 dependency
