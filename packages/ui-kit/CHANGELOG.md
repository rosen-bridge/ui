# @rosen-bridge/ui-kit

## 2.0.0

### Major Changes

- Refine the `NewPagination` component’s interface to adhere to standard design conventions
- Extracted the `Sort` component from `SmartSearch` to improve maintainability by making it a standalone, reusable component
- Update `NavigationBar` logic to streamline and simplify its usage
- Refine the `EnhancedDialog` component to ensure it aligns with the design specifications
- Add the variant prop with `standard` and `filled` values to the Connector component
- Add `subtitle1` fontSize to the theme options.
- Implement Token Component
- Develop a layout component named `DataLayout` to standardize the presentation of data items across applications. include slots such as filtering, sorting, a sidebar, pagination, and content display
- Create a reusable component and hook to enable sticky positioning for a sidebar box
- Implement a custom hook called `useBreakpoint` to detect and respond to size changes in JavaScript logic
- Create a custom hook called `useCollection` to seamlessly integrate `useSWR` with list components
- Implement `EmptyState` component

### Patch Changes

- Fix the color of toolbar buttons
- Fix the info color
- Add identifier and copy button components
- Prevent line compression and breaking in the Label component
- Change tooltip color
- Fix label display issue in Network component
- Correct typing and rendering issues in Chip component
- Fix the overflow style and scroll effect of app component
- Update dependency @rosen-bridge/icons@2.1.0

## 1.12.0

### Minor Changes

- Add the reusable `NewPagination` component to ensure consistent pagination behavior across packages
- Added `InfoWidgetCardBase` as a new styled component to be reused across packages
- Implement Network component

### Patch Changes

- Fix the text color of app component
- Fix the toolbar component
- Add Label and Amount components
- Fix some colors in ui-kit and apply it to watcher
- Fix the color of the version button
- Fixes page heading
- Update dependencies
  - @rosen-bridge/icons@2.0.0
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/utils@0.6.0

## 1.11.0

### Minor Changes

- Develop the SmartSearch component with a history feature and implement the Sort component

### Patch Changes

- A new copy button has been integrated into toast alerts for errors. When an issue occurs, users can now easily copy additional error details for troubleshooting and sharing.
- Fix main component border radius
- Fixes ui-kit theme options and connects guard theme to it
- Improve readability by adding visual contrast between numbers and decimals.
- Fixes scrolled appbar in mobile view
- Updated dependency @rosen-bridge/icons@1.4.0

## 1.10.1

### Patch Changes

- Reducing font size for 'Pending...' in the Amount component ensures smoother rendering and a cleaner UI.
- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/utils@0.5.0

## 1.10.0

### Minor Changes

- Add a 'More' button to display additional details in the snackbar context

### Patch Changes

- Improve the styling and adjust font sizes in the Amount component for a better appearance.
- Updated @rosen-bridge/icons@1.3.0 dependency

## 1.9.2

### Patch Changes

- Update the UI of the version section to properly display all information and ensure it is fully responsive
- Fixes the height of inputs
- Ensure that icons are consistent in terms of name, color, size, and other attributes
- Updated @rosen-bridge/icons@1.2.0 dependency

## 1.9.1

### Patch Changes

- Resolve the issue with the page title in dark theme mode

## 1.9.0

### Minor Changes

- Add a component named ApiKeyModalWarning to handle reusable API key modal warning errors across all applications where it is used.
- Implement a lightweight carousel using the `embla-carousel-react` library

### Patch Changes

- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-ui/swr-helpers@0.2.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/utils@0.4.5

## 1.8.1

### Patch Changes

- Fixes dark palette and background color of brdige transaction card

## 1.8.0

### Minor Changes

- Refine the definition of the ApiKey's hook and provider to eliminate reliance on external package

### Patch Changes

- Uninstall `@rosen-ui/common-hooks` to reduce dependencies
- Move common theme options into ui kit
- Ensure words do not break inconsistently across different screen sizes in Health tab.
- Updated dependencies
  - @rosen-ui/constants@0.1.0
  - @rosen-ui/utils@0.4.4

## 1.7.2

### Patch Changes

- Update the rows per page options to remove the number 5 from the display
- Update the theme key in local storage to resolve the initialization loading bug
- Updated dependency @rosen-ui/utils@0.4.3

## 1.7.1

### Patch Changes

- Used useState directly instead of useModelManger hook
- Develop a Reusable Connector Component to Display Two Texts with an Arrow (→) in Between
- Enhance the ID component by adding a tooltip, a link with an icon, and improve its overall functionality
- Remove the useLocalStorage and interact directly with window.localStorage instead

## 1.7.0

### Minor Changes

- Revise the default layout to incorporate toolbar buttons into the sidebar for mobile devices
- Create an improved dialogue that aligns with our Figma design and ensures responsiveness

### Patch Changes

- Review theme colors in Figma and ensure consistency by identifying and fixing any mismatches
- Implement Version component to display versions
- Updated dependencies
- Updated the @rosen-bridge/icons@1.0.0 dependency

## 1.6.0

### Minor Changes

- Implement an App component that integrates common Context providers and supports a default layout
- Enhance the AppBar and AppLogo components to ensure it is fully responsive
- Introduce a new component called NavigationBar to manage its styles wherever it is utilized
- Revise the NavigationButton components to reflect the latest design changes

### Patch Changes

- Fix missing dependencies and remove unused packages
- Updated dependencies
  - @rosen-ui/common-hooks@0.1.1
  - @rosen-ui/utils@0.4.2

## 1.5.4

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration
- Identify and rectify the issues that caused console warnings and errors
- Updated the @rosen-bridge/icons@0.7.0 dependency

## 1.5.3

### Patch Changes

- Relocated the ApiKeyModal component for better organization

## 1.5.2

### Patch Changes

- Unified loading spinners across app versions, UI and contract displays
- Updated the @rosen-ui/constants@0.0.5 dependency

## 1.5.1

### Patch Changes

- Address the issue concerning the display of values in the Amount component

## 1.5.0

### Minor Changes

- Add the EnhancedDialogTitle component and update the AppBar, AppSnackbar, NavigationButton, and Toolbar components to support the new design while maintaining compatibility with the legacy theme
- Develop a component that displays a amount value along with its title and unit

### Patch Changes

- Address the warning regarding the absence of a unique key in the map function for array versions within the AppBar component

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

- Add default rowsPerPageOptions to EnhancedTable

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

- Set a maximum page size of 100 for events api
- Use the shared hooks package instaed of utils package to prenvet server component problems

### Patch Changes

- Fix app crash when a token fetched from database is not found
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
