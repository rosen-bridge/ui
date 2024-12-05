import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { Network, RosenAmountValue } from '@rosen-ui/types';

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

    const result = await window.okxwallet.bitcoin.signPsbt(psbtData.psbt, {
      autoFinalized: false,
      toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
        (index) => ({
          address: userAddress,
          index: index,
        }),
      ),
    });
    const txId = await config.submitTransaction(result);
    return txId;
  };
