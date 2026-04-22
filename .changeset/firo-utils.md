---
'@rosen-ui/utils': minor
---

Add Firo URL entries to `getAddressUrl`, `getTxUrl`, and `getTokenUrl`.

Required because `Network = keyof typeof NETWORKS` now includes `'firo'`, and the three maps are exhaustive `{ [key in Network]: ... }` — without these entries, `tsc --noEmit` fails in `packages/utils`. Uses Firo's native explorer (`https://explorer.firo.org`) for address and transaction URLs; token URL is empty (Firo has no native token scheme).
