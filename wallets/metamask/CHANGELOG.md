# @rosen-ui/metamask-wallet

## 2.0.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Integrate `BalanceFetchError` handling into the `getBalance` method and update the `Wallet` class to reflect the latest changes in the wallet API, enhancing maintainability
- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-bridge/tokens@3.1.1
  - @rosen-network/ethereum@0.2.4
  - @rosen-network/binance@0.2.4
  - @rosen-network/evm@0.3.1
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

## 1.4.1

### Patch Changes

- Refactor methods to arrow functions for improved code consistency.
- Updated dependency @rosen-bridge/icons@1.4.0

## 1.4.0

### Minor Changes

- Add the fromChain field to the wallet-api and fix the generateTxParameters function on EVM networks.

### Patch Changes

- Updated all wallets to inherit from the abstract Wallet class, combining shared core logic with their unique custom behaviors.
- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/wallet-api@1.4.0
  - @rosen-network/evm@0.3.0
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
  - @rosen-network/evm@0.2.2

## 1.3.0

### Minor Changes

- Implement a new method to handle wallet disconnections.

### Patch Changes

- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-network/evm@0.2.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/wallet-api@1.2.1
  - @rosen-ui/types@0.3.4

## 1.2.0

### Minor Changes

- Add a supportedChains feature to display which chains/networks are supported by the wallet

### Patch Changes

- Revise the utilization of the networks Id
- Updated dependencies
  - @rosen-ui/wallet-api@1.2.0
  - @rosen-ui/constants@0.1.0
  - @rosen-network/evm@0.2.0
  - @rosen-ui/types@0.3.3

## 1.1.0

### Minor Changes

- Revise the connect method to align with the Wallet interface, and implement a new method called icConnected to determine whether the application has access to the wallet extension
- Improve MetamaskWallet class to support all EVM chains

### Patch Changes

- Convert unknown errors into identifiable ones to ensure consistent error messaging, making it easier to manage errors at higher levels
- Resolve the issue of retrieving balances across multiple chains based on the current chain
- Updated dependency @rosen-ui/wallet-api@1.1.0

## 1.0.0

### Major Changes

- Encapsulate wallet functionalities into a single class following a unified interface to simplify maintenance and enable quick addition of new wallet types by implementing the interface.

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-network/ethereum@1.0.0

## 0.1.4

### Patch Changes

- Fix missing dependencies and remove unused packages

## 0.1.3

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration
- Updated the @rosen-bridge/icons@0.7.0 dependency

## 0.1.2

### Patch Changes

- Updated the @rosen-bridge/icons@0.6.0 dependency

## 0.1.1

### Patch Changes

- Implement the MetaMask wallet package.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Address the issue related to retrieving the token balance in Ethereum
