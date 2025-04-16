# @rosen-ui/asset-calculator

## 2.1.4

### Patch Changes

- Temporarily fix the generateTxParameters function for EVM networks

## 2.1.3

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package

## 2.1.2

### Patch Changes

- Update the usage of network constants to enhance maintainability
- Updated dependencies
  - @rosen-ui/constants@0.2.0
  - @rosen-ui/types@0.3.4

## 2.1.1

### Patch Changes

- Improve base calculator logs
- Updated dependencies
  - @rosen-ui/constants@0.1.0
  - @rosen-ui/types@0.3.3

## 2.1.0

### Minor Changes

- Add binance chain asset calculator

### Patch Changes

- Install a reliable and consistent version of the @types/node npm package
- Eliminate the dependency on the extensionless package and ensure that Viteset is compatible with the TSX package

## 2.0.1

### Patch Changes

- Fix missing dependencies and remove unused packages

## 2.0.0

### Major Changes

- To implement decimal drop context, convert unwrapped values into wrapped values.

### Minor Changes

- Add evm asset calculator and ethereum calculator interface
- Save bridged token ids inside bridged assets table

### Patch Changes

- Strengthen type safety and enforce robust typing for Chain and Network types

## 1.0.1

### Patch Changes

- Fix issue of supposing all ergo addresses contain all of the supported tokens

## 1.0.0

### Major Changes

- save asset data individually for all bridged chains

### Minor Changes

- Store locked asset data in the database based on TokenMap file
- Add Bitcoin asset calculator for enabling calculation of bridged assets on Bitcoin (which is, in essence, always zero)
