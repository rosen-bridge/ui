# @rosen-bridge/guard-app

## 1.6.0

### Minor Changes

- Remove the eRSN title from the network and bridge fee columns on the revenues page
- Integrate support for the eRSN token on the Revenue page

## 1.5.0

### Minor Changes

- Revise the theme provider code to incorporate the latest updates from the design system
- Update the ApiInfoResponse interface to incorporate the latest API enhancements.
- Enhance the app to incorporate the latest updates in API functionality and design
- Integrate a token list for the Ethereum network into the dashboard.

### Patch Changes

- Strengthen type safety and enforce robust typing for Chain and Network types
- Address the issue related to retrieving the app version property from the API
- The .env files are included in the .gitignore file for all UI applications to ensure sensitive information remains secure
- Fix the bug that prevents the Clear button from working correctly in the text field of the API key modal. Ensure that submitting the form does not trigger the parent forms, which would subsequently open a dialog that relies on them.

## 1.4.1

### Patch Changes

- Fix URL issue for Bitcoin transactions
- Updated dependencies
  - @rosen-ui/utils@0.2.0
  - @rosen-bridge/ui-kit@1.1.1

## 1.4.0

### Minor Changes

- Add a button to trigger ApiKeyModal when it does not set and display a warning
- Add bitcoin to the list of chains for send for signing action
- The display of IDs was improved

### Patch Changes

- Updated dependencies
  - @rosen-bridge/ui-kit@1.1.0
  - @rosen-ui/constants@0.0.2
  - @rosen-ui/utils@0.1.2

## 1.3.0

### Minor Changes

- add page size of 100 to tables
- link app logo to the root page

### Patch Changes

- swap the position of action buttons in api key modal
- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-bridge/ui-kit@1.0.0
  - @rosen-ui/utils@0.1.1

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
