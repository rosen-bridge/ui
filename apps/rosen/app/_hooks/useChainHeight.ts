import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import useNetwork from './useNetwork';

import { Networks } from '@/_constants';

type ErgoHeightResponse = { height: number };
type CardanoHeightResponse = { block_height: number }[];

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

const useChainHeight = () => {
  const { selectedNetwork } = useNetwork();

  const { data, ...rest } = useSWR<NetworkHeightResponse>(
    selectedNetwork ? selectedNetwork.api.networkStatusUrl : null,
    fetcher,
  );

  const getHeight = (
    data: NetworkHeightResponse,
    chain: keyof typeof Networks,
  ) => {
    return isErgoNet(data, chain) ? data?.height : data?.[0]?.block_height;
  };

  return {
    height:
      data && selectedNetwork ? getHeight(data, selectedNetwork.name) : null,
    ...rest,
  };
};

export default useChainHeight;
