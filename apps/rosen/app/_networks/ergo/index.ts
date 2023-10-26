import getNautilusWallet, {
  isNautilusAvailable,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import { ErgoToken, Wallet } from '@rosen-ui/wallet-api';
import JsonBigInt from '@rosen-bridge/json-bigint';
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
        // const address = 'addr1q8hmp5zjzvv7s7pmgemz3mvrkd2nu7609hwgsqa0auf6h7h3r6x6jn2zrt8xs3enc53f4aqks7v5g5t254fu2n8sz2wsla293a';
        const lockAddress =
          'nB3L2PD3JTNGWZVRVuTYLEyHwoSe4EC4zP5Wd7x1f29FimSmwmUPsaR5duxgoZ8bZdyBBpHkEHaAhPMxgaGL2KhQEezsTCdayAoWYX6mLEXDM1hGfv5ZrEq5PWA4aPCcbiefyVyrZGFA5';

        const unsignedTx = await generateUnsignedTx(
          wallet,
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
        console.log(result);
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
