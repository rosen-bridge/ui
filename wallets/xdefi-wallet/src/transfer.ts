import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  SigHash,
  WalletCreatorConfig,
} from '@rosen-network/bitcoin/dist/src/types';
import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';

/**
 * This function works with WRAPPED-VALUE
 */
export const transferCreator =
  (config: WalletCreatorConfig) =>
    async (
      token: RosenChainToken,
      decimalWrappedAmount: number,
      toChain: string,
      toAddress: string,
      decimalBridgeFee: number,
      decimalNetworkFee: number,
      lockAddress: string
    ): Promise<string> => {
      const tokenMap = await config.getTokenMap();

      const decimals = tokenMap.getSignificantDecimals('btc');

      if (decimals === undefined) {
        throw new Error('Impossible behavior: [btc] is not found in token map');
      }

      validateDecimalPlaces(decimalWrappedAmount, decimals);
      validateDecimalPlaces(decimalBridgeFee, decimals);
      validateDecimalPlaces(decimalNetworkFee, decimals);

      const amount = convertNumberToBigint(decimalWrappedAmount * 10 ** decimals);
      const bridgeFee = convertNumberToBigint(decimalBridgeFee * 10 ** decimals);
      const networkFee = convertNumberToBigint(
        decimalNetworkFee * 10 ** decimals
      );

      const userAddress: string = await new Promise((resolve, reject) => {
        getXdefiWallet()
          .getApi()
          .getAddress({
            payload: {
              message: '',
              network: {
                type: BitcoinNetworkType.Mainnet,
              },
              purposes: [AddressPurpose.Payment],
            },
            onFinish: ({ addresses }) => {
              const segwitPaymentAddresses = addresses.filter(
                (address) => address.purpose === AddressPurpose.Payment
              );
              if (segwitPaymentAddresses.length > 0)
                resolve(segwitPaymentAddresses[0].address);
              else reject();
            },
            onCancel: () => {
              reject();
            },
          });
      });

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
        opReturnData,
        tokenMap
      );

      const result: string = await new Promise((resolve, reject) => {
        getXdefiWallet()
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
              config
                .submitTransaction(signedPsbtBase64)
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
