export const isMetaMaskAvailable = (): boolean => {
  return (
    typeof ethereum !== 'undefined' &&
    ethereum.isMetaMask &&
    !!ethereum._metamask
  );
};
