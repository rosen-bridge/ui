# @rosen-bridge/rosen-app

## 4.9.0

### Minor Changes

- Adjusted field positions and section structure on `Event Details` page
- Add on chain token map feature

### Patch Changes

- Update dependency @rosen-bridge/ui-kit@4.1.0

## 4.8.0

### Minor Changes

- Add info text for `Duration` and `RSN Ratio` on the event details page
- Prevent page crash when users click during loading state in `Events` page
- Redesigns Information app section with new updates and improvements
- Upgrade React and React DOM to 18.3.1

### Patch Changes

- Prevent Bridge form from crashing on field validation errors
- Prevent UI crash on Assets grid view when changing `Items Per Page` value
- Fix `Unknown` status by correctly mapping the Processing event state on the Events List page
- Fix event list API by correcting status, adding flow count, and removing duplicates
- Update dependencies
  - @rosen-bridge/ui-kit@4.0.0
  - @rosen-bridge/icons@3.1.0
  - @rosen-ui/types@0.4.0
  - @rosen-network/base@0.5.1
  - @rosen-network/bitcoin@2.4.1
  - @rosen-network/bitcoin-runes@1.0.1
  - @rosen-network/cardano@2.5.1
  - @rosen-network/doge@0.4.1
  - @rosen-network/ergo@2.5.2
  - @rosen-network/evm@0.3.5
  - @rosen-ui/asset-calculator@2.2.1
  - @rosen-ui/utils@1.0.1
  - @rosen-ui/eternl-wallet@3.1.3
  - @rosen-ui/lace-wallet@3.1.3
  - @rosen-ui/metamask-wallet@2.1.5
  - @rosen-ui/my-doge-wallet@1.1.5
  - @rosen-ui/nautilus-wallet@3.1.3
  - @rosen-ui/okx-wallet@2.1.3
  - @rosen-ui/wallet-api@3.0.5
  - @rosen-ui/wallet-connect@0.2.5
  - @rosen-ui/xverse-wallet@0.3.1

## 4.7.1

### Patch Changes

- Disable interval-based SWR fetching on Assets page to reduce unnecessary API load
- Update dependencies
  - @rosen-bridge/ui-kit@3.0.1
  - @rosen-network/ergo@2.5.1

## 4.7.0

### Minor Changes

- Display `InsufficientAssetsError` as a toast to the user and prevent it from being logged to Discord
- Implement Event Details page
- Implement pagination for status apis and database actions
- Add filters, pagination, and sorting to the Assets API
- Better code structure for `Events` page to improve quality and maintainability
- Add contract version to app sidebar information
- Remove `paymentTxId` and `spendTxId` from `EventSidebar` for fraud status
- Update Supported NodeJS version to 22.18.0
- Improve and unify style implementation
- Integrate Vercel logging for server actions
- Implement the new `Assets` page
- Refactor `withValidation` to support both `Joi` and `Zod` validators with unified error handling
- Add a filter for `fraud` status in `events` page

### Patch Changes

- Upgrade scanner base dependencies
- Update helper usage to handle null values and leverage the improved compatibility of `utils` functions
- Fixed the issue where changing the source network to `Bitcoin` while a wallet is connected to a non-Bitcoin network causes an error related to native SegWit support, regardless of the wallet's connection status
- Fix incorrect filtering on `Event List` page by applying decimals normalization in DB query
- Added fraud status indicator on `Event List` page
- Fixed event list sorting by Reports count to ensure correct order
- Correct timestamp sorting on the Event List page to display events in proper chronological order
- Add Bitcoin Runes to xverse wallet networks
- Fix issue where clicking `Use All` button without an address dropped zero into the amount field by disabling the button until a valid address is entered
- Return distinct events by `eventId` to prevent duplicates in the `Event List` page
- Add root-level ESLint configuration and resolved existing linting issues
- Rename runes network to bitcoin-runes
- Update dependencies
  - @vercel/kv@3.0.0
  - @rosen-bridge/encryption@1.0.0
  - @rosen-bridge/abstract-observation-extractor@0.2.3
  - @rosen-bridge/abstract-scanner@0.2.3
  - @rosen-bridge/extended-typeorm@1.0.1
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/watcher-data-extractor@12.3.0
  - @rosen-bridge/ui-kit@3.0.0
  - @rosen-network/bitcoin-runes@1.0.0
  - @rosen-ui/data-source@0.2.0
  - @rosen-network/ergo@2.5.0
  - @rosen-bridge/icons@3.0.0
  - @rosen-ui/public-status@0.1.0
  - @rosen-network/evm@0.3.4
  - @rosen-ui/xverse-wallet@0.3.0
  - @rosen-ui/asset-calculator@2.2.0
  - @rosen-network/bitcoin@2.4.0
  - @rosen-ui/wallet-connect@0.2.4
  - @rosen-ui/wallet-api@3.0.4
  - @rosen-network/ethereum@0.4.2
  - @rosen-network/binance@0.4.2
  - @rosen-network/cardano@2.5.0
  - @rosen-ui/metamask-wallet@2.1.4
  - @rosen-ui/nautilus-wallet@3.1.2
  - @rosen-ui/eternl-wallet@3.1.2
  - @rosen-network/base@0.5.0
  - @rosen-network/doge@0.4.0
  - @rosen-ui/lace-wallet@3.1.2
  - @rosen-ui/utils@1.0.0
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/my-doge-wallet@1.1.4
  - @rosen-ui/types@0.3.8
  - @rosen-ui/okx-wallet@2.1.2

