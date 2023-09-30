import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ergoExplorerUrl, cardanoExplorerUrl, Networks } from '@/_constants';

const cardanoUrl = cardanoExplorerUrl + '/v0/blocks?limit=1';
const ergoUrl = ergoExplorerUrl + '/v1/networkState';

type ErgoHeightResponse = { height: BigInt };
type CardanoHeightResponse = { block_height: BigInt }[];

type NetworkHeightResponse = ErgoHeightResponse | CardanoHeightResponse;

const isErgoNet = (
  data: NetworkHeightResponse,
  network: keyof typeof Networks,
): data is ErgoHeightResponse => {
  return network === Networks.ergo;
};

/**
 * a react hook to fetch latest network height
 */

const useChainHeight = (chain: keyof typeof Networks | null) => {
  const url = chain === Networks.ergo ? ergoUrl : cardanoUrl;

  const { data, ...rest } = useSWR<NetworkHeightResponse>(
    chain ? url : null,
    fetcher,
  );

  const getHeight = (
    data: NetworkHeightResponse,
    chain: keyof typeof Networks,
  ) => {
    return isErgoNet(data, chain)
      ? (data?.height as BigInt)
      : (data?.[0]?.block_height as BigInt);
  };

  return {
    height: data && chain ? getHeight(data, chain) : null,
    ...rest,
  };
};

export default useChainHeight;
