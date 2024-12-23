# @rosen-bridge/rosen-app

## 4.0.0

### Major Changes

- Discontinue support for the Flint and Vespr wallets

### Minor Changes

- Enhance error handling on the bridge form and automatically close the transaction modal upon successful processing
- Revise the wallet-related logic to align with the latest updates in the wallet packages
- Improve the transaction dialog confirmation to enhance its responsiveness and user experience

### Patch Changes

- Review theme colors in Figma and ensure consistency by identifying and fixing any mismatches
- Refactor the token map hook to enhance efficiency
- Add a paste button to the address field in the bridge form
- Address the issue where selecting a token with assets and then switching to a token without any causes the 'use all' button to display an incorrect amount instead of zero
- Integrated the Version component in the SideBar to display version information optimized for both desktop and mobile views.
- Updated dependencies
  - @rosen-bridge/icons@1.0.0
  - @rosen-bridge/ui-kit@1.7.0
  - @rosen-network/ethereum@1.0.0
  - @rosen-network/bitcoin@2.0.0
  - @rosen-network/cardano@2.0.0
  - @rosen-network/ergo@2.0.0
  - @rosen-ui/metamask-wallet@1.0.0
  - @rosen-ui/nautilus-wallet@2.0.0
  - @rosen-ui/okx-wallet@1.0.0
  - @rosen-ui/eternl-wallet@2.0.0
  - @rosen-ui/lace-wallet@2.0.0
  - @rosen-ui/nami-wallet@2.0.0

## 3.0.0

### Major Changes

- Discontinue support for the Xdefi wallet extension

### Minor Changes

- Update the root layout to incorporate the latest changes from the UI kit, enhancing its responsiveness

### Patch Changes

- Fix missing dependencies and remove unused packages
- Updated dependencies
  - @rosen-ui/asset-calculator@2.0.1
  - @rosen-ui/metamask-wallet@0.1.4
  - @rosen-ui/nautilus-wallet@1.0.3
  - @rosen-ui/common-hooks@0.1.1
  - @rosen-ui/eternl-wallet@1.0.3
  - @rosen-ui/flint-wallet@1.0.3
  - @rosen-ui/vespr-wallet@0.0.11
  - @rosen-ui/lace-wallet@1.0.3
  - @rosen-ui/nami-wallet@1.0.3
  - @rosen-bridge/ui-kit@1.6.0
  - @rosen-ui/utils@0.4.2

## 2.6.0

### Minor Changes

- Include a warning regarding the Bitcoin value in the source field of the Bridge form

### Patch Changes

- Revise the calculation logic for determining the cold amount on the assets page
- Identify and rectify the issues that caused console warnings and errors
- Updated dependencies
  - @rosen-ui/nautilus-wallet@1.0.2
  - @rosen-ui/eternl-wallet@1.0.2
  - @rosen-ui/flint-wallet@1.0.2
  - @rosen-ui/vespr-wallet@0.0.10
  - @rosen-ui/xdefi-wallet@1.0.3
  - @rosen-ui/lace-wallet@1.0.2
  - @rosen-ui/nami-wallet@1.0.2
  - @rosen-network/cardano@1.0.1
  - @rosen-network/bitcoin@1.1.0

## 2.5.0

### Minor Changes

- Enhance the Rosen Bridge page by incorporating a captivating background image

### Patch Changes

- Refactor default exports to named exports in JavaScript modules for enhanced code clarity and maintainability
- Improve maintainability by incorporating an index file in each directory to streamline the export of all controlled values
- Enhance the Rosen app's source code by reorganizing, relocating, and renaming certain files and methods

## 2.4.0

### Minor Changes

- Develop a filtering mechanism for the bridge page that excludes tokens listed on a blacklist
- Revise the Prettier configuration to ensure that imports are sorted

### Patch Changes

- Replaced token strings with NATIVE_TOKENS constants
- Update scanner packages
- Resolve the issue concerning token removal in the autocomplete input field, ensuring accurate recalculation and display of fees

## 2.3.0

### Minor Changes

- Add a favicon to enhance browser visibility

## 2.2.0

### Minor Changes

