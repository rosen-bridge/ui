import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, request } from 'sats-connect';

export const getAddressCreator =
  (config: WalletCreatorConfig) => (): Promise<string> => {
    return new Promise((resolve, reject) => {
      request('getAddresses', {
        message: '',
        purposes: [AddressPurpose.Payment],
      })
        .then((response) => {
          if (response.status == 'error') return reject();

          const addresses = response.result.addresses.filter(
            (address) => address.purpose === AddressPurpose.Payment
          );

          if (addresses.length == 0) return reject();

          resolve(addresses[0].address);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
