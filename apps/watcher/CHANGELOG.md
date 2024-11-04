# @rosen-bridge/watcher-app

## 2.6.0

### Minor Changes

- improve the sidebar component with less and cleaner code, receive version data from API

## 2.5.0

### Minor Changes

- Connect the transaction Id to the explorer following the permit in the lock action

## 2.4.1

### Patch Changes

- Add Ethereum icon svg file

## 2.4.0

### Minor Changes

- Revise the theme provider code to incorporate the latest updates from the design system
- Enhance the app to incorporate the latest updates in API functionality and design

### Patch Changes

- Strengthen type safety and enforce robust typing for Chain and Network types
- Address the issue related to retrieving the app version property from the API
- The .env files are included in the .gitignore file for all UI applications to ensure sensitive information remains secure

## 2.3.0

### Minor Changes

- Update the HealthParam context to incorporate the latest API enhancements.
- Implement ERSN token integration for dashboard and revenue pages

### Patch Changes

- Update README
- Fix the bug that prevents the Clear button from working correctly in the text field of the API key modal. Ensure that submitting the form does not trigger the parent forms, which would subsequently open a dialog that relies on them.
- Updated dependencies
  - @rosen-bridge/ui-kit@1.2.0
  - @rosen-ui/utils@0.4.0

## 2.2.1

### Patch Changes

- Fix URL issue for Bitcoin transactions
- Updated dependencies
  - @rosen-ui/utils@0.2.0
  - @rosen-bridge/ui-kit@1.1.1

## 2.2.0

### Minor Changes

- Add a button to trigger ApiKeyModal when it does not set and display a warning
- The display of IDs was improved

### Patch Changes

- Updated dependencies
  - @rosen-bridge/ui-kit@1.1.0
  - @rosen-ui/utils@0.1.2

## 2.1.0

### Minor Changes

- add page size of 100 to tables
- link app logo to the root page

### Patch Changes

- swap the position of action buttons in api key modal
- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-bridge/ui-kit@1.0.0
  - @rosen-ui/utils@0.1.1

## 2.0.1

### Patch Changes

- reflect unlock api changes in frontend

## 2.0.0

### Major Changes

- reflect api upgrades in frontend

## 1.2.0

### Minor Changes

- display service and ui versions in the sidebar

### Patch Changes

- upgrade nextjs version
- updated dependencies
  - @rosen-bridge/icons@0.3.0
  - @rosen-bridge/ui-kit@0.2.1

## 1.1.1

### Patch Changes

- change `api_key` header to `Api-Key` to adhere to the standards

## 1.1.0

### Minor Changes

- add api-key authentication for server mutations

### Patch Changes

- fix the chart label problems in first load
- Update dependencies
  - @rosen-bridge/icons@0.2.0
  - @rosen-bridge/shared-contexts@0.0.1
  - @rosen-bridge/ui-kit@0.2.0
  - @rosen-ui/utils@0.1.0
  - @rosen-ui/swr-helpers@0.1.0
