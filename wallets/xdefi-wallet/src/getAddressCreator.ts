import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';

export const getAddressCreator = () => (): Promise<string> => {
  return new Promise((resolve, reject) => {
    getXdefiWallet()
      .getApi()
      .getAddress({
        payload: {
          message: 'Allow Xdefi to expose wallet address',
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
            resolve(segwitPaymentAddresses[0].address);
          } else reject();
        },
        onCancel: () => {
          reject();
        },
      });
  });
};
