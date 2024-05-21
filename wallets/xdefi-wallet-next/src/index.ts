// TODO
// import { Network } from '@/_types/network';

import { BitcoinIcon, XdefiIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { validateDecimalPlaces } from '@rosen-ui/utils';
import { Wallet, WalletInfo, createRawWallet } from '@rosen-ui/wallet-api';
import { compact } from 'lodash-es';
import {
  AddressPurpose,
  AddressType,
  BitcoinNetworkType,
  getAddress,
  signTransaction,
} from 'sats-connect';

import { connectWallet } from './connectWallet';
import type { generateUnsignedTx } from './transaction/generateTx';
import { SigHash } from './transaction/types';
import { convertNumberToBigint } from './transaction/utils';
import type {
  getAddressBalance,
  generateOpReturnData,
  submitTransaction,
} from './transaction/utils.server';

type Network = {
  name: string;
  logo: string;
  label: string;
  availableWallets: Wallet[];
  supportedWallets: WalletInfo[];
  nextHeightInterval: number;
  lockAddress: string;
};

type XdefiWalletCreator = {
  lockAddress: string;
  generateOpReturnData: typeof generateOpReturnData;
  generateUnsignedTx: typeof generateUnsignedTx;
  getAddressBalance: typeof getAddressBalance;
  submitTransaction: typeof submitTransaction;
};

const walletInfo: WalletInfo = {
  icon: XdefiIcon,
  name: 'Xdefi',
  label: 'Xdefi',
  link: 'https://www.xdefi.io/',
};

const isXdefiAvailable = () => typeof xfi !== 'undefined' && !!xfi?.bitcoin;

/**
 * Xdefi implementation of the Wallet
 * interface to be able to interact with Xdefi wallet
 */
const getXdefiWallet = () => {
  return createRawWallet(
    {
      ...walletInfo,
      connectWallet,
    },
    {
      getAddress,
      signTransaction,
    }
  );
};

export const xdefiWalletCreator = ({
  lockAddress,
  generateOpReturnData,
  generateUnsignedTx,
  getAddressBalance,
  submitTransaction,
}: XdefiWalletCreator): Network => {
  return {
    name: 'bitcoin',
    label: 'Bitcoin',
    supportedWallets: [walletInfo],
    availableWallets: compact([
      isXdefiAvailable() && {
        ...getXdefiWallet(),
        getBalance: () => {
          return new Promise((resolve, reject) => {
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
                if (segwitPaymentAddresses.length === 0) reject();
                const address = segwitPaymentAddresses[0].address;
                getAddressBalance(address)
                  .then((balance) => resolve(Number(balance)))
                  .catch((e) => reject(e));
              },
              onCancel: () => {
                reject();
              },
            });
          });
        },
        transfer: async (
          token: RosenChainToken,
          decimalAmount: number,
          toChain: string,
          toAddress: string,
          decimalBridgeFee: number,
          decimalNetworkFee: number,
          lockAddress: string
        ) => {
          validateDecimalPlaces(decimalAmount, token.decimals);
          validateDecimalPlaces(decimalBridgeFee, token.decimals);
          validateDecimalPlaces(decimalNetworkFee, token.decimals);

          const amount = convertNumberToBigint(
            decimalAmount * 10 ** token.decimals
          );
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
                    signingIndexes: Array.from(
                      Array(psbtData.inputSize).keys()
                    ),
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
    lockAddress: lockAddress,
  };
};
