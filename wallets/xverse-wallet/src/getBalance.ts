import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose } from 'sats-connect';

export const getBalanceCreator =
  (config: WalletCreatorConfig) => (): Promise<number> => {
    return new Promise((resolve, reject) => {
      const raw = localStorage.getItem('TEST') || '';

      const addresses = JSON.parse(raw) as any[];

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
    });
  };
