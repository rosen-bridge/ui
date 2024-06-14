import { ErgoToken } from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';

import { getNautilusWallet } from './getNautilusWallet';
import { NautilusWalletCreator } from './types';

export const getBalanceCreator =
  (config: NautilusWalletCreator) =>
  async (token: RosenChainToken): Promise<number> => {
    const context = await getNautilusWallet().api.getContext();
    const tokenId = (token as ErgoToken).tokenId;
    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
    const balance = await context.get_balance(
      tokenId === 'erg' ? 'ERG' : tokenId
    );
    return +balance;
  };
