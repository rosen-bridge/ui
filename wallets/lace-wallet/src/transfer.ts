import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';

import { getLaceWallet } from './getLaceWallet';

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
    const wallet = await getLaceWallet().getApi().enable();
    const policyIdHex = token.policyId;
    const assetNameHex = token.assetName;
    const amount = convertNumberToBigint(decimalAmount);
    const bridgeFee = convertNumberToBigint(decimalBridgeFee);
    const networkFee = convertNumberToBigint(decimalNetworkFee);
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
