---
"@rosen-bridge/rosen-service": major
---

Rewrite the service architecture with a service-manager-based lifecycle.

- Introduce `assemble` / `start` / `stop` / `getTasks` lifecycle across all services
- Replace plain module bootstrapping with `@rosen-bridge/service-manager` registration and dependency-ordered startup
- Consolidate per-chain scanners, extractors, and health checks into dedicated services (`ErgoScannerService`, `ScannerService`, `ErgoExtractorService`, `HealthService`)
- Add per-chain (`chains.<chain>.active`) and per-metric (`statistics.<metric>.active`) activation gates; inactive chains and metrics are skipped at startup
- Add on-chain TokenMap support with Redis caching, controlled by `tokenMap.onChainTokenMapEnabled`
- Migrate configuration to `config/schema.json` with generated TypeScript types

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