- Ensure the code is compatible with the latest design
- Implement a new utility called `safeServerAction`, phase out the previous version, and update all server actions to ensure compatibility with the latest enhancements.
- Enhance server actions to align with the latest updates to the wrap/unwrap utility in preparation for the logger

### Patch Changes

- Updated the .env.example file with the latest data from the .env file

## 2.1.0

### Minor Changes

- Improve the token selection in the bridge form by incorporating a search functionality

## 2.0.0

### Major Changes

- Update the `getMaxTransfer` server action in the networks to return a `WRAPPED-VALUE`.
- Integrate Ethereum
- Transform the Rosen amount type from a numerical format to a bigint data type.

### Minor Changes

- Implement logic for automatic detection of installed wallets in runtime without the need to refresh the page.
- Revise the theme provider code to incorporate the latest updates from the design system
- Add token id of the bridged asset to asset details API response
- Improve the sidebar component to accept child elements as specific props, enhancing maintainability and enabling future implementation of responsive design
- Enable CORS headers for allowing certain origins to access APIs
- Set up an alert for the ledger whenever the Ethereum source network is selected
- Develop a utility to validate the arguments for server actions.
- Integrate the MetaMask wallet package into the Rosen app.
- Develop a responsive assets page that allows users to view detailed information about each asset, ensuring a seamless user experience across various devices and screen sizes.
- Implement an error handling utility for the server actions

### Patch Changes

- Fix issue of "All" network item not being selected in assets page in first load
- Refine and strengthen the validation process for network addresses to ensure greater accuracy and reliability.
- Fix the external token link within the assets page
- Revise the bridge form to enhance maintainability.
- Sort the results of the query on the assets repository service by the name property
- Strengthen type safety and enforce robust typing for Chain and Network types
- Address the issue concerning the display of hot, cold, and locked amount values on the assets page
- Implement utility functions to facilitate the transfer of the BigInt data type between the server and client in server actions.
- Implement cache utility to optimize performance for server actions and Display a zero balance when the wallet balance is zero or when the token is unsupported.
- The .env files are included in the .gitignore file for all UI applications to ensure sensitive information remains secure
- Improve the error handling for the validateAddress function and implement result caching using centralized cache utilities
- Add the tokenMap configuration to the wallet creator's setup.
- Update server actions for error handling based on new error handling module
- Refined Rosen app code for better maintainability by unifying environment variable access, reviewing database service code in assets and events, and enhancing type usage throughout the application.
- Update the asset user interface to align with the latest API changes.
- Fix the Events page in the Rosen app to ensure accurate display of amounts and fees with the correct decimal places

## 1.1.1

### Patch Changes

- Refactor the Network constant usage and eliminate unnecessary utilities
- Implement validation for Bitcoin addresses
- Prevent the assets page from crashing if tokens file networks mismatch with the project networks
- Updated dependencies
  - @rosen-ui/nami-wallet@0.1.3
  - @rosen-ui/nautilus-wallet@0.2.0
  - @rosen-ui/xdefi-wallet@0.4.0
  - @rosen-ui/utils@0.3.0
  - @rosen-network/bitcoin@0.2.0
  - @rosen-network/ergo@0.1.2
  - @rosen-ui/eternl-wallet@0.1.3
  - @rosen-ui/flint-wallet@0.1.3
  - @rosen-ui/lace-wallet@0.1.3
  - @rosen-ui/vespr-wallet@0.0.7
  - @rosen-ui/wallet-api@1.0.2

## 1.1.0

### Minor Changes

- Add rate limit mechanism to APIs and server actions

### Patch Changes

- Change submit button state to loading while the fees are being fetched
- Reset fee data whenever source, target, or token changes
- Package the Bitcoin/Ergo logic as a standalone module to ensure its independence and maintainability.
- Package the Cardano logic as a standalone module to ensure its independence and maintainability.
- Updated dependencies
  - @rosen-ui/nautilus-wallet@0.1.1
  - @rosen-ui/xdefi-wallet@0.3.2
  - @rosen-network/bitcoin@0.1.1
  - @rosen-network/ergo@0.1.1
  - @rosen-ui/eternl-wallet@0.1.2
  - @rosen-ui/flint-wallet@0.1.2
  - @rosen-ui/lace-wallet@0.1.2
  - @rosen-ui/nami-wallet@0.1.2
  - @rosen-network/cardano@0.1.1

