# @rosen-ui/asset-aggregator

## 0.2.0

### Minor Changes

- Implement the AssetAggregator class and related tests

### Patch Changes

- Register the missing postgres migration 1762606291770 (token_entity/bridged_asset_entity FK) to match asset-calculator migration history
- Inherit Action classes of Lock & Bridged from AbstractAssetAction
- Update dependencies
  - @rosen-bridge/abstract-logger@4.0.0
  - @rosen-bridge/json-bigint@1.1.0
  - @rosen-bridge/tokens@6.0.0
  - @rosen-bridge/extended-typeorm@1.1.0
  - @rosen-bridge/tokens@6.0.2

## 0.1.0

### Minor Changes

- Initialize the package
