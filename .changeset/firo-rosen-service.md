---
'@rosen-bridge/rosen-service': minor
---

Add Firo chain support to rosen-service

- Add `@rosen-bridge/firo-scanner` and `@rosen-bridge/firo-observation-extractor`
  as dependencies.
- Wire up a new `FiroRpcScanner` in `scanner-service`, reading from the
  configured Firo RPC node.
- Register `FiroRpcObservationExtractor` for the lock address.
- Register the `firo-extractor` event-trigger extractor on the Ergo scanner.
- Register a Firo scanner-sync health check.
- Pass the Firo calculator config (addresses + `explorerUrl`) to
  `AssetCalculator`.
- Add `firo` network section plus health-check thresholds and
  `calculator.addresses.firo` defaults to `config/default.yaml`.
