# @rosen-network/doge

## 0.4.2

### Patch Changes

- Update dependency @rosen-bridge/icons@3.3.0

## 0.4.1

### Patch Changes

- Update dependencies
  - @rosen-bridge/icons@3.1.0
  - @rosen-ui/types@0.4.0
  - @rosen-network/base@0.5.1

## 0.4.0

### Minor Changes

- Handle uncovered assets errors by throwing a suitable error to inform the user clearly
- Enhance network error messages for `generateUnsignedTx` function to include details on uncovered native tokens

### Patch Changes

- Patch weight estimation issue for Doge
- Update dependencies
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/address-codec@1.0.1
  - @rosen-bridge/bitcoin-utxo-selection@2.0.1
  - @rosen-bridge/icons@3.0.0
  - @rosen-network/base@0.5.0
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/types@0.3.8

## 0.3.1

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-bridge/icons@2.3.1
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/types@0.3.7
  - @rosen-network/base@0.4.1

## 0.3.0

### Minor Changes

- Implement the `calculateFee` utility function to compute transaction fees
- Implement the `getMinTransferCreator` utility function to get min transfer amount

### Patch Changes

- Update dependency @rosen-network/base@0.4.0

## 0.2.0

### Minor Changes

- Add a public method named `validateAddress` to the Network class to validate network addresses

### Patch Changes

- Update dependencies
  - @rosen-network/base@0.3.0
  - @rosen-bridge/icons@2.3.0

## 0.1.3

### Patch Changes

- Fix Doge minimum UTxO value (changed to 0.01 DOGE)
- Optimize the structure to enhance compatibility with wallet packages and streamline usage within the Rosen App
- Update dependencies
  - @rosen-bridge/address-codec@0.6.2
  - @rosen-bridge/icons@2.0.0
  - @rosen-bridge/tokens@3.1.1
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/types@0.3.6

## 0.1.2

### Patch Changes

- Fix input script
- Updated dependency @rosen-bridge/icons@1.4.0

## 0.1.1

### Patch Changes

- Updated dependency @rosen-ui/constants@0.3.0
