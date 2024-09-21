import {
  BitcoinNetwork,
  CardanoNetwork,
  ErgoNetwork,
  EthereumNetwork,
} from '@/_types/network';
import { Networks } from '@rosen-ui/constants';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * return max transfer, considering all the context that affects it
 * @param network
 * @param tokenInfo CONTAINS A WRAPPED-VALUE
 * @param context
 * @returns THIS IS A WRAPPED-VALUE
 */
export const getMaxTransfer = async (
  network: ErgoNetwork | CardanoNetwork | BitcoinNetwork | EthereumNetwork,
  tokenInfo: {
    balance: RosenAmountValue;
    isNative: boolean;
  },
  getContext: () => Promise<{
    fromAddress: string;
    toAddress: string;
    toChain: string;
  }>,
): Promise<RosenAmountValue> => {
  if (network.name === Networks.BITCOIN) {
    const context = await getContext();
    return await network.getMaxTransfer({
      balance: tokenInfo.balance,
      isNative: tokenInfo.isNative,
      eventData: {
        fromAddress: context.fromAddress,
        toAddress: context.toAddress,
        toChain: context.toChain,
      },
    });
  }

  return await network.getMaxTransfer({
    balance: tokenInfo.balance,
    isNative: tokenInfo.isNative,
  });
};
