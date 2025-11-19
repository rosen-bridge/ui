# @rosen-bridge/rosen-service

## 4.2.0

### Minor Changes

- Update supported node version to the 22.18.0 and update rosen-clients versions
- Health status report file is now supported
- Add support for Bitcoin Runes to rosen-service
- Added `CommitmentExtractor` in rosen-service

### Patch Changes

- Add Rate Limit on Unisat
- Upgrade scanner base dependencies
- Remove `LastSavedBlock` interface
- Update dependencies
  - @rosen-bridge/bitcoin-runes-observation-extractor@1.1.1
  - @rosen-ui/data-source@0.2.0
  - @rosen-ui/asset-calculator@2.2.0
  - @rosen-ui/constants@1.0.0
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/abstract-scanner@0.2.3
  - @rosen-bridge/bitcoin-observation-extractor@6.4.1
  - @rosen-bridge/bitcoin-scanner@0.2.3
  - @rosen-bridge/callback-logger@1.0.1
  - @rosen-bridge/cardano-observation-extractor@1.1.1
  - @rosen-bridge/cardano-scanner@1.0.1
  - @rosen-bridge/discord-notification@1.0.0
  - @rosen-bridge/ergo-observation-extractor@0.3.1
  - @rosen-bridge/ergo-scanner@0.1.4
  - @rosen-bridge/evm-observation-extractor@5.4.1
  - @rosen-bridge/evm-scanner@0.1.4
  - @rosen-bridge/health-check@8.0.0
  - @rosen-bridge/log-level-check@3.0.0
  - @rosen-bridge/scanner-interfaces@0.2.1
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/watcher-data-extractor@12.3.0
  - @rosen-bridge/winston-logger@2.0.1
  - @rosen-bridge/scanner-sync-check@8.1.0

## 4.1.2

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/asset-calculator@2.1.8
  - @rosen-ui/data-source@0.1.1
  - @rosen-ui/constants@0.4.1

## 4.1.1

### Patch Changes

- Update dependency @rosen-ui/data-source@0.1.0

## 4.1.0

### Minor Changes

- Replace @rosen-bridge/extended-typeorm with @rosen-ui/data-source package

## 4.0.1

### Patch Changes

- Downgrade ethers version
- Update dependency @rosen-ui/asset-calculator@2.1.7

## 4.0.0

### Major Changes

- Implement LogLevelHealthCheck in the rosen-service
- Updated scanner instances to use multiple connectors for each chain

### Patch Changes

- Fix issue where the last block was not found in the database based on the chain name
- Fix `handleError` to log more information on an unhandled error
- Update dependencies
  - @rosen-bridge/rate-limited-axios@0.2.1
  - @rosen-bridge/scanner@8.0.0
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/asset-calculator@2.1.6

## 3.2.0

### Minor Changes

- Add Doge related implementations
- Update service to use CallbackLogger instead of WinstonLogger

### Patch Changes

- Add patch-package and add related patch into the DogeRpcNetwork
- Update rosen dependencies
- Updated dependency @rosen-ui/asset-calculator@2.1.5

## 3.1.0

### Minor Changes

- Add scanner health parameters to evaluate its health periodically and add notification manager to notify us of any possible issues

### Patch Changes

- Fix import problems
- Fix optional configs
- Use constant package for ethereum and binance chain key
- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/asset-calculator@2.1.4

## 3.0.1

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package
- Correct the usage of the token map in the Rosen service
- Updated @rosen-ui/asset-calculator@2.1.3 dependency

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
