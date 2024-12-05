import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { NETWORKS } from '@rosen-ui/constants';
import { Network, RosenAmountValue } from '@rosen-ui/types';

import { getOKXWallet } from './getOKXWallet';

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
    const userAddress = (await window.okxwallet.bitcoin.getAccounts())[0];

    const opReturnData = await config.generateOpReturnData(
      toChain,
      toAddress,
      networkFee.toString(),
      bridgeFee.toString(),
    );

    const psbtData = await config.generateUnsignedTx(
      lockAddress,
      userAddress,
      amount,
      opReturnData,
      token,
    );

    let result = await window.okxwallet.bitcoin.signPsbt(psbtData.psbt, {
      autoFinalized: true,
      toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
        (index) => ({
          address: userAddress,
          index: index,
        }),
      ),
    });

    console.log(result);

    let txid = await window.okxwallet.bitcoin.pushTx(result);

    // config
    //   .submitTransaction(result)
    //   .then((result) => resolve(result))
    //   .catch((e) => reject(e));
    return txid;
  };
