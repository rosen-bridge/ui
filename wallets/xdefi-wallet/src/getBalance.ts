import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { Networks } from '@rosen-ui/constants';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getXdefiWallet } from './getXdefiWallet';

/**
 * @returns this is a WRAPPED-VALUE
 */
export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  (token: RosenChainToken): Promise<bigint> => {
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
                        token[tokenMap.getIdKey(Networks.BITCOIN)],
                        balance,
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
