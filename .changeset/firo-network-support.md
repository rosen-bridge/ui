---
'@rosen-bridge/rosen-app': minor
'@rosen-network/firo': minor
'@rosen-ui/firo-wallet': minor
'@rosen-ui/constants': minor
'@rosen-bridge/icons': minor
'@rosen-ui/utils': patch
'@rosen-bridge/rosen-service': patch
'@rosen-bridge/rosen-service2': patch
---

Add Firo network support across the bridge UI.

- Introduce `@rosen-network/firo` and `@rosen-ui/firo-wallet` packages.
- Register Firo in `@rosen-ui/constants`, icons, and address/tx URL helpers.
- Wire Firo into the rosen app (networks, wallets, env).
- Skip unconfigured chains gracefully in `rosen-service` commitment extractor registration.
- Narrow `createChainSpecificDataAdapter` to `keyof Chains` and index `configs.chains` with the same narrower type in `rosen-service2` so the switch remains exhaustive once Firo is added to `NETWORKS_KEYS`.