## 1.0.1

### Patch Changes

- Fix URL issue for Bitcoin transactions
- Updated dependencies
  - @rosen-ui/utils@0.2.0
  - @rosen-ui/eternl-wallet@0.1.1
  - @rosen-ui/flint-wallet@0.1.1
  - @rosen-ui/lace-wallet@0.1.1
  - @rosen-ui/nami-wallet@0.1.1
  - @rosen-ui/vespr-wallet@0.0.6
  - @rosen-ui/wallet-api@1.0.1
  - @rosen-ui/xdefi-wallet@0.3.1

## 1.0.0

### Major Changes

- Upgrade @rosen-bridge/minimum-fee to latest
- Implement Bitcoin max transfer calculation and update network type

### Minor Changes

- Increased security to prevent clickjacking issues
- Add asset details API for getting details of the asset, plus its locked and bridged data
- The display of IDs was improved
- Add assets API for getting data of all supported bridge assets, including their locked and bridged amounts

### Patch Changes

- Refactor the Flint wallet logic to reside within its own package
- Refactor the Lace wallet logic to reside within its own package
- Refactor the Nautilus wallet logic to reside within its own package
- Fix issue of calling unimplemented `getAddress` function for non-Bitcoin wallets
- Refactor the Eternl wallet logic to reside within its own package
- Make dynamic calculation for max transferable amount
- Resolve the stale balance problem, when changing the source/target wallet the balance doesn't reset.
- Fix xDefi wallet getAddress API usage
- Resolve the negative amount when clicking on the balance with zero value in these states

  - Cardano > Ergo (ADA)
  - Bitcoin > Ergo (BTC)
  - Bitcoin > Cardano (BTC)

- Clean the console error in the root page
- Refactor the xdefi-wallet package to encapsulate the logic in its package
- Refactor the Nami wallet logic to reside within its own package
- Updated dependencies
  - @rosen-ui/nautilus-wallet@0.1.0
  - @rosen-ui/eternl-wallet@0.1.0
  - @rosen-ui/flint-wallet@0.1.0
  - @rosen-ui/xdefi-wallet@0.3.0
  - @rosen-ui/lace-wallet@0.1.0
  - @rosen-ui/nami-wallet@0.1.0
  - @rosen-ui/wallet-api@1.0.0
  - @rosen-ui/asset-calculator@1.0.1
  - @rosen-ui/vespr-wallet@0.0.5

## 0.6.0

### Minor Changes

- Integrate bitcoin
- Add page size of 100 to tables
- Add Bitcoin network
- Link app logo to the root page

### Patch Changes

- Add unit testing
- Updated dependencies
  - @rosen-ui/asset-calculator@0.1.0
  - @rosen-ui/xdefi-wallet@0.2.0
  - @rosen-ui/utils@0.1.1
  - @rosen-ui/eternl-wallet@0.0.4
  - @rosen-ui/flint-wallet@0.0.4
  - @rosen-ui/lace-wallet@0.0.4
  - @rosen-ui/nami-wallet@0.0.4
  - @rosen-ui/nautilus-wallet@0.0.4
  - @rosen-ui/vespr-wallet@0.0.4

## 0.5.0

### Minor Changes

- Upgrade extractor packages

## 0.4.0

### Minor Changes

- Display service and ui versions in the sidebar

### Patch Changes

- Fix the floating point number conversion to bigint problem
- Upgrade nextjs version
- Updated dependencies
  - @rosen-ui/eternl-wallet@0.0.3
  - @rosen-ui/flint-wallet@0.0.3
  - @rosen-ui/lace-wallet@0.0.3
  - @rosen-ui/nami-wallet@0.0.3
  - @rosen-ui/nautilus-wallet@0.0.3
  - @rosen-ui/vespr-wallet@0.0.3

## 0.3.0

### Minor Changes

- Set a maximum page size of 100 for events api
- Use the shared hooks package instead of utils package to prevent server component problems

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
