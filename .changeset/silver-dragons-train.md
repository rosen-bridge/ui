---
'@rosen-ui/wallet-api': minor
---

- Add a `NonNativeSegWitAddressError` class
- Ensure all wallet errors extend the `WalletError` base class
- Update the `getAddress` function to properly handle address validation errors
