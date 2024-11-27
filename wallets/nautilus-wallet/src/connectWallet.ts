/**
 * handles the nautilus wallet connection
 */
export const connectWallet = async () => {
  if (!window.ergoConnector?.nautilus) {
    throw new Error('EXTENSION_NOT_FOUND');
  }

  if (!window.ergoConnector.nautilus?.getContext) {
    return 'Wallet API has changed. Be sure to update your wallet to continue using it';
  }

  const nautilus = window.ergoConnector.nautilus;
  return await nautilus.connect({ createErgoObject: false });
};
