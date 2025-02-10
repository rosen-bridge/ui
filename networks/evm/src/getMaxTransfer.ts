import { TokenMap } from '@rosen-bridge/tokens';
import { NATIVE_TOKENS, NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { NATIVE_TOKEN_TRANSFER_GAS } from './constants';
import { EvmChains } from './types';
import { getFeeData } from './utils';

export const getMaxTransferCreator =
  (tokenMap: TokenMap, chain: EvmChains) =>
  async ({
    balance,
    isNative,
  }: {
    balance: RosenAmountValue;
    isNative: boolean;
  }) => {
    const feeData = await getFeeData(chain);
    if (!feeData.gasPrice) throw Error(`gas price is null`);
    const estimatedFee = feeData.gasPrice * NATIVE_TOKEN_TRANSFER_GAS;

    const wrappedFee = tokenMap.wrapAmount(
      chain == EvmChains.BINANCE
        ? NATIVE_TOKENS.BINANCE
        : NATIVE_TOKENS.ETHEREUM,
      estimatedFee,
      chain == EvmChains.BINANCE ? NETWORKS.BINANCE : NETWORKS.ETHEREUM,
    ).amount;
    const offset = isNative ? wrappedFee : 0n;
    const amount = balance - offset;
    return amount < 0n ? 0n : amount;
  };
