# @rosen-bridge/ui-kit

## 1.4.0

### Minor Changes

- Update the default page size in the design system from 10 to 25
- Integrate a component called 'WithExternalLink' to concatenate an element with an external link

## 1.3.0

### Minor Changes

- Improve the sidebar component to accept child elements as specific props, enhancing maintainability and enabling future implementation of responsive design
- Enhance the HealthParamCard component to accommodate emerging requirements
- Enhance the design system by adding the ToolbarThemeTogglerAction component, introducing a useThemeToggler hook, and updating the ThemeProvider to support overarching logic

### Patch Changes

- Revise the font-size of the hot and cold amounts in the TokenListItem component.

## 1.2.0

### Minor Changes

- Update the HealthParam context to incorporate the latest API enhancements.
- Implement the drawer UI component.

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.4.0

## 1.1.2

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.3.0
  - @rosen-ui/constants@0.0.3

## 1.1.1

### Patch Changes

- Updated dependencies
  - @rosen-ui/utils@0.2.0

## 1.1.0

### Minor Changes

- The display of IDs was improved

### Patch Changes

- Updated dependencies
  - @rosen-ui/constants@0.0.2
  - @rosen-ui/utils@0.1.2

## 1.0.0

### Major Changes

- add default rowsPerPageOptions to EnhancedTable

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@0.4.0
  - @rosen-ui/utils@0.1.1

## 0.2.1

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@0.3.0

## 0.3.0

### Minor Changes

- set a maximum page size of 100 for events api
- use the shared hooks package instaed of utils package to prenvet server component problems

### Patch Changes

- fix app crash when a token fetched from database is not found
- Update dependencies
  - @rosen-ui/common-hooks@0.1.0
  - @rosen-ui/utils@0.1.0
  - @rosen-ui/eternl-wallet@0.0.2
  - @rosen-ui/flint-wallet@0.0.2
  - @rosen-ui/lace-wallet@0.0.2
  - @rosen-ui/nami-wallet@0.0.2
  - @rosen-ui/nautilus-wallet@0.0.2
  - @rosen-ui/vespr-wallet@0.0.2
  - @rosen-ui/wallet-api@0.0.2

## 0.2.1

### Patch Changes

- Fix issue with wallet index when having multiple wallets

## 0.2.0

### Minor Changes

- Add multi-wallet support ([@Mercurial](https://github.com/Mercurial))
- Add Eternl, Flint and Lace wallets for Cardano chain ([@Mercurial](https://github.com/Mercurial))
