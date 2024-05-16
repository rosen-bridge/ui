import { BitcoinIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import getXdefiWallet, {
  AddressPurpose,
  AddressType,
  BitcoinNetworkType,
  walletInfo as XdefiWalletInfo,
  isXdefiAvailable,
} from '@rosen-ui/xdefi-wallet';
import { validateDecimalPlaces } from '@rosen-ui/utils';
import { Wallet } from '@rosen-ui/wallet-api';

import { compact } from 'lodash-es';

import { convertNumberToBigint } from '@/_utils';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import {
  generateOpReturnData,
  getAddressBalance,
  submitTransaction,
} from './transaction/utils';
import { generateUnsignedTx } from './transaction/generateTx';
import { SigHash } from './transaction/types';

/**
 * the main object for Bitcoin network
 * providing access to network info and wallets and network specific
 * functionality
 */
const BitcoinNetwork: Network<Wallet> = {
  name: Networks.bitcoin,
  label: 'Bitcoin',
  supportedWallets: [XdefiWalletInfo],
  availableWallets: compact([
    isXdefiAvailable() && {
      ...getXdefiWallet(),
      getBalance: (token) =>
        new Promise((resolve, reject) => {
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
                (address) => address.purpose === AddressPurpose.Payment,
              );
              if (segwitPaymentAddresses.length > 0) {
                const address = segwitPaymentAddresses[0].address;
                getAddressBalance(address)
                  .then((balance) => resolve(Number(balance)))
                  .catch((e) => reject(e));
              } else reject();
            },
            onCancel: () => {
              reject();
            },
          });
        }),
      transfer: async (
        token: RosenChainToken,
        decimalAmount: number,
        toChain: string,
        toAddress: string,
        decimalBridgeFee: number,
        decimalNetworkFee: number,
        lockAddress: string,
      ) => {
        validateDecimalPlaces(decimalAmount, token.decimals);
        validateDecimalPlaces(decimalBridgeFee, token.decimals);
        validateDecimalPlaces(decimalNetworkFee, token.decimals);

        const amount = convertNumberToBigint(
          decimalAmount * 10 ** token.decimals,
        );
        const bridgeFee = convertNumberToBigint(
          decimalBridgeFee * 10 ** token.decimals,
        );
        const networkFee = convertNumberToBigint(
          decimalNetworkFee * 10 ** token.decimals,
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
                (address) => address.purpose === AddressPurpose.Payment,
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

        const opReturnData = generateOpReturnData(
          toChain,
          toAddress,
          networkFee.toString(),
          bridgeFee.toString(),
        );

        const psbtData = await generateUnsignedTx(
          lockAddress,
          userAddress,
          amount,
          opReturnData,
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
      },
    },
  ]),
  logo: BitcoinIcon,
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
};

export default BitcoinNetwork;
