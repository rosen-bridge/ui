---
'@rosen-bridge/watcher-app': patch
'@rosen-bridge/guard-app': patch
---

Fix the bug that prevents the Clear button from working correctly in the text field of the API key modal. Ensure that submitting the form does not trigger the parent forms, which would subsequently open a dialog that relies on them.
