export const isMetaMaskAvailable = (): boolean => {
  return (
    typeof window.ethereum !== 'undefined' &&
    window.ethereum.isMetaMask &&
    !!window.ethereum._metamask
  );
};
