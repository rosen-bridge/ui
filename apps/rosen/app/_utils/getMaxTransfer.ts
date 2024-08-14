import { BitcoinNetwork, CardanoNetwork, ErgoNetwork } from '@/_types/network';
import { RosenAmountValue } from '@rosen-ui/types';

/**
 * return max transfer, considering all the context that affects it
 * @param network
 * @param tokenInfo CONTAINS A WRAPPED-VALUE
 * @param context
 * @returns THIS IS A WRAPPED-VALUE
 */
const getMaxTransfer = async (
  network: ErgoNetwork | CardanoNetwork | BitcoinNetwork,
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
  if (network.name === 'bitcoin') {
    const context = await getContext();
    return network.getMaxTransfer({
      balance: tokenInfo.balance,
      isNative: tokenInfo.isNative,
      eventData: {
        fromAddress: context.fromAddress,
        toAddress: context.toAddress,
        toChain: context.toChain,
      },
    });
  }

  return network.getMaxTransfer({
    balance: tokenInfo.balance,
    isNative: tokenInfo.isNative,
  });
};

export default getMaxTransfer;
