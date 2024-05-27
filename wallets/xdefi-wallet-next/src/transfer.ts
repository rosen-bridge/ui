import { RosenChainToken } from '@rosen-bridge/tokens';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';
import { AddressPurpose, AddressType, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';
import { generateUnsignedTx } from './generateUnsignedTx';
import { SigHash } from './types';
import { generateOpReturnData, submitTransaction } from './utils';

export const transfer = async (
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

  const userAddress: string = await new Promise((resolve, reject) => {
    getXdefiWallet().api.getAddress({
      payload: {
        message: '',
        network: {
          type: BitcoinNetworkType.Mainnet,
        },
        purposes: [AddressPurpose.Payment],
      },
      onFinish: ({ addresses }) => {
        const segwitPaymentAddresses = addresses.filter(
          (address) =>
            address.purpose === AddressPurpose.Payment &&
            address.addressType === AddressType.p2wpkh
        );
        if (segwitPaymentAddresses.length > 0)
          resolve(segwitPaymentAddresses[0].address);
        reject();
      },
      onCancel: () => {
        reject();
      },
    });
  });

  const opReturnData = generateOpReturnData(
    toChain,
    toAddress,
    networkFee.toString(),
    bridgeFee.toString()
  );

  const psbtData = await generateUnsignedTx(
    lockAddress,
    userAddress,
    amount,
    opReturnData
  );

  const result: string = await new Promise((resolve, reject) => {
    getXdefiWallet().api.signTransaction({
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
        submitTransaction(signedPsbtBase64)
          .then((result) => resolve(result))
          .catch((e) => reject(e));
      },
      onCancel: () => {
        reject();
      },
    });
  });
  return result;
};
