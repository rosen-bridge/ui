# @rosen-bridge/rosen-app

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

- upgrade @rosen-bridge/minimum-fee to latest
- implement Bitcoin max transfer calculation and update network type

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
- fix xDefi wallet getAddress API usage
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

- integrate bitcoin
- add page size of 100 to tables
- add Bitcoin network
- link app logo to the root page

### Patch Changes

- add unit testing
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

- upgrade extractor packages

## 0.4.0

### Minor Changes

- display service and ui versions in the sidebar

### Patch Changes

- fix the floating point number conversion to bigint problem
- upgrade nextjs version
- updated dependencies
  - @rosen-ui/eternl-wallet@0.0.3
  - @rosen-ui/flint-wallet@0.0.3
  - @rosen-ui/lace-wallet@0.0.3
  - @rosen-ui/nami-wallet@0.0.3
  - @rosen-ui/nautilus-wallet@0.0.3
  - @rosen-ui/vespr-wallet@0.0.3

## 0.3.0

### Minor Changes

- set a maximum page size of 100 for events api
- use the shared hooks package instead of utils package to prevent server component problems

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
