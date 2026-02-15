---
'@rosen-bridge/ui-kit': patch
---

- Introduce a framework provider to inject framework-specific utilities
- Remove navigation context usage from `NavigationBar` and update `NavigationButton` to consume the new `useFramework` hook
- Update the `Token` component to use the framework-provided Image abstraction
- Add automatic reset behavior to `useCollection` instead of implementing reset logic in individual pages
