# @rosen-ui/xverse-wallet

## 0.3.1

### Patch Changes

- Update dependencies
  - @rosen-ui/types@0.4.0
  - @rosen-network/bitcoin@2.4.1
  - @rosen-network/bitcoin-runes@1.0.1
  - @rosen-ui/wallet-api@3.0.5

## 0.3.0

### Minor Changes

- Add fetchPaymentAddress method required for performTransfer of bitcoin-runes
- Implement Bitcoin Runes functionalities and switch chain functionality

### Patch Changes

- Handle signing of the p2wpkh utxos
- Update dependencies
  - @rosen-bridge/tokens@4.0.1
  - @rosen-network/bitcoin-runes@1.0.0
  - @rosen-network/bitcoin@2.4.0
  - @rosen-ui/wallet-api@3.0.4
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/types@0.3.8

## 0.2.2

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/wallet-api@3.0.3
  - @rosen-network/bitcoin@2.3.1
  - @rosen-ui/types@0.3.7

## 0.2.1

### Patch Changes

- Resolve the connection error with the Xverse wallet
- Update dependencies
  - @rosen-network/bitcoin@2.2.0
  - @rosen-ui/wallet-api@3.0.1

## 0.2.0

### Minor Changes

- Update the `disconnect`, `switchChain`, and `isConnected` methods to align with the latest changes in the wallet abstract class

### Patch Changes

- Update dependency @rosen-ui/wallet-api@3.0.0

## 0.1.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-network/bitcoin@2.1.4
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6
