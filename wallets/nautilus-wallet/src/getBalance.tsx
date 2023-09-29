import { RosenChainToken } from '@rosen-bridge/tokens';

import { ErgoToken } from '@rosen-ui/wallet-api';

/**
 * search the wallet and return the balance for
 * the requested token
 */

export const getBalance = async (token: RosenChainToken) => {
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
  return (await nautilus.getContext()).get_balance(
    (token as ErgoToken).tokenId
  );
};
