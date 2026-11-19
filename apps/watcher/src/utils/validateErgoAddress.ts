/** Validate an Ergo address in the browser, using the bridge form's messages. */
export const validateErgoAddress = async (value: string): Promise<string | undefined> => {
  if (!value) return 'Address cannot be empty';

  try {
    // Load the browser bindings only when validation is needed. Both Ergo
    // networks are valid; the watcher can also be configured for testnet.
    const { Address } = await import('ergo-lib-wasm-browser');

    let address: InstanceType<typeof Address>;
    try {
      address = Address.from_base58(value);
    } catch {
      return 'Invalid Address';
    }

    address.free();
    return undefined;
  } catch {
    return 'Something went wrong! please try again';
  }
};
