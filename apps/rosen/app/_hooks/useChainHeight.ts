import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import useNetwork from './useNetwork';

import { Networks } from '@/_constants';

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
    return isErgoNet(data, chain)
      ? (data?.height as BigInt)
      : (data?.[0]?.block_height as BigInt);
  };

  return {
    height:
      data && selectedNetwork ? getHeight(data, selectedNetwork.name) : null,
    ...rest,
  };
};

export default useChainHeight;
