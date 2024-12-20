# @rosen-ui/asset-calculator

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
