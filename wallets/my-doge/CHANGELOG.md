# @rosen-ui/my-doge-wallet

## 1.1.5

### Patch Changes

- Update dependencies
  - @rosen-ui/types@0.4.0
  - @rosen-network/doge@0.4.1
  - @rosen-ui/wallet-api@3.0.5

## 1.1.4

### Patch Changes

- Update dependencies
  - @rosen-ui/wallet-api@3.0.4
  - @rosen-network/doge@0.4.0
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/types@0.3.8

## 1.1.3

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/wallet-api@3.0.3
  - @rosen-ui/types@0.3.7
  - @rosen-network/doge@0.3.1

## 1.1.2

### Patch Changes

- Update dependencies
  - @rosen-network/doge@0.3.0
  - @rosen-ui/wallet-api@3.0.2

## 1.1.1

### Patch Changes

- Update dependencies
  - @rosen-network/doge@0.2.0
  - @rosen-ui/wallet-api@3.0.1

## 1.1.0

### Minor Changes

- Update the `disconnect`, `switchChain`, and `isConnected` methods to align with the latest changes in the wallet abstract class

### Patch Changes

- Update dependency @rosen-ui/wallet-api@3.0.0

## 1.0.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Integrate `BalanceFetchError` handling into the `getBalance` method and update the `Wallet` class to reflect the latest changes in the wallet API, enhancing maintainability
- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-network/doge@0.1.3
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6

## 0.2.1

### Patch Changes

- Fix the connection logic issue that causes a rejection error when connecting to the extension
- Updated dependencies
  - @rosen-network/doge@0.1.2
  - @rosen-bridge/icons@1.4.0

## 0.2.0

### Minor Changes

- Add MyDoge wallet

### Patch Changes

- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/wallet-api@1.4.0
  - @rosen-network/doge@0.1.1
  - @rosen-ui/types@0.3.5
