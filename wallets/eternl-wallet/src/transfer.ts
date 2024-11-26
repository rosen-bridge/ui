import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/cardano';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { getEternlWallet } from './getEternlWallet';

export const transferCreator =
  (config: WalletCreatorConfig) =>
  async (
    token: RosenChainToken,
    amount: RosenAmountValue,
    toChain: Network,
    toAddress: string,
    bridgeFee: RosenAmountValue,
    networkFee: RosenAmountValue,
    lockAddress: string,
  ): Promise<string> => {
    const wallet = await getEternlWallet().getApi().enable();
    const policyIdHex = token.policyId;
    const assetNameHex = token.assetName;
    const changeAddressHex = await wallet.getChangeAddress();

    const auxiliaryDataHex = await config.generateLockAuxiliaryData(
      toChain,
      toAddress,
      changeAddressHex,
      networkFee.toString(),
      bridgeFee.toString(),
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
      auxiliaryDataHex,
    );

    const signedTxHex = await config.setTxWitnessSet(
      unsignedTxHex,
      await wallet.signTx(unsignedTxHex, false),
    );

    const result = await wallet.submitTx(signedTxHex);
    return result;
  };
