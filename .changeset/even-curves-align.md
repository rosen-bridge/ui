---
'@rosen-bridge/ui-kit': minor
---

Add `--rosen-motion-duration-*` and `--rosen-motion-easing-*` tokens and use them in every transition, with enter and exit easing; the duration tokens drop to `0s` under `prefers-reduced-motion: reduce`, so apps overriding them should do it inside `@media (prefers-reduced-motion: no-preference)`
