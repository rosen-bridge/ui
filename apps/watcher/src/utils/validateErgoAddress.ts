/**
 * Validates an Ergo address (mainnet or testnet) using ergo-lib-wasm-browser.
 * Lazy-loads the WASM module on first invocation to keep the initial bundle small.
 *
 * Approximates the validation behavior of @rosen-bridge/address-codec used by
 * the Rosen app, adapted for browser execution (Watcher has no server boundary).
 * Network-agnostic: accepts both mainnet and testnet Ergo addresses.
 *
 * @param address - The base58-encoded Ergo address to validate.
 * @returns true if the address is a valid Ergo address (mainnet or testnet),
 *          false otherwise.
 */
export const validateErgoAddress = async (
  address: string,
): Promise<boolean> => {
  try {
    const { Address } = await import('ergo-lib-wasm-browser');
    Address.from_base58(address);
    return true;
  } catch {
    return false;
  }
};
