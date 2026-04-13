---
'@rosen-ui/wallet-connect': patch
---

Fix `WalletConnect` chain reset issue by enforcing desired network via ensureChain before wallet actions to prevent `incorrect balances` after reconnection
