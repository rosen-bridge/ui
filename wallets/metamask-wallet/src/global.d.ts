/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    ethereum: {
      isMetaMask: boolean;
      _metamask: unknown;
    };
  }
}
