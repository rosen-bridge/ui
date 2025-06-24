# @rosen-ui/wallet-connect

## 0.1.0

### Major Changes

- Synchronize the implementation with the latest changes in the `@rosen-ui/wallet-api` package by overriding the `transfer`, `connect`, `getAddress`, and `getBalance` methods to simplify the code and reduce duplication

### Patch Changes

- Optimize the structure to enhance compatibility with network packages and streamline usage within the Rosen App
- Eliminate icon dependencies by embedding raw SVG icons as strings
- Update dependencies
  - @rosen-bridge/tokens@3.1.1
  - @rosen-network/ethereum@0.2.4
  - @rosen-network/binance@0.2.4
  - @rosen-ui/constants@0.4.0
  - @rosen-ui/wallet-api@2.0.0
  - @rosen-ui/types@0.3.6
