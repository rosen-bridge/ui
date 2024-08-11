import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';

import { getNautilusWallet } from './getNautilusWallet';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    decimalAmount: number,
    toChain: string,
    toAddress: string,
    decimalBridgeFee: number,
    decimalNetworkFee: number,
    lockAddress: string
  ): Promise<string> => {
    const wallet = await getNautilusWallet().getApi().getContext();
    const tokenId = token.tokenId;
    const amount = convertNumberToBigint(decimalAmount);
    const bridgeFee = convertNumberToBigint(decimalBridgeFee);
    const networkFee = convertNumberToBigint(decimalNetworkFee);
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
