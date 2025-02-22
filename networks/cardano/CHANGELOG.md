# @rosen-network/cardano

## 2.1.0

### Minor Changes

- Encapsulate the network context within a class to enhance maintainability and simplify future modifications
- Define the getMaxTransfer function to enhance maintainability and achieve better encapsulation

## 2.0.0

### Major Changes

- Eliminate the reliance on the @rosen-ui/wallet-api package and remove any unrelated type definitions

## 1.0.1

### Patch Changes

- Update the source code to address the issues identified by the new ESLint rules configuration

## 1.0.0

### Major Changes

- Update the input parameter of the `generateUnsignedTx` function from an `UNWRAPPED-VALUE` to a `WRAPPED-VALUE`.

### Patch Changes

- Enhance the generateUnsignedTx utility functions within the networks package
- Revise the wallet creation logic and update the access type for each API.
- Strengthen type safety and enforce robust typing for Chain and Network types
- Add the tokenMap configuration to the wallet creator's setup.

## 0.1.1

### Patch Changes

- Package the Cardano logic as a standalone module to ensure its independence and maintainability.
