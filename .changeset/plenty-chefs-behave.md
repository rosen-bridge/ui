---
'@rosen-ui/eternl-wallet': patch
'@rosen-ui/flint-wallet': patch
'@rosen-ui/lace-wallet': patch
---

Resolve the issue by replacing the incorrect token retrieval method using policyId with a more accurate approach that retrieves the token by both nameHex and policyId.
