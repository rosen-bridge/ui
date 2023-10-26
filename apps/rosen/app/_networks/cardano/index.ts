import { compact } from 'lodash-es';

import getNamiWallet, { isNamiAvailable } from '@rosen-ui/nami-wallet';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

import { decodeWasmValue } from '@/_actions/cardanoDecoder';
import { Wallet } from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';
import { getDecimalString } from '@rosen-ui/utils';
import {
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from './transaction/utils';
import { generateUnsignedTx } from './transaction/generateTx';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: Network<Wallet> = {
  name: Networks.cardano,
  label: 'Cardano',
  availableWallets: compact([
    isNamiAvailable() && {
      ...getNamiWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getNamiWallet().api.enable();
        const rawValue = await context.getBalance();
        const balances = await decodeWasmValue(rawValue);

        const amount = balances.find(
          (asset) => asset.policyId === token.policyId,
        );
        return amount
          ? Number(getDecimalString(amount.quantity.toString(), token.decimals))
          : 0;
      },
      transfer: async (...args) => {
        const wallet = await getNamiWallet().api.enable();
        const toChain = args[2];
        const toAddress = args[3];
        const policyIdHex = args[0].policyId;
        const assetNameHex = args[0].assetName;
        const amount = BigInt(args[1] * 10 ** args[0].decimals);
        const bridgeFee = BigInt(args[4] * 10 ** args[0].decimals);
        const networkFee = BigInt(args[5] * 10 ** args[0].decimals);
        const lockAddress = args[6];
        const changeAddressHex = await wallet.getChangeAddress();

        const auxiliaryDataHex = await generateLockAuxiliaryData(
          toChain,
          toAddress,
          changeAddressHex,
          networkFee.toString(),
          bridgeFee.toString(),
        );

        const walletUtxos = await wallet.getUtxos();
        if (!walletUtxos) throw Error(`Failed to fetch wallet utxos`);
        const unsignedTxHex = await generateUnsignedTx(
          walletUtxos,
          lockAddress,
          changeAddressHex,
          policyIdHex,
          assetNameHex,
          amount,
          auxiliaryDataHex,
        );

        const signedTxHex = await setTxWitnessSet(
          unsignedTxHex,
          await wallet.signTx(unsignedTxHex, false),
        );

        const result = await wallet.submitTx(signedTxHex);
        return result;
      },
    },
  ]),
  nextHeightInterval: 25,
  logo: '/cardano.svg',
  api: {
    explorerUrl: 'https://api.koios.rest/api',
    networkStatusUrl: 'https://api.koios.rest/api/v0/blocks?limit=1',
  },
  lockAddress: '',
};

export default CardanoNetwork;
