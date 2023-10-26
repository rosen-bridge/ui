import getNautilusWallet, {
  isNautilusAvailable,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import { ErgoToken, Wallet } from '@rosen-ui/wallet-api';
import { generateUnsignedTx } from './transaction/generateTx';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: Network<Wallet> = {
  name: Networks.ergo,
  label: 'Ergo',
  availableWallets: compact([
    isNautilusAvailable() && {
      ...getNautilusWallet(),
      getBalance: async (token) => {
        const context = await getNautilusWallet().api.getContext();
        const balance = await context.get_balance((token as ErgoToken).tokenId);
        return +balance;
      },
      transfer: async (...args) => {
        const wallet = await getNautilusWallet().api.getContext();
        const toChain = args[2];
        const toAddress = args[3];
        const tokenId = args[0].tokenId;
        const amount = BigInt(args[1] * 10 ** args[0].decimals);
        const bridgeFee = BigInt(args[4] * 10 ** args[0].decimals);
        const networkFee = BigInt(args[5] * 10 ** args[0].decimals);
        const lockAddress = args[6];
        const changeAddress = await wallet.get_change_address();

        const walletUtxos = await wallet.get_utxos();
        if (!walletUtxos) throw Error(`No box found`);

        const unsignedTx = await generateUnsignedTx(
          changeAddress,
          walletUtxos,
          lockAddress,
          toChain,
          toAddress,
          tokenId,
          amount,
          bridgeFee,
          networkFee,
        );
        const signedTx = await wallet.sign_tx(unsignedTx);
        const result = await wallet.submit_tx(signedTx);
        return result;
      },
    },
  ]),
  logo: '/ergo.svg',
  nextHeightInterval: 5,
  api: {
    explorerUrl: 'https://api.ergoplatform.com/',
    networkStatusUrl: 'https://api.ergoplatform.com/api/v1/networkState',
  },
  lockAddress: '',
};

export default ErgoNetwork;
