import { compact } from 'lodash-es';

import getNamiWallet, {
  isNamiAvailable,
  walletInfo as namiWalletInfo,
} from '@rosen-ui/nami-wallet';

import getVesprWallet, {
  isVesprAvailable,
  walletInfo as vesprWalletInfo,
} from '@rosen-ui/vespr-wallet';

import { validateDecimalPlaces } from '@rosen-ui/utils';

import { Networks } from '@/_constants';

import { Network } from '@/_types/network';

import { decodeWasmValue } from '@/_actions/cardanoDecoder';
import { Wallet } from '@rosen-ui/wallet-api';
import { RosenChainToken } from '@rosen-bridge/tokens';
import {
  generateLockAuxiliaryData,
  setTxWitnessSet,
} from './transaction/utils';
import { generateUnsignedTx } from './transaction/generateTx';
import { CardanoIcon } from '@rosen-bridge/icons';

import { convertNumberToBigint, hexToCbor } from '@/_utils';

import { feeAndMinBoxValue as cardanoFeeAndMinBoxValue } from './transaction/consts';

import { eternlWalletCreator, eternlWalletInfo } from '@rosen-ui/eternl-wallet';
import {
  decodeWasmValueEternl,
  generateLockAuxiliaryDataEternl,
  generateUnsignedTxEternl,
  setTxWitnessSetEternl,
} from './server';

import { flintWalletCreator, flintWalletInfo } from '@rosen-ui/flint-wallet';
import {
  decodeWasmValueFlint,
  generateLockAuxiliaryDataFlint,
  generateUnsignedTxFlint,
  setTxWitnessSetFlint,
} from './server';

import { laceWalletCreator, laceWalletInfo } from '@rosen-ui/lace-wallet';
import {
  decodeWasmValueLace,
  generateLockAuxiliaryDataLace,
  generateUnsignedTxLace,
  setTxWitnessSetLace,
} from './server';

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: Network<Wallet> = {
  name: Networks.cardano,
  label: 'Cardano',
  supportedWallets: [
    eternlWalletInfo,
    flintWalletInfo,
    laceWalletInfo,
    namiWalletInfo,
  ],
  availableWallets: compact([
    eternlWalletCreator({
      decodeWasmValue: decodeWasmValueEternl,
      generateLockAuxiliaryData: generateLockAuxiliaryDataEternl,
      generateUnsignedTx: generateUnsignedTxEternl,
      setTxWitnessSet: setTxWitnessSetEternl,
    }),
    flintWalletCreator({
      decodeWasmValue: decodeWasmValueFlint,
      generateLockAuxiliaryData: generateLockAuxiliaryDataFlint,
      generateUnsignedTx: generateUnsignedTxFlint,
      setTxWitnessSet: setTxWitnessSetFlint,
    }),
    laceWalletCreator({
      decodeWasmValue: decodeWasmValueLace,
      generateLockAuxiliaryData: generateLockAuxiliaryDataLace,
      generateUnsignedTx: generateUnsignedTxLace,
      setTxWitnessSet: setTxWitnessSetLace,
    }),
    isNamiAvailable() && {
      ...getNamiWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getNamiWallet().api.enable();
        const rawValue = await context.getBalance();
        const balances = await decodeWasmValue(rawValue);

        const amount = balances.find(
          (asset) =>
            asset.policyId === token.policyId &&
            (asset.nameHex === hexToCbor(token.assetName) || !token.policyId),
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

        const wallet = await getNamiWallet().api.enable();
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
          amount.toString(),
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
    isVesprAvailable() && {
      ...getVesprWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getVesprWallet().api.enable();
        const rawValue = await context.getBalance();
        const balances = await decodeWasmValue(rawValue);

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

        const wallet = await getVesprWallet().api.enable();
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
          amount.toString(),
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
  logo: CardanoIcon,
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
  async getMaxTransferableAmount(balance, isNative) {
    const offsetCandidate = Number(cardanoFeeAndMinBoxValue);
    const shouldApplyOffset = isNative;
    const offset = shouldApplyOffset ? offsetCandidate : 0;
    const amount = balance - offset;
    return amount < 0 ? 0 : amount;
  },
};

export default CardanoNetwork;