## 4.6.0

### Minor Changes

- Improved network handling by checking `getNetwork` results before adding to **sources** and **targets**, preventing
  potential errors

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependencies
  - @rosen-bridge/ui-kit@2.4.0
  - @rosen-bridge/icons@2.3.1
  - @rosen-ui/asset-calculator@2.1.8
  - @rosen-ui/public-status@0.0.2
  - @rosen-ui/wallet-connect@0.2.3
  - @rosen-ui/data-source@0.1.1
  - @rosen-ui/swr-helpers@0.2.2
  - @rosen-ui/constants@0.4.1
  - @rosen-ui/wallet-api@3.0.3
  - @rosen-network/ethereum@0.4.1
  - @rosen-network/binance@0.4.1
  - @rosen-network/bitcoin@2.3.1
  - @rosen-network/cardano@2.4.1
  - @rosen-ui/metamask-wallet@2.1.3
  - @rosen-ui/nautilus-wallet@3.1.1
  - @rosen-ui/my-doge-wallet@1.1.3
  - @rosen-network/runes@0.3.1
  - @rosen-ui/types@0.3.7
  - @rosen-ui/utils@0.6.1
  - @rosen-ui/eternl-wallet@3.1.1
  - @rosen-ui/xverse-wallet@0.2.2
  - @rosen-network/base@0.4.1
  - @rosen-network/doge@0.3.1
  - @rosen-network/ergo@2.4.1
  - @rosen-network/evm@0.3.3
  - @rosen-ui/lace-wallet@3.1.1
  - @rosen-ui/okx-wallet@2.1.1

## 4.5.0

### Minor Changes

- Add timestamp for `EventCard` in `Events` page
- Update `TransactionInfo` error message with `Truncate` component
- Add public-status api routes and database actions to rosen-app
- Add See Details button for tablet and smaller screen sizes in Events page
- Replaced all `Card` components with custom `Card2`

### Patch Changes

- Fixed the search functionality for status filtering on the `Events` page
- Fix incorrect transaction URL generation in the `Tx IDs` section of the Sidebar component on the `Events` page
- Remove Go home button in `Events Details` page
- Fix stuck loading on bridge form when Target Address is provided but Target Network is missing
- Fix height issue on `Events` page for `EmptyState` component
- Remove the use of the getTokenNameAndId utility
- Update dependencies
  - @rosen-ui/data-source@0.1.0
  - @rosen-bridge/ui-kit@2.3.0
  - @rosen-network/base@0.4.0
  - @rosen-network/ethereum@0.4.0
  - @rosen-network/binance@0.4.0
  - @rosen-network/bitcoin@2.3.0
  - @rosen-network/cardano@2.4.0
  - @rosen-network/runes@0.3.0
  - @rosen-network/doge@0.3.0
  - @rosen-network/ergo@2.4.0
  - @rosen-ui/wallet-api@3.0.2
  - @rosen-ui/metamask-wallet@2.1.2
  - @rosen-ui/wallet-connect@0.2.2
  - @rosen-ui/my-doge-wallet@1.1.2

## 4.4.0

### Minor Changes

