import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { RosenAmountValue } from '@rosen-ui/types';

import { getXdefiWallet } from './getXdefiWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  (token: RosenChainToken): Promise<RosenAmountValue> => {
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
                    const wrappedAmount = tokenMap.wrapAmount(
                      token[tokenMap.getIdKey(NETWORKS.BITCOIN)],
                      balance,
                      NETWORKS.BITCOIN
                    ).amount;
                    resolve(wrappedAmount);
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
