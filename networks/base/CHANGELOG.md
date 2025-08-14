# @rosen-network/base

## 0.4.1

### Patch Changes

- Set the `license` field in package.json to `MIT`
- Update dependency @rosen-ui/types@0.3.7

## 0.4.0

### Minor Changes

- Create a base function called `getMinTransferCreator`, and utilize it within each network's package to get min transfer amount
- Create a base function called `calculateFeeCreator`, and utilize it within each network's package to calculate transaction fees

## 0.3.0

### Minor Changes

- Add a utility to validate addresses based on different networks

## 0.2.2

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package

## 0.2.1

### Patch Changes

- Standardize tsconfig.json file and eliminate the src directory from the output path

## 0.2.0

### Minor Changes

- Encapsulate the network context within a class to enhance maintainability and simplify future modifications
