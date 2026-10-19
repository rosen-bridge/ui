---
'@rosen-bridge/rosen-app': patch
---

Fix bridge form fee races: key fee quotes by the full route (source, target and token) and only publish the latest request's response, so a previous route's fee can no longer land in the form after the route changes; also stop caching `calculateFee` results for 10 minutes, since the current height is fetched server-side and is not part of the cache key, which let a newly active fee config be missed
