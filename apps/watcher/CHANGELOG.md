# @rosen-bridge/watcher-app

## 3.3.1

### Patch Changes

- Temporarily fix the generateTxParameters function for EVM networks
- Updated dependencies
  - @rosen-bridge/ui-kit@1.10.1
  - @rosen-bridge/icons@1.3.1

## 3.3.0

### Minor Changes

- Implement a themeable favicon, and automatically load the chain icon from the dedicated icon package

### Patch Changes

- Update the content of the Caution section on the Withdraw page
- Ensure that icons are consistent in terms of name, color, size, and other attributes
- Implement a Version component to display detailed version information for the application.
- Updated dependencies
  - @rosen-bridge/ui-kit@1.9.2
  - @rosen-bridge/icons@1.2.0

## 3.2.1

### Patch Changes

- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-ui/swr-helpers@0.2.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/swr-mock@0.0.4
  - @rosen-ui/utils@0.4.5
  - @rosen-bridge/ui-kit@1.9.0

## 3.2.0

### Minor Changes

- Add the Binance icon

### Patch Changes

- Correct the display of zero RSN tokens in the dashboard

## 3.1.4

### Patch Changes

- Update the RSN box in main page to fix how RSN and eRSN are displayed
- Uninstall `@rosen-ui/common-hooks` to reduce dependencies
- Updated dependencies
  - @rosen-bridge/ui-kit@1.8.0
  - @rosen-ui/constants@0.1.0
  - @rosen-ui/utils@0.4.4

## 3.1.3

### Patch Changes

- Enhance the React components by using the `PropsWithChildren` type instead of creating a custom type definition for scenarios that only require children props
- Update the Lodash version to the latest release to enhance consistency
- Updated dependencies
  - @rosen-bridge/ui-kit@1.7.2
  - @rosen-ui/utils@0.4.3

## 3.1.2

### Patch Changes

- Install a reliable and consistent version of the @types/node npm package
- Update the usage of the ID component
- Updated dependency @rosen-bridge/ui-kit@1.7.1

## 3.1.1

### Patch Changes

- Resolve the dynamic title glitch that occurs when navigating between pages
- Integrated the Version component in the SideBar to display version information optimized for both desktop and mobile views.
- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-bridge/ui-kit@1.7.0

## 3.1.0

### Minor Changes

- Update the root layout to incorporate the latest changes from the UI kit, enhancing its responsiveness

### Patch Changes

- Fix missing dependencies and remove unused packages
- Updated dependencies
  - @rosen-ui/common-hooks@0.1.1
  - @rosen-bridge/ui-kit@1.6.0
  - @rosen-ui/utils@0.4.2

## 3.0.0

### Major Changes

- Split layout.tsx into layout.tsx and App.tsx files, Implemented a dynamic title feature to display the network

### Minor Changes

- Implemented a dynamic title system that automatically displays the network's name
- Add a meta tag title to ensure an appropriate title is displayed in browsers
- Add a favicon to enhance browser visibility

### Patch Changes

- Update the modules to utilize named exports, enhancing maintainability and aligning with our policy to ensure greater consistency
- Cleaned up duplicate ApiKeyModal files, moved to the design system, and updated the related imports
- Updated dependencies
  - @rosen-ui/swr-mock@0.0.2
  - @rosen-bridge/ui-kit@1.5.3

## 2.6.0

### Minor Changes

- Improve the sidebar component with less and cleaner code, receive version data from API

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

- Add page size of 100 to tables
- Link app logo to the root page

### Patch Changes

- Swap the position of action buttons in api key modal
- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-bridge/ui-kit@1.0.0
  - @rosen-ui/utils@0.1.1

## 2.0.1

### Patch Changes

- Reflect unlock api changes in frontend

## 2.0.0

### Major Changes

- Reflect api upgrades in frontend

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