- Redesigned the event page for a cleaner and more organized experience
- Added search and sort functionality to help users find events more easily
- Made the layout fully responsive across all screen sizes, including mobile
- Improved navigation and browsing for a smoother user experience
- Introduced a new card-based layout for better readability of events
- Added a side panel to display additional details for each event
- Add clickable transaction link in snackbar after submission
- Replace @rosen-bridge/extended-typeorm with @rosen-ui/data-source package

### Patch Changes

- Replace the general Next.js server action with the network address validator function
- Fix missing prop in SubmitButton component
- Separate components of wallet and transaction info cards in bridge
- Update dependencies
  - @rosen-bridge/ui-kit@2.2.0
  - @rosen-network/ethereum@0.3.0
  - @rosen-network/binance@0.3.0
  - @rosen-network/bitcoin@2.2.0
  - @rosen-network/cardano@2.3.0
  - @rosen-network/runes@0.2.0
  - @rosen-network/doge@0.2.0
  - @rosen-network/ergo@2.3.0
  - @rosen-ui/xverse-wallet@0.2.1
  - @rosen-network/base@0.3.0
  - @rosen-bridge/icons@2.3.0
  - @rosen-ui/metamask-wallet@2.1.1
  - @rosen-ui/wallet-connect@0.2.1
  - @rosen-ui/my-doge-wallet@1.1.1
  - @rosen-ui/wallet-api@3.0.1

## 4.3.0

### Minor Changes

- Improve the Events API context by adding support for filters

### Patch Changes

- Handle exceptions arising from fetching the maximum transfer amount due to an invalid target address
- Update dependencies
  - @rosen-network/ergo@2.2.1
  - @rosen-bridge/icons@2.2.0
  - @rosen-bridge/ui-kit@2.1.0

## 4.2.2

### Patch Changes

- Apply patch for @rosen-bridge/abstract-box-selection (Fix calculation of change box count)

## 4.2.1

### Patch Changes

- Use new identifier component in bridge confirm modal
- Updated the `Transaction Confirmation` dialog to use design system components instead of custom solutions
- Update the usage of the `NavigationBar` component to align with the latest changes in the `ui-kit` package
- Fix the overflow style and scroll effect of app component
- Update dependencies
  - @rosen-network/ergo@2.2.0
  - @rosen-bridge/icons@2.1.0
  - @rosen-bridge/ui-kit@2.0.0
  - @rosen-ui/wallet-connect@0.2.0
  - @rosen-ui/metamask-wallet@2.1.0
  - @rosen-ui/nautilus-wallet@3.1.0
  - @rosen-ui/my-doge-wallet@1.1.0
  - @rosen-ui/eternl-wallet@3.1.0
  - @rosen-ui/xverse-wallet@0.2.0
  - @rosen-ui/lace-wallet@3.1.0
  - @rosen-ui/okx-wallet@2.1.0
  - @rosen-ui/wallet-api@3.0.0
  - @rosen-network/cardano@2.2.0
  - @rosen-ui/asset-calculator@2.1.7
  - @rosen-network/evm@0.3.2

## 4.2.0

### Minor Changes

- Integrate the WalletConnect protocol to support Ethereum and Binance networks
- Integrate the Xverse wallet extension to enable Bitcoin transactions through both the extension itself and Ledger devices

### Patch Changes

- Ensure automatically trim whitespace on TargetAddress field.
- Fix spacing of the toolbar
- Replace transaction info card of bridge with new Label and Amount components
- Fix min and max size of transaction info of bridge
- Update wallet icon usage to align with the latest changes in wallet packages
- Fix the bridge page layout
- Fixes page heading
- Enhance wallets and networks usage by incorporating the latest updates to the new structure
- Remove assets beta badge
- Update dependencies
  - @rosen-clients/ergo-explorer@1.1.5
  - @rosen-ui/metamask-wallet@2.0.0
  - @rosen-ui/nautilus-wallet@3.0.0
  - @rosen-ui/my-doge-wallet@1.0.0
  - @rosen-ui/eternl-wallet@3.0.0
  - @rosen-ui/lace-wallet@3.0.0
  - @rosen-ui/okx-wallet@2.0.0
  - @rosen-ui/wallet-connect@0.1.0
  - @rosen-ui/xverse-wallet@0.1.0
  - @rosen-bridge/ui-kit@1.12.0
  - @rosen-network/ethereum@0.2.4
  - @rosen-network/binance@0.2.4
  - @rosen-network/bitcoin@2.1.4
  - @rosen-network/cardano@2.1.4
  - @rosen-network/runes@0.1.1
  - @rosen-network/doge@0.1.3
  - @rosen-network/ergo@2.1.3
  - @rosen-network/evm@0.3.1
  - @rosen-bridge/address-codec@0.6.2
  - @rosen-bridge/icons@2.0.0
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/utils@0.6.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/asset-calculator@2.1.6
  - @rosen-ui/types@0.3.6

