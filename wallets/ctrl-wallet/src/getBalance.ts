import { RosenChainToken } from '@rosen-bridge/tokens';
import { WalletCreatorConfig } from '@rosen-network/bitcoin';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';
import { AddressPurpose, BitcoinNetworkType } from 'sats-connect';

import { getCtrlWallet } from './getCtrlWallet';

export const getBalanceCreator =
  (config: WalletCreatorConfig) =>
  (token: RosenChainToken): Promise<RosenAmountValue> => {
    console.log(`in getBalance f`);
    return new Promise((resolve, reject) => {
      window.xfi.bitcoin.request(
        { method: 'request_accounts', params: [] },
        (error: any, accounts: string[]) => {
          if (error) {
            console.error(error);
            return false;
          } else {
            console.log(`onFinish getAddress: ${JSON.stringify(accounts)}`);
            if (accounts.length > 0) {
              const address = accounts[0];
              config
                .getAddressBalance(address)
                .then((balance) => {
                  console.log(`then getAddressBalance: ${balance}`);
                  return config.getTokenMap().then((tokenMap) => {
                    const wrappedAmount = tokenMap.wrapAmount(
                      token[tokenMap.getIdKey(NETWORKS.BITCOIN)],
                      balance,
                      NETWORKS.BITCOIN,
                    ).amount;
                    console.log(`returning wrappedAmount: ${wrappedAmount}`);
                    resolve(wrappedAmount);
                  });
                })
                .catch((e) => reject(e));
            } else reject();
          }
        },
      );
    });
  };
