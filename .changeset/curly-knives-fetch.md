---
'@rosen-bridge/ui-kit': patch
---

Fix infinite revalidation in `useCollection` by normalizing query comparison before calling `router.push()`
