'use server';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import type { NetworkMaxTransferParams } from '@rosen-network/base';
import type { BitcoinCashDepositRequest } from '@rosen-network/bitcoin-cash/client';
import type { Network } from '@rosen-ui/types';

import { getBitcoinCashServerRuntime } from './serverConfig';

/** Return completed configured ports or a fixed public availability error. */
const requiredRuntime = () => {
  const runtime = getBitcoinCashServerRuntime();
  if (!runtime) throw new Error('BCH bridge unavailable');
  return runtime;
};

/** Query only server-authorized route, token, interval and minimum-fee NFT. */
export const calculateFee = async (
  target: Network,
  tokenId: string,
  interval: number,
  nft: string,
) => {
  try {
    return await requiredRuntime().calculateFee(target, tokenId, interval, nft);
  } catch {
    throw new Error('BCH fee query failed');
  }
};

/** Read authenticated raw native balance without exposing provider endpoints. */
export const getAddressBalance = async (address: string) => {
  try {
    return await requiredRuntime().getAddressBalance(address);
  } catch {
    throw new Error('BCH balance query failed');
  }
};

/** Calculate the wrapped minimum using the trusted current fee query. */
export const getMinTransfer = async (token: RosenChainToken, target: Network, nft: string) => {
  try {
    return await requiredRuntime().getMinTransfer(token, target, nft);
  } catch {
    throw new Error('BCH minimum query failed');
  }
};

/** Calculate spendable maximum from authenticated native parents and server policy. */
export const getMaxTransfer = async (parameters: NetworkMaxTransferParams) => {
  try {
    return await requiredRuntime().getMaxTransfer(parameters);
  } catch {
    throw new Error('BCH maximum query failed');
  }
};

/** Prepare native lock parents only after matching a fresh server-owned Rosen quote. */
export const generateSigningParameters = async (request: BitcoinCashDepositRequest) => {
  try {
    return await requiredRuntime().generateSigningParameters(request);
  } catch {
    throw new Error('BCH preparation failed');
  }
};

/** Validate an address through the shared network codec with a fixed error boundary. */
export const validateAddress = async (chain: Network, address: string) => {
  try {
    if (chain !== 'bitcoin-cash') return false;
    return await requiredRuntime().validateAddress(chain, address);
  } catch {
    throw new Error('BCH address validation failed');
  }
};
