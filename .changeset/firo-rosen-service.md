---
'@rosen-bridge/rosen-service': patch
---

Gracefully skip networks that are present in shared constants (e.g. Firo) but not configured in this service when registering commitment extractors, instead of throwing.
