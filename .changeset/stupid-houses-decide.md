---
'@rosen-ui/wallet-api': patch
---

Add a new error named `BalanceFetchError` for use during wallet balance retrieval, and update the method signature to prevent duplicate implementations of the `getBalance` method.
