import { RosenChainToken } from '@rosen-bridge/tokens';
import { Encoding, WalletCreatorConfig } from '@rosen-network/bitcoin';
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

    const signedPsbtHex = await window.okxwallet.bitcoin.signPsbt(psbtData.psbt.hex, {
      autoFinalized: false,
      toSignInputs: Array.from(Array(psbtData.inputSize).keys()).map(
        (index) => ({
          address: userAddress,
          index: index,
        }),
      ),
    });
    const txId = await config.submitTransaction(signedPsbtHex, Encoding.hex);
    return txId;
  };
