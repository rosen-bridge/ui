import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';
import { XdefiWalletCreator } from './types';

export const getBalanceCreator =
  (config: XdefiWalletCreator) => (): Promise<number> => {
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
            (address) => address.purpose === AddressPurpose.Payment
          );
          if (segwitPaymentAddresses.length > 0) {
            const address = segwitPaymentAddresses[0].address;
            config
              .getAddressBalance(address)
              .then((balance) => resolve(Number(balance)))
              .catch((e) => reject(e));
          } else reject();
        },
        onCancel: () => {
          reject();
        },
      });
    });
  };