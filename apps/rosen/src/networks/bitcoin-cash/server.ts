'use server';

import type { RosenChainToken } from '@rosen-bridge/tokens';
import type { NetworkMaxTransferParams } from '@rosen-network/base';
import type { BitcoinCashDepositRequest } from '@rosen-network/bitcoin-cash/client';
import type { Network } from '@rosen-ui/types';

import { wrap } from '@/safeServerAction';

import { getBitcoinCashServerRuntime } from './serverConfig';

/** Return completed configured ports or a fixed public availability error. */
const requiredRuntime = () => {
  const runtime = getBitcoinCashServerRuntime();
  if (!runtime) throw new Error('BCH bridge unavailable');
  return runtime;
};

/** Query only server-authorized route, token, interval and minimum-fee NFT. */
const calculateFeeCore = async (
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
const getAddressBalanceCore = async (address: string) => {
  try {
    return await requiredRuntime().getAddressBalance(address);
  } catch {
    throw new Error('BCH balance query failed');
  }
};

/** Calculate the wrapped minimum using the trusted current fee query. */
const getMinTransferCore = async (token: RosenChainToken, target: Network, nft: string) => {
  try {
    return await requiredRuntime().getMinTransfer(token, target, nft);
  } catch {
    throw new Error('BCH minimum query failed');
  }
};

/** Calculate spendable maximum from authenticated native parents and server policy. */
const getMaxTransferCore = async (parameters: NetworkMaxTransferParams) => {
  try {
    return await requiredRuntime().getMaxTransfer(parameters);
  } catch {
    throw new Error('BCH maximum query failed');
  }
};

/** Prepare native lock parents only after matching a fresh server-owned Rosen quote. */
const generateSigningParametersCore = async (request: BitcoinCashDepositRequest) => {
  try {
    return await requiredRuntime().generateSigningParameters(request);
  } catch {
    throw new Error('BCH preparation failed');
  }
};

/** Validate an address through the shared network codec with a fixed error boundary. */
const validateAddressCore = async (chain: Network, address: string) => {
  try {
    return await requiredRuntime().validateAddress(chain, address);
  } catch {
    throw new Error('BCH address validation failed');
  }
};

export const calculateFee = wrap(calculateFeeCore, { traceKey: 'bitcoin-cash:calculateFee' });
export const getAddressBalance = wrap(getAddressBalanceCore, {
  traceKey: 'bitcoin-cash:getAddressBalance',
});
export const getMinTransfer = wrap(getMinTransferCore, { traceKey: 'bitcoin-cash:getMinTransfer' });
export const getMaxTransfer = wrap(getMaxTransferCore, { traceKey: 'bitcoin-cash:getMaxTransfer' });
export const generateSigningParameters = wrap(generateSigningParametersCore, {
  traceKey: 'bitcoin-cash:generateSigningParameters',
});
export const validateAddress = wrap(validateAddressCore, {
  traceKey: 'bitcoin-cash:validateAddress',
});
