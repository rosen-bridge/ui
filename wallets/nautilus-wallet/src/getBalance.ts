import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { Networks } from '@rosen-ui/constants';
import { ErgoToken } from '@rosen-ui/wallet-api';

import { getNautilusWallet } from './getNautilusWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  async (token: RosenChainToken): Promise<bigint> => {
    const context = await getNautilusWallet().getApi().getContext();
    const tokenId = (token as ErgoToken).tokenId;
    /**
     * The following condition is required because nautilus only accepts
     * uppercase ERG as tokenId for the erg native token
     */
    const balance = await context.get_balance(
      tokenId === 'erg' ? 'ERG' : tokenId
    );

    const amount = BigInt(balance);

    if (!amount) return 0n;

    return (await config.getTokenMap()).wrapAmount('erg', amount, Networks.ERGO)
      .amount;
  };
