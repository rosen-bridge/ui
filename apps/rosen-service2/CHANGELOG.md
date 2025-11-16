# @rosen-bridge/rosen-service2

## 0.1.0

### Minor Changes

- add `AssetDataAdapterService` to provide unified blockchain data adapters and assets total-supply tracking
- Configuration file now supports multiple connections for each method on any chain
- Update supported node version to the 22.18.0 and update rosen-clients versions
- implement blockchain scanners
- Health status report file is now supported
- Merged scanners into the ErgoScanner and ChainsHealthCheck into the BaseHealthCheck
- add blockchain scanners status to health-check

### Patch Changes

- Upgrade scanner base dependencies
- Rename runes chain to bitcoinRunes
- Remove `LastSavedBlock` interface
- Update depenedencies
  - @rosen-bridge/abstract-logger@3.0.1
  - @rosen-bridge/abstract-observation-extractor@0.2.3
  - @rosen-bridge/abstract-scanner@0.2.3
  - @rosen-bridge/bitcoin-observation-extractor@6.4.1
  - @rosen-bridge/bitcoin-scanner@0.2.3
  - @rosen-bridge/callback-logger@1.0.1
  - @rosen-bridge/cardano-observation-extractor@1.1.1
  - @rosen-bridge/cardano-scanner@1.0.1
  - @rosen-bridge/config@1.1.0
  - @rosen-bridge/discord-notification@1.0.0
  - @rosen-bridge/ergo-observation-extractor@0.3.1
  - @rosen-bridge/ergo-scanner@0.1.4
  - @rosen-bridge/evm-observation-extractor@5.4.1
  - @rosen-bridge/evm-scanner@0.1.4
  - @rosen-bridge/extended-typeorm@1.0.1
  - @rosen-bridge/health-check@8.0.0
  - @rosen-bridge/json-bigint@1.1.0
  - @rosen-bridge/log-level-check@3.0.0
  - @rosen-bridge/scanner-interfaces@0.2.1
  - @rosen-bridge/scanner-sync-check@8.1.0
  - @rosen-bridge/service-manager@1.0.1
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/watcher-data-extractor@12.3.0
  - @rosen-bridge/winston-logger@2.0.1
  - @rosen-ui/asset-calculator@2.2.0
  - @rosen-ui/asset-data-adapter@0.2.0
  - @rosen-ui/constants@1.0.0

## 0.0.2

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-ui/asset-calculator@2.1.8
  - @rosen-ui/constants@0.4.1