## 4.1.1

### Patch Changes

- Replace the 'Connect' button to display 'Disconnect' once a wallet is connected in ChooseWallet part.
- Update rosen dependencies
- Fix the Rosen bridge background pattern
- Set the height of the transaction section to match the height of the bridge form.
- Updated dependencies
  - @rosen-ui/my-doge-wallet@0.2.1
  - @rosen-bridge/ui-kit@1.11.0
  - @rosen-network/doge@0.1.2
  - @rosen-bridge/icons@1.4.0
  - @rosen-ui/metamask-wallet@1.4.1
  - @rosen-ui/nautilus-wallet@2.3.4
  - @rosen-ui/eternl-wallet@2.3.4
  - @rosen-ui/lace-wallet@2.3.4
  - @rosen-ui/okx-wallet@1.3.4
  - @rosen-ui/asset-calculator@2.1.5

## 4.1.0

### Minor Changes

- Implement a notifier to send critical errors to the Rosen team's Discord channel
- Add the fromChain field to the wallet-api and fix the generateTxParameters function on EVM networks.

### Patch Changes

- Updated dependencies
  - @rosen-ui/constants@0.3.0
  - @rosen-ui/wallet-api@1.4.0
  - @rosen-ui/metamask-wallet@1.4.0
  - @rosen-network/evm@0.3.0
  - @rosen-ui/nautilus-wallet@2.3.3
  - @rosen-ui/eternl-wallet@2.3.3
  - @rosen-ui/lace-wallet@2.3.3
  - @rosen-ui/okx-wallet@1.3.3
  - @rosen-ui/utils@0.5.0
  - @rosen-bridge/ui-kit@1.10.1
  - @rosen-network/bitcoin@2.1.3
  - @rosen-network/doge@0.1.1
  - @rosen-ui/asset-calculator@2.1.4
  - @rosen-ui/types@0.3.5

## 4.0.6

### Patch Changes

- Utilize the Amount component to ensure clear presentation of financial data.
- Display error details in the Snackbar when transaction submission fails
- Updated dependencies
  - @rosen-bridge/ui-kit@1.10.0
  - @rosen-ui/wallet-api@1.3.1
  - @rosen-network/cardano@2.1.3
  - @rosen-ui/metamask-wallet@1.3.2
  - @rosen-ui/nautilus-wallet@2.3.2
  - @rosen-ui/eternl-wallet@2.3.2
  - @rosen-ui/lace-wallet@2.3.2
  - @rosen-ui/okx-wallet@1.3.2
  - @rosen-bridge/icons@1.3.0

## 4.0.5

### Patch Changes

- Implement responsive design for the tablet view to ensure optimal user interface experience across devices
- Update the display of warnings for selecting Bitcoin as the source network
- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package
- Fixes the height of inputs
- Ensure that icons are consistent in terms of name, color, size, and other attributes
- Implement a Version component to display detailed version information for the application
- Update the UI with a new design for the wallet disconnect feature
- Upgrade Next.js to the latest version (14.2.25) to resolve vulnerabilities associated with the CVE-2025-29927
- Updated dependencies
  - @rosen-bridge/ui-kit@1.9.2
  - @rosen-bridge/icons@1.2.0
  - @rosen-ui/asset-calculator@2.1.3
  - @rosen-ui/wallet-api@1.3.0
  - @rosen-network/bitcoin@2.1.2
  - @rosen-network/cardano@2.1.2
  - @rosen-ui/metamask-wallet@1.3.1
  - @rosen-ui/nautilus-wallet@2.3.1
  - @rosen-ui/eternl-wallet@2.3.1
  - @rosen-network/ergo@2.1.2
  - @rosen-network/evm@0.2.2
  - @rosen-ui/lace-wallet@2.3.1
  - @rosen-ui/okx-wallet@1.3.1

