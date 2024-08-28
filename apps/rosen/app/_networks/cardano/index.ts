import { compact } from 'lodash-es';

import { convertNumberToBigint, validateDecimalPlaces } from '@rosen-ui/utils';

import { Networks } from '@rosen-ui/constants';

import { unwrap } from '@/_errors';
import { CardanoNetwork as CardanoNetworkType } from '@/_types/network';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { CardanoIcon } from '@rosen-bridge/icons';

import { eternlWalletCreator } from '@rosen-ui/eternl-wallet';
import { flintWalletCreator } from '@rosen-ui/flint-wallet';
import { laceWalletCreator } from '@rosen-ui/lace-wallet';
import { namiWalletCreator } from '@rosen-ui/nami-wallet';

import {
  decodeWasmValue,
  generateLockAuxiliaryData,
  generateUnsignedTx,
  setTxWitnessSet,
} from './server';

import { feeAndMinBoxValue } from '@rosen-network/cardano/dist/src/constants';

import getVesprWallet, {
  isVesprAvailable,
  walletInfo as vesprWalletInfo,
} from '@rosen-ui/vespr-wallet';
import { getTokenMap } from '../getTokenMap.client';
import { getMaxTransfer } from './getMaxTransfer';
import { fromSafeData } from '@/_utils/safeData';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: CardanoNetworkType = {
  name: Networks.CARDANO,
  label: 'Cardano',
  wallets: compact([
    eternlWalletCreator({
      getTokenMap,
      decodeWasmValue: unwrap(fromSafeData(decodeWasmValue)),
      generateLockAuxiliaryData: unwrap(
        fromSafeData(generateLockAuxiliaryData),
      ),
      generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
      setTxWitnessSet: unwrap(fromSafeData(setTxWitnessSet)),
    }),
    flintWalletCreator({
      getTokenMap,
      decodeWasmValue: unwrap(fromSafeData(decodeWasmValue)),
      generateLockAuxiliaryData: unwrap(
        fromSafeData(generateLockAuxiliaryData),
      ),
      generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
      setTxWitnessSet: unwrap(fromSafeData(setTxWitnessSet)),
    }),
    laceWalletCreator({
      getTokenMap,
      decodeWasmValue: unwrap(fromSafeData(decodeWasmValue)),
      generateLockAuxiliaryData: unwrap(
        fromSafeData(generateLockAuxiliaryData),
      ),
      generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
      setTxWitnessSet: unwrap(fromSafeData(setTxWitnessSet)),
    }),
    namiWalletCreator({
      getTokenMap,
      decodeWasmValue: unwrap(fromSafeData(decodeWasmValue)),
      generateLockAuxiliaryData: unwrap(
        fromSafeData(generateLockAuxiliaryData),
      ),
      generateUnsignedTx: unwrap(fromSafeData(generateUnsignedTx)),
      setTxWitnessSet: unwrap(fromSafeData(setTxWitnessSet)),
    }),
    isVesprAvailable() && {
      ...getVesprWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getVesprWallet().getApi().enable();
        const rawValue = await context.getBalance();
        const balances = await unwrap(fromSafeData(decodeWasmValue))(rawValue);

        const amount = balances.find(
          (asset) => asset.policyId === token.policyId,
        );
        return amount ? Number(amount.quantity) : 0;
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
        validateDecimalPlaces(decimalAmount, token.decimals);
        validateDecimalPlaces(decimalBridgeFee, token.decimals);
        validateDecimalPlaces(decimalNetworkFee, token.decimals);

        const wallet = await getVesprWallet().getApi().enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = convertNumberToBigint(
          decimalAmount * 10 ** token.decimals,
        );
        const bridgeFee = convertNumberToBigint(
          decimalBridgeFee * 10 ** token.decimals,
        );
        const networkFee = convertNumberToBigint(
          decimalNetworkFee * 10 ** token.decimals,
        );
        const changeAddressHex = await wallet.getChangeAddress();

        const auxiliaryDataHex = await unwrap(
          fromSafeData(generateLockAuxiliaryData),
        )(
          toChain,
          toAddress,
          changeAddressHex,
          networkFee.toString(),
          bridgeFee.toString(),
        );

        const walletUtxos = await wallet.getUtxos();
        if (!walletUtxos) throw Error(`Failed to fetch wallet utxos`);
        const unsignedTxHex = await unwrap(fromSafeData(generateUnsignedTx))(
          walletUtxos,
          lockAddress,
          changeAddressHex,
          policyIdHex,
          assetNameHex,
          amount,
          auxiliaryDataHex,
        );

        const signedTxHex = await unwrap(fromSafeData(setTxWitnessSet))(
          unsignedTxHex,
          await wallet.signTx(unsignedTxHex, false),
        );

        const result = await wallet.submitTx(signedTxHex);
        return result;
      },
    },
  ]),
  nextHeightInterval: 25,
  logo: CardanoIcon,
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
  getMaxTransfer: unwrap(fromSafeData(getMaxTransfer)),
};

export default CardanoNetwork;
