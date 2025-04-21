# @rosen-network/evm

## 0.3.0

### Minor Changes

- Add the fromChain field to the wallet-api and fix the generateTxParameters function on EVM networks.

## 0.2.2

### Patch Changes

- Enhance the logic associated with TokenMap to ensure compatibility with the latest version of the `@rosen-bridge/tokens` package

## 0.2.1

### Patch Changes

- Update server functions to work with the asynchronously loaded token map
- Standardize tsconfig.json file and eliminate the src directory from the output path
- Update the usage of network constants to enhance maintainability

## 0.2.0

### Minor Changes

- Encapsulate the network context within a class to enhance maintainability and simplify future modifications
- Define the getMaxTransfer function to enhance maintainability and achieve better encapsulation

## 0.1.1

### Patch Changes

- Change the name of @rosen-network/ethereum to @rosen-network/evm
- Eliminate the reliance on the @rosen-ui/wallet-api package and remove any unrelated type definitions
- Enhance the generateUnsignedTx utility functions within the networks package
- Initialize the Ethereum network package.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Address the issue related to retrieving the token balance in Ethereum
