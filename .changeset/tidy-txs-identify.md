---
'@rosen-bridge/watcher-app': patch
---

Show the transaction id in the lock, unlock and withdraw action success toasts as a truncated Identifier linked to the block explorer via getTxURL, instead of the full 64-character id. When no explorer URL can be built the id is now shown as plain text rather than linking to the home page.
