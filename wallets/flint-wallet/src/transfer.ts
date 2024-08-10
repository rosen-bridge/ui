import { Networks } from '@rosen-ui/constants';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';

import { getFlintWallet } from './getFlintWallet';

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
      token[tokenMap.getIdKey(Networks.CARDANO)]
    );

    if (decimals === undefined) {
      throw new Error(
        'Impossible behavior: failed to get significant decimals for the requested token'
      );
    }

    validateDecimalPlaces(decimalAmount, decimals);
    validateDecimalPlaces(decimalBridgeFee, decimals);
    validateDecimalPlaces(decimalNetworkFee, decimals);

    const wallet = await getFlintWallet().getApi().enable();
    const policyIdHex = token.policyId;
    const assetNameHex = token.assetName;
    const amount = convertNumberToBigint(decimalAmount * 10 ** decimals);
    const bridgeFee = convertNumberToBigint(decimalBridgeFee * 10 ** decimals);
    const networkFee = convertNumberToBigint(
      decimalNetworkFee * 10 ** decimals
    );
    const changeAddressHex = await wallet.getChangeAddress();

    const auxiliaryDataHex = await config.generateLockAuxiliaryData(
      toChain,
      toAddress,
      changeAddressHex,
      networkFee.toString(),
      bridgeFee.toString()
    );

    const walletUtxos = await wallet.getUtxos();
    if (!walletUtxos) throw Error(`Failed to fetch wallet utxos`);
    const unsignedTxHex = await config.generateUnsignedTx(
      walletUtxos,
      lockAddress,
      changeAddressHex,
      policyIdHex,
      assetNameHex,
      amount,
      auxiliaryDataHex
    );

    const signedTxHex = await config.setTxWitnessSet(
      unsignedTxHex,
      await wallet.signTx(unsignedTxHex, false)
    );

    const result = await wallet.submitTx(signedTxHex);
    return result;
  };
