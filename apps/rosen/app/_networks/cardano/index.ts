import { compact } from 'lodash-es';

import getNamiWallet, {
  isNamiAvailable,
  walletInfo as namiWalletInfo,
} from '@rosen-ui/nami-wallet';

import getLaceWallet, {
  isLaceAvailable,
  walletInfo as laceWalletInfo,
} from '@rosen-ui/lace-wallet';

import getEternlWallet, {
  isEternlAvailable,
  walletInfo as eternlWalletInfo,
} from '@rosen-ui/eternl-wallet';

import getFlintWallet, {
  isFlintAvailable,
  walletInfo as flintWalletInfo,
} from '@rosen-ui/flint-wallet';

import getVesprWallet, {
  isVesprAvailable,
  walletInfo as vesprWalletInfo,
} from '@rosen-ui/vespr-wallet';

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

/**
 * the main object for Cardano network
 * providing access to network info and wallets and network specific
 * functionality
 */
const CardanoNetwork: Network<Wallet> = {
  name: Networks.cardano,
  label: 'Cardano',
  supportedWallets: [
    namiWalletInfo,
    laceWalletInfo,
    eternlWalletInfo,
    flintWalletInfo,
    vesprWalletInfo,
  ],
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
        const wallet = await getNamiWallet().api.enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
    isLaceAvailable() && {
      ...getLaceWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getLaceWallet().api.enable();
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
        const wallet = await getLaceWallet().api.enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
    isEternlAvailable() && {
      ...getEternlWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getEternlWallet().api.enable();
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
        const wallet = await getEternlWallet().api.enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
    isFlintAvailable() && {
      ...getFlintWallet(),
      getBalance: async (token: RosenChainToken) => {
        const context = await getFlintWallet().api.enable();
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
        const wallet = await getFlintWallet().api.enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
        const wallet = await getVesprWallet().api.enable();
        const policyIdHex = token.policyId;
        const assetNameHex = token.assetName;
        const amount = BigInt(decimalAmount * 10 ** token.decimals);
        const bridgeFee = BigInt(decimalBridgeFee * 10 ** token.decimals);
        const networkFee = BigInt(decimalNetworkFee * 10 ** token.decimals);
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
  logo: CardanoIcon,
  api: {
    explorerUrl: 'https://api.koios.rest/api',
  },
  lockAddress: process.env.NEXT_PUBLIC_CARDANO_LOCK_ADDRESS!,
};

export default CardanoNetwork;
