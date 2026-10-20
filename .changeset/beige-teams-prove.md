---
"@rosen-bridge/rosen-service": major
---

- Rewrite the service architecture with a service-manager-based lifecycle
- Add statistics metrics
- Add On-chain TokenMap with Redis cache
- Replace asset-calculator with AssetDataAdapterService and AssetAggregatorService
- Integrate Handshake into rosen-service
- Config via `@rosen-bridge/config` 
- Per-chain `active` flag and multiple endpoints per method
- Per-chain `blockCleanupActive` and `blockRetrieveGap` config
- Per-extractor `initialize.active` flags for commitment and event trigger extractors
- Add token map boxes extractor using `@rosen-bridge/address-extractor`

Update dependencies

- @rosen-bridge/abstract-scanner@4.1.0
- @rosen-bridge/address-extractor@7.1.1
- @rosen-bridge/bitcoin-observation-extractor@9.0.0
- @rosen-bridge/bitcoin-runes-observation-extractor@4.0.0
- @rosen-bridge/bitcoin-scanner@2.0.2
- @rosen-bridge/cardano-observation-extractor@4.0.0
- @rosen-bridge/cardano-scanner@3.0.2
- @rosen-bridge/ergo-observation-extractor@2.0.8
- @rosen-bridge/ergo-scanner@2.0.2
- @rosen-bridge/evm-observation-extractor@8.0.0
- @rosen-bridge/evm-scanner@2.0.2
- @rosen-bridge/firo-observation-extractor@1.1.6
- @rosen-bridge/firo-scanner@1.0.2
- @rosen-bridge/handshake-observation-extractor@2.0.0
- @rosen-bridge/handshake-scanner@1.0.3
- @rosen-bridge/watcher-data-extractor@16.1.0
- @rosen-clients/ergo-explorer@2.1.1

Add dependencies

- @rosen-bridge/service-manager
- @rosen-bridge/config
- @rosen-bridge/extended-tokens
- @rosen-bridge/address-extractor
- @rosen-bridge/abstract-extractor
- @rosen-bridge/json-bigint
- @rosen-clients/ergo-explorer
- @rosen-ui/asset-aggregator
- @rosen-ui/asset-data-adapter
- @rosen-ui/data-source
- @rosen-ui/rosen-statistics
- @vercel/kv
- ergo-lib-wasm-nodejs

Remove dependencies

- @rosen-bridge/tokens
- @rosen-bridge/rate-limited-axios
- @rosen-ui/asset-calculator
- @rosen-ui/rosen-statistics-entity
- @rosen-ui/public-status
- config
