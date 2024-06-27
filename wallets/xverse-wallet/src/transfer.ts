import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  SigHash,
  WalletCreatorConfig,
} from '@rosen-network/bitcoin/dist/src/types';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';
import Wallet, {
  AddressPurpose,
  BitcoinNetworkType,
  RpcErrorCode,
} from 'sats-connect';

import { getXverseWallet } from './getXverseWallet';

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
    validateDecimalPlaces(decimalAmount, token.decimals);
    validateDecimalPlaces(decimalBridgeFee, token.decimals);
    validateDecimalPlaces(decimalNetworkFee, token.decimals);

    const amount = convertNumberToBigint(decimalAmount * 10 ** token.decimals);
    const bridgeFee = convertNumberToBigint(
      decimalBridgeFee * 10 ** token.decimals
    );
    const networkFee = convertNumberToBigint(
      decimalNetworkFee * 10 ** token.decimals
    );

    const userAddress: string = (() => {
      const raw = localStorage.getItem('TEST') || '';

      const addresses = JSON.parse(raw) as any[];

      const segwitPaymentAddresses = addresses.filter(
        (address) => address.purpose === AddressPurpose.Payment
      );

      return segwitPaymentAddresses[0].address;
    })();

    const opReturnData = await config.generateOpReturnData(
      toChain,
      toAddress,
      networkFee.toString(),
      bridgeFee.toString()
    );

    const psbtData = await config.generateUnsignedTx(
      lockAddress,
      userAddress,
      amount,
      opReturnData
    );

    try {
      const response = await Wallet.request('signPsbt', {
        psbt: psbtData.psbt,
        allowedSignHash: SigHash.ALL,
        signInputs: {
          [userAddress]: [0],
        },
        broadcast: false,
      });
      if (response.status === 'success') {
        console.log('signPsbt: handle success response');
      } else {
        if (response.error.code === RpcErrorCode.USER_REJECTION) {
          console.log('signPsbt: handle user request cancelation');
        } else {
          console.log('signPsbt: handle error');
        }
      }
    } catch (err) {
      console.log('signPsbt: catch', err);
    }

    // const result: string = await new Promise((resolve, reject) => {
    //   getXverseWallet().api.signTransaction({
    //     payload: {
    //       network: {
    //         type: BitcoinNetworkType.Mainnet,
    //       },
    //       message: 'Sign Transaction',
    //       psbtBase64: psbtData.psbt,
    //       broadcast: false,
    //       inputsToSign: [
    //         {
    //           address: userAddress,
    //           signingIndexes: Array.from(Array(psbtData.inputSize).keys()),
    //           sigHash: SigHash.SINGLE | SigHash.DEFAULT_ANYONECANPAY,
    //         },
    //       ],
    //     },
    //     onFinish: (response) => {
    //       const signedPsbtBase64 = response.psbtBase64;
    //       config
    //         .submitTransaction(signedPsbtBase64)
    //         .then((result) => resolve(result))
    //         .catch((e) => reject(e));
    //     },
    //     onCancel: () => {
    //       reject();
    //     },
    //   });
    // });
    return 'result';
  };
