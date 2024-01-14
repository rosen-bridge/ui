import getNautilusWallet, {
  isNautilusAvailable,
  walletInfo as nautilusWalletInfo,
} from '@rosen-ui/nautilus-wallet';
import { compact } from 'lodash-es';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';
import { ErgoToken, Wallet } from '@rosen-ui/wallet-api';
import { generateUnsignedTx } from './transaction/generateTx';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { ErgoIcon } from '@rosen-bridge/icons';

/**
 * the main object for Ergo network
 * providing access to network info and wallets and network specific
 * functionality
 */
const ErgoNetwork: Network<Wallet> = {
  name: Networks.ergo,
  label: 'Ergo',
  supportedWallets: [nautilusWalletInfo],
  availableWallets: compact([
    isNautilusAvailable() && {
      ...getNautilusWallet(),
      getBalance: async (token) => {
        const context = await getNautilusWallet().api.getContext();
        const tokenId = (token as ErgoToken).tokenId;
        /**
         * The following condition is required because nautilus only accepts
         * uppercase ERG as tokenId for the erg native token
         */
        const balance = await context.get_balance(
          tokenId === 'erg' ? 'ERG' : tokenId,
        );
        return +balance;
      },
      transfer: async (
        token: RosenChainToken,
        decimalAmount: number,
        toChain: string,
        toAddress: string,
        decimalBridgeFee: number,
        decimalNetworkFee: number,
        lockAddress: string,
      ) => {
        const wallet = await getNautilusWallet().api.getContext();
        const tokenId = token.tokenId;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
  logo: ErgoIcon,
  nextHeightInterval: 5,
  api: {
    explorerUrl: 'https://api.ergoplatform.com/',
  },
  lockAddress: process.env.NEXT_PUBLIC_ERGO_LOCK_ADDRESS!,
};

export default ErgoNetwork;
