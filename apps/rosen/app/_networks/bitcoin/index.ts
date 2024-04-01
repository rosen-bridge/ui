import { BitcoinIcon } from '@rosen-bridge/icons';
import { RosenChainToken } from '@rosen-bridge/tokens';
import getXdefiWallet, {
  AddressPurpose,
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
              /**
               * TODO: Complete getBalance
               * local:ergo/rosen-bridge/ui#236
               */
              throw new Error('Not implemented');
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

        /**
         * TODO: Complete transfer
         * local:ergo/rosen-bridge/ui#236
         */
        throw new Error('Not implemented');
      },
    },
  ]),
  logo: BitcoinIcon,
  nextHeightInterval: 1,
  lockAddress: process.env.NEXT_PUBLIC_BITCOIN_LOCK_ADDRESS!,
};

export default BitcoinNetwork;
