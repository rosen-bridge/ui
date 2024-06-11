import { BitcoinNetwork, CardanoNetwork, ErgoNetwork } from '@/_types/network';

/**
 * return max transfer, considering all the context that affects it
 * @param network
 * @param tokenInfo
 * @param context
 */
const getMaxTransfer = async (
  network: ErgoNetwork | CardanoNetwork | BitcoinNetwork,
  tokenInfo: {
    balance: number;
    isNative: boolean;
  },
  context: {
    fromAddress: string;
    toAddress: string;
    toChain: string;
  },
) => {
  const max =
    network.name === 'bitcoin'
      ? await network.getMaxTransfer({
          balance: tokenInfo.balance,
          isNative: tokenInfo.isNative,
          eventData: {
            fromAddress: context.fromAddress,
            toAddress: context.toAddress,
            toChain: context.toChain,
          },
        })
      : await network.getMaxTransfer({
          balance: tokenInfo.balance,
          isNative: tokenInfo.isNative,
        });

  return max;
};

export default getMaxTransfer;
