import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXverseWallet } from './getXverseWallet';

export const getAddressCreator =
  (config: WalletCreatorConfig) => (): Promise<string> => {
    return new Promise((resolve, reject) => {
      getXverseWallet().api.getAddress({
        payload: {
          message: 'Allow Xverse to expose wallet address',
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
