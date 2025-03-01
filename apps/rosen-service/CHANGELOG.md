# @rosen-bridge/rosen-service

## 3.0.0

### Major Changes

- Update the Node.js version dependency from 18.17 to 20

### Patch Changes

- Update evm-observation-extractor to support binance
- Add binance chain asset calculator
- Install a reliable and consistent version of the @types/node npm package
- Updated dependency @rosen-ui/asset-calculator@2.1.0

## 2.2.0

### Minor Changes

- Add binance chain scanner with observation and event trigger extractors

## 2.1.0

### Minor Changes

- Update bitcoin scanner to use rpc endpoint instead of esplora.

## 2.0.0

### Major Changes

- initialize Ethereum scanner and Extractor

### Patch Changes

- Fix scanner initialization bug
- Fix observation entity no metadata error

## 1.1.0

### Minor Changes

- Make all backend urls configurable

### Patch Changes

- Run scanner and asset calculator services at the same time, as they are independent
- Updated dependencies
  - @rosen-ui/asset-calculator@1.0.1

## 1.0.0

### Major Changes

- save asset data individually for all bridged chains

### Minor Changes

- Upgrade to latest scanner and extractor packages
- Add Bitcoin scanner and its observation and event trigger extractors
- Store locked asset data in the database based on TokenMap file

### Patch Changes

- Updated dependencies
  - @rosen-ui/asset-calculator@1.0.0

## 0.3.0

### Minor Changes

- Integrate asset calculator

## 0.2.0

### Minor Changes

- upgrade extractor packages
