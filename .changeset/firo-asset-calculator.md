---
'@rosen-ui/asset-calculator': minor
'@rosen-ui/constants': minor
---

Add Firo chain support to asset-calculator

- Register `firo` in the `NETWORKS` constant (no token support, native token `firo`).
- Add `FiroCalculator` that reads locked amounts from the Firo insight-api
  (`/insight-api-zcoin/addr/{address}/balance`).
- Add `FiroCalculatorInterface` and register `FiroCalculator` in `AssetCalculator`.
