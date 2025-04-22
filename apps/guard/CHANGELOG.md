# @rosen-bridge/guard-app

## 1.12.2

### Patch Changes

- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/utils@0.5.0
  - @rosen-bridge/ui-kit@1.10.1

## 1.12.1

### Patch Changes

- Ensure that icons are consistent in terms of name, color, size, and other attributes
- Implement a Version component to display detailed version information for the application.
- Updated dependencies
  - @rosen-bridge/ui-kit@1.9.2
  - @rosen-bridge/icons@1.2.0

## 1.12.0

### Minor Changes

- Integrate support for the 'Request An Order' form into the app

### Patch Changes

- Update the usage of network constants to enhance maintainability
- Enhance token display in the dashboard with a carousel component
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-ui/swr-helpers@0.2.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/utils@0.4.5
  - @rosen-bridge/ui-kit@1.9.0

## 1.11.0

### Minor Changes

- Add the Binance Tokens card to the dashboard

### Patch Changes

- Updated @rosen-bridge/ui-kit@1.8.1 dependency

## 1.10.1

### Patch Changes

- Uninstall `@rosen-ui/common-hooks` to reduce dependencies
- Updated dependencies
  - @rosen-bridge/ui-kit@1.8.0
  - @rosen-ui/constants@0.1.0
  - @rosen-ui/utils@0.4.4

## 1.10.0

### Minor Changes

- Add Chain and Addresses columns to the table on the Events and History pages

### Patch Changes

- Enhance the React components by using the `PropsWithChildren` type instead of creating a custom type definition for scenarios that only require children props
- Update the Lodash version to the latest release to enhance consistency
- Updated dependencies
  - @rosen-bridge/ui-kit@1.7.2
  - @rosen-ui/utils@0.4.3

## 1.9.2

### Patch Changes

- Install a reliable and consistent version of the @types/node npm package
- Update the usage of the ID component
- Updated dependency @rosen-bridge/ui-kit@1.7.1

## 1.9.1

### Patch Changes

- Integrated the Version component in the SideBar to display version information optimized for both desktop and mobile views.
- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-bridge/ui-kit@1.7.0

## 1.9.0

### Minor Changes

- Update the root layout to incorporate the latest changes from the UI kit, enhancing its responsiveness

### Patch Changes

- Fix missing dependencies and remove unused packages
- Updated dependencies
  - @rosen-bridge/ui-kit@1.6.0
  - @rosen-ui/utils@0.4.2

## 1.8.0

### Minor Changes

- Add a meta tag title to ensure an appropriate title is displayed in browsers
- Add a favicon to enhance browser visibility

### Patch Changes

- Restructure modules to use named exports, enhancing clarity and consistency
- Cleaned up duplicate ApiKeyModal files, moved to the design system, and updated the related imports
- Updated the @rosen-bridge/ui-kit@1.5.3 dependency

## 1.7.0

### Minor Changes

- Improve the sidebar component with less and cleaner code, receive version data from API

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

- Add page size of 100 to tables
- Link app logo to the root page

### Patch Changes

- Swap the position of action buttons in api key modal
- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-bridge/ui-kit@1.0.0
  - @rosen-ui/utils@0.1.1

## 1.2.0

### Minor Changes

- Display service and ui versions in the sidebar

### Patch Changes

- Upgrade nextjs version
- Updated dependencies
  - @rosen-bridge/icons@0.3.0
  - @rosen-bridge/ui-kit@0.2.1

## 1.1.1

### Patch Changes

- Change `api_key` header to `Api-Key` to adhere to the standards

## 1.1.0

### Minor Changes

- Add api-key authentication for server mutations

### Patch Changes

- Fix the chart label problems in first load
- Update dependencies
  - @rosen-bridge/icons@0.2.0
  - @rosen-bridge/shared-contexts@0.0.1
  - @rosen-bridge/ui-kit@0.2.0
  - @rosen-ui/utils@0.1.0
  - @rosen-ui/swr-helpers@0.1.0
