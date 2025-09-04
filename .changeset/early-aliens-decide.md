---
'@rosen-bridge/rosen-app': patch
---

Fixed the issue where changing the source network to `Bitcoin` while a wallet is connected to a non-Bitcoin network causes an error related to native SegWit support, regardless of the wallet's connection status
