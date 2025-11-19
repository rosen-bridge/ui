# @rosen-network/bitcoin-runes

## 1.0.0

### Major Changes

- Handle signing of p2wpkh UTXOs by:
  - Separately adding p2wpkh inputs to the PSBT
  - And returning sign indexes for each address alongside 2 PSBT strings encoded as base64 and hex

### Minor Changes

- Handle uncovered assets errors by throwing a suitable error to inform the user clearly
- Add the 4th step of utxo selection (fetch boxes under PaymentAddress of the address to cover required BTC)
- Implement functionalities of Bitcoin Runes network package

### Patch Changes

- Change unisatApiKey header to Authorization and Bearer
- Add the third step of utxo selection (fetch all remaining boxes of the address to cover required BTC)
- Update dependencies
  - @rosen-bridge/json-bigint@1.1.0
  - @rosen-bridge/tokens@4.0.1
  - @rosen-bridge/address-codec@1.0.1
  - @rosen-bridge/bitcoin-runes-utxo-selection@2.0.1
  - @rosen-bridge/icons@3.0.0
  - @rosen-network/base@0.5.0
  - @rosen-ui/constants@1.0.0
  - @rosen-ui/types@0.3.8

---

## 0.1.0

- The package has been **renamed** from `@rosen-network/runes`.
  You can track the previous history in the changelog of the old package. The latest update is available [here](https://github.com/rosen-bridge/ui/blob/dc6636546c11286080d4170f093fac6d03d9c8d1/networks/runes/CHANGELOG.md).
