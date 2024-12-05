import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  SigHash,
  WalletCreatorConfig,
} from '@rosen-network/bitcoin/dist/src/types';
import { Network, RosenAmountValue } from '@rosen-ui/types';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getCtrlWallet } from './getCtrlWallet';

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
    window.xfi.bitcoin.request(
      { method: 'request_accounts', params: [] },
      async (error: any, accounts: string[]) => {
        const userAddress = accounts[0];
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

        console.log(`requesting signPsbt: ${psbtData.psbt}`)
        // const result: string = await new Promise((resolve, reject) => {
        //   window.xfi.bitcoin.request({
        //     method: "sign_transaction",
        //     params: [{
        //         psbtHex: psbtData.psbt,
        //         finalise: false
        //     }]
        //   }, (error: any, tx: any) => {
        //       if (error) {
        //           reject(error);
        //           return
        //       }
        //       resolve(tx)
        //   });
        const result: string = await new Promise((resolve, reject) => {
          getCtrlWallet()
            .getApi()
            .signTransaction({
              payload: {
                network: {
                  type: BitcoinNetworkType.Mainnet,
                },
                message: 'Sign Transaction',
                psbtBase64: psbtData.psbt,
                broadcast: false,
                inputsToSign: [
                  {
                    address: userAddress,
                    signingIndexes: Array.from(Array(psbtData.inputSize).keys()),
                    sigHash: SigHash.SINGLE | SigHash.DEFAULT_ANYONECANPAY,
                  },
                ],
              },
              onFinish: (response) => {
                const signedPsbtBase64 = response.psbtBase64;
                resolve(signedPsbtBase64);
              },
              onCancel: () => {
                reject();
              },
            });
        });
        console.log(`result: ${result}`)
    });
    return 'result';
}
