import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/ergo';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';

import { getNautilusWallet } from './getNautilusWallet';
import { Networks } from '@rosen-ui/constants';

/**
 * This function works with WRAPPED-VALUE
 */
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
    const tokenMap = await config.getTokenMap();

    const decimals = tokenMap.getSignificantDecimals(
      token[tokenMap.getIdKey(Networks.ERGO)]
    );

    if (decimals === undefined) {
      throw new Error(
        'Impossible behavior: failed to get significant decimals for the requested token'
      );
    }

    validateDecimalPlaces(decimalAmount, decimals);
    validateDecimalPlaces(decimalBridgeFee, decimals);
    validateDecimalPlaces(decimalNetworkFee, decimals);

    const wallet = await getNautilusWallet().getApi().getContext();
    const amount = convertNumberToBigint(decimalAmount * 10 ** decimals);
    const bridgeFee = convertNumberToBigint(decimalBridgeFee * 10 ** decimals);
    const networkFee = convertNumberToBigint(
      decimalNetworkFee * 10 ** decimals
    );
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
      tokenMap,
      token
    );
    const signedTx = await wallet.sign_tx(unsignedTx);
    const result = await wallet.submit_tx(signedTx);
    return result;
  };
