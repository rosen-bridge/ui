import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';
import { Networks } from '@rosen-ui/constants';

export const getBalanceCreator =
  (config: WalletCreatorConfig) => (): Promise<bigint> => {
    return new Promise((resolve, reject) => {
      getXdefiWallet()
        .getApi()
        .getAddress({
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
                .then((balance) =>
                  config.getTokenMap().then((tokenMap) => {
                    resolve(
                      tokenMap.wrapAmount(
                        'btc',
                        BigInt(balance),
                        Networks.BITCOIN
                      ).amount
                    );
                  })
                )
                .catch((e) => reject(e));
            } else reject();
          },
          onCancel: () => {
            reject();
          },
        });
    });
  };
