# @rosen-ui/asset-data-adapter

## 0.3.0

### Minor Changes

- Add BitcoinRunesDataAdapter for collecting info from runes blockchain.

### Patch Changes

- Fix a bug related to wrong offset for AbstractEvmRpcDataAdapter
- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/extended-typeorm@1.1.0
  - @rosen-bridge/tokens@6.0.0
  - @rosen-clients/cardano-koios@3.1.3
  - @rosen-clients/ergo-explorer@2.1.3
  - @rosen-clients/rate-limited-axios@2.0.1
  - ethers@6.16.0

## 0.2.0

### Minor Changes

- add `AssetDataAdapterService` to provide unified blockchain data adapters and assets total-supply tracking
- Update supported node version to the 22.18.0 and update rosen-clients versions

### Patch Changes

- Update dependencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/tokens@4.0.1
  - @rosen-ui/constants@1.0.0
