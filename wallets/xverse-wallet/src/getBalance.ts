import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, request } from 'sats-connect';

export const getBalanceCreator =
  (config: WalletCreatorConfig) => (): Promise<number> => {
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

          config
            .getAddressBalance(addresses[0].address)
            .then((balance) => resolve(Number(balance)))
            .catch((e) => reject(e));
        })
        .catch((error) => {
          reject(error);
        });
    });
  };
