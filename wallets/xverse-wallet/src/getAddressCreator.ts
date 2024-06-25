import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose } from 'sats-connect';

export const getAddressCreator =
  (config: WalletCreatorConfig) => (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const raw = localStorage.getItem('TEST') || '';

      const addresses = JSON.parse(raw) as any[];

      const segwitPaymentAddresses = addresses.filter(
        (address) => address.purpose === AddressPurpose.Payment
      );

      if (segwitPaymentAddresses.length > 0) {
        resolve(segwitPaymentAddresses[0].address);
      } else reject();
    });
  };
