# @rosen-ui/okx-wallet

## 1.3.3

### Patch Changes

- Temporarily fix the generateTxParameters function for EVM networks
- Updated dependencies
  - @rosen-ui/wallet-api@1.3.2
  - @rosen-network/bitcoin@2.1.3
  - @rosen-bridge/icons@1.3.1

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
