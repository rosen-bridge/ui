import { TokenMap } from '@rosen-bridge/tokens';
import { NETWORKS } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

import { NATIVE_TOKEN_TRANSFER_GAS } from './constants';
import { EvmChains } from './types';
import { getFeeData } from './utils';

export const getMaxTransferCreator =
  (getTokenMap: () => Promise<TokenMap>, chain: EvmChains) =>
  async ({
    balance,
    isNative,
  }: {
    balance: RosenAmountValue;
    isNative: boolean;
  }) => {
    const tokenMap = await getTokenMap();
    const feeData = await getFeeData(chain);
    if (!feeData.gasPrice) throw Error(`gas price is null`);
    const estimatedFee = feeData.gasPrice * NATIVE_TOKEN_TRANSFER_GAS;

    const wrappedFee = tokenMap.wrapAmount(
      NETWORKS[chain].nativeToken,
      estimatedFee,
      chain,
    ).amount;
    const offset = isNative ? wrappedFee : 0n;
    const amount = balance - offset;
    return amount < 0n ? 0n : amount;
  };
