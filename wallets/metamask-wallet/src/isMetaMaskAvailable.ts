/**
 * global type augmentation for the wallet
 */
declare global {
  let ethereum: {
    isMetaMask: boolean;
    _metamask: unknown;
  };
}

export const isMetaMaskAvailable = (): boolean => {
  return (
    typeof ethereum !== 'undefined' &&
    ethereum.isMetaMask &&
    !!ethereum._metamask
  );
};
