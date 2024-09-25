import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { getNautilusWallet } from './getNautilusWallet';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    amount: RosenAmountValue,
    toChain: Network,
    toAddress: string,
    bridgeFee: RosenAmountValue,
    networkFee: RosenAmountValue,
    lockAddress: string
  ): Promise<string> => {
    const wallet = await getNautilusWallet().getApi().getContext();
    const tokenId = token.tokenId;
    const changeAddress = await wallet.get_change_address();

    const walletUtxos = await wallet.get_utxos();
    if (!walletUtxos) throw Error(`No box found`);

    const unsignedTx = await config.generateUnsignedTx(
      changeAddress,
      walletUtxos,
      lockAddress,
      toChain,
      toAddress,
      amount,
      bridgeFee.toString(),
      networkFee.toString(),
      token
    );
    const signedTx = await wallet.sign_tx(unsignedTx);
    const result = await wallet.submit_tx(signedTx);
    return result;
  };