## 4.0.4

### Patch Changes

- Discontinue support for the Nami extension wallet
- Update server functions to work with the asynchronously loaded token map
- Update the usage of network constants to enhance maintainability
- Fixes dark palette and background color of brdige transaction card
- Trigger validation for the `address` and `amount` fields when the user clicks `Paste` in the address input and `Use All` in the amount input
- Updated dependencies
  - @rosen-bridge/icons@1.1.0
  - @rosen-network/bitcoin@2.1.1
  - @rosen-network/cardano@2.1.1
  - @rosen-network/ergo@2.1.1
  - @rosen-network/evm@0.2.1
  - @rosen-ui/swr-helpers@0.2.1
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/wallet-api@1.2.1
  - @rosen-ui/metamask-wallet@1.3.0
  - @rosen-ui/nautilus-wallet@2.3.0
  - @rosen-ui/types@0.3.4
  - @rosen-ui/utils@0.4.5
  - @rosen-ui/eternl-wallet@2.3.0
  - @rosen-ui/lace-wallet@2.3.0
  - @rosen-ui/okx-wallet@1.3.0
  - @rosen-bridge/ui-kit@1.9.0
  - @rosen-ui/asset-calculator@2.1.2

## 4.0.3

### Patch Changes

- Uninstall `@rosen-ui/common-hooks` to reduce dependencies
- Refactor the network context into dedicated packages to decouple it from the application, enhancing maintainability
- Enhance the useMaxTransfer hook to boost performance
- Change the label of 'Address' to 'Target Address' in BridgeForm component
- Enhance the paste button functionality for the Target Address field by implementing validation for pasted addresses.
- Fix the issue related to getting the max amount for the transfer
- Address the issue of automatic wallet reconnection after selecting the source network
- Decouple the network type from the wallets to enable the separation of networks within their packages, thereby improving code quality
- Transfer the getMaxTransfer functions to their respective packages
- Enhance UI hooks to boost performance and improve maintainability
- Updated dependencies
  - @rosen-bridge/ui-kit@1.8.0
  - @rosen-ui/wallet-api@1.2.0
  - @rosen-ui/metamask-wallet@1.2.0
  - @rosen-ui/nautilus-wallet@2.2.0
  - @rosen-ui/eternl-wallet@2.2.0
  - @rosen-ui/lace-wallet@2.2.0
  - @rosen-ui/nami-wallet@2.2.0
  - @rosen-ui/okx-wallet@1.2.0
  - @rosen-ui/constants@0.1.0
  - @rosen-network/bitcoin@2.1.0
  - @rosen-network/cardano@2.1.0
  - @rosen-network/ergo@2.1.0
  - @rosen-network/evm@0.2.0
  - @rosen-ui/asset-calculator@2.1.1
  - @rosen-ui/types@0.3.3
  - @rosen-ui/utils@0.4.4

## 4.0.2

### Patch Changes

- Update the Lodash version to the latest release to enhance consistency
- Updated dependencies
  - @rosen-bridge/ui-kit@1.7.2
  - @rosen-ui/utils@0.4.3

## 4.0.1

### Patch Changes

- Install a reliable and consistent version of the @types/node npm package
- Enhance the React components by using the `PropsWithChildren` type instead of creating a custom type definition for scenarios that only require children props
- Enhance the useNetwork hook to boost performance
- Disable the forced uppercase format for token name in the balance field
- Improve the wallet connection logic and implement more effective error handling within the transaction process
- Use connector component to eliminating redundant code for a cleaner code
- Update the usage of the ID component
- Eliminate the dependency on the extensionless package and ensure that Viteset is compatible with the TSX package
- Optimize the utilization of variable environments through automated processes
- Enhance the useBalance hook to boost performance
- Updated dependencies
  - @rosen-ui/asset-calculator@2.1.0
  - @rosen-ui/metamask-wallet@1.1.0
  - @rosen-ui/nautilus-wallet@2.1.0
  - @rosen-ui/eternl-wallet@2.1.0
  - @rosen-ui/lace-wallet@2.1.0
  - @rosen-ui/nami-wallet@2.1.0
  - @rosen-ui/okx-wallet@1.1.0
  - @rosen-bridge/ui-kit@1.7.1
  - @rosen-ui/wallet-api@1.1.0
  - @rosen-network/bitcoin@2.0.1

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
