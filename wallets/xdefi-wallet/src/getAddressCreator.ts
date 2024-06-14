import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';
import { XdefiWalletCreator } from './types';

export const getAddressCreator =
  (config: XdefiWalletCreator) => (): Promise<string> => {
    return new Promise((resolve, reject) => {
      getXdefiWallet().api.getAddress({
        payload: {
          message: 'Allow Xdefi to expose wallet address',
          network: {
            type: BitcoinNetworkType.Mainnet,
          },
          purposes: [AddressPurpose.Payment],
        },
        onFinish: ({ addresses }) => {
          const segwitPaymentAddresses = addresses.filter(
            (address) => address.purpose === AddressPurpose.Payment
          );
          if (segwitPaymentAddresses.length > 0) {
            resolve(segwitPaymentAddresses[0].address);
          } else reject();
        },
        onCancel: () => {
          reject();
        },
      });
    });
  };
