export const connectWallet = async () => {
  if (!ergoConnector?.nautilus) {
    throw new Error('EXTENSION_NOT_FOUND');
  }

  if (!ergoConnector.nautilus?.getContext) {
    return (
      <>
        Wallet API has changed. Be sure to update your wallet to continue using
        it
      </>
    );
  }
  const nautilus = ergoConnector.nautilus;
  return await nautilus.connect({ createErgoObject: false });
};
