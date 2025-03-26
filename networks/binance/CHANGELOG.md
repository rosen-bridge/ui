# @rosen-network/binance

## 0.2.2

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package
- Updated dependencies
  - @rosen-network/base@0.2.2
  - @rosen-network/evm@0.2.2

## 0.2.1

### Patch Changes

- Update server functions to work with the asynchronously loaded token map
- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-network/evm@0.2.1
  - @rosen-network/base@0.2.1

## 0.2.0

### Minor Changes

- Encapsulate the network context within a class to enhance maintainability and simplify future modifications

### Patch Changes

- Resolve the address converter for the Binance and Ethereum networks to ensure accurate address validation
- Updated dependencies
  - @rosen-network/base@0.2.0
  - @rosen-network/evm@0.2.0
