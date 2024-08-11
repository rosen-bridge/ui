import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { Networks } from '@rosen-ui/constants';
import { RosenChainToken } from '@rosen-bridge/tokens';

import { getXdefiWallet } from './getXdefiWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  (token: RosenChainToken): Promise<number> => {
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
                .then((balance) => resolve(Number(balance)))
                .then((balance) =>
                  config.getTokenMap().then((tokenMap) => {
                    const wrappedAmount = tokenMap.wrapAmount(
                      token[tokenMap.getIdKey(Networks.BITCOIN)],
                      BigInt(Number(balance)),
                      Networks.BITCOIN
                    ).amount;
                    resolve(Number(wrappedAmount));
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
