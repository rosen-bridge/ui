import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ergoExplorerUrl, cardanoExplorerUrl, Chains } from '@/_constants';

const cardanoUrl = cardanoExplorerUrl + '/v0/blocks?limit=1';
const ergoUrl = ergoExplorerUrl + '/v1/networkState';

const useChainHeight = (chain: keyof typeof Chains | null) => {
  const isErgo = chain === Chains.ergo;
  const url = isErgo ? ergoUrl : cardanoUrl;

  const { data, ...rest } = useSWR(chain ? url : null, fetcher);

  return {
    height: isErgo
      ? (data?.height as BigInt)
      : (data?.[0]?.block_height as BigInt),
    ...rest,
  };
};

export default useChainHeight;
