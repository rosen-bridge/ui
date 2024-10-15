import { useMemo } from 'react';

import { NETWORK_VALUES } from '@rosen-ui/constants';
import { availableNetworks } from '@/_networks';

import useBridgeForm from './useBridgeForm';
import { useTokenMap } from './useTokenMap';
import { Network } from '@rosen-ui/types';

/**
 * handles network related operations and provide list of
 * available tokens in network
 */
const useNetwork = () => {
  const { sourceField, targetField } = useBridgeForm();
  const tokenMap = useTokenMap();

  /**
   * returns the list of available network objects if a and filters out
   * unsupported networks
   */
  const availableNetworkObjects = useMemo(() => {
    return (tokenMap.getAllChains() as Network[])
      .filter((chain) => NETWORK_VALUES.includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokenMap]);

  /**
   * returns the list of available target network objects if a and filters out
   * unsupported networks
   */
  const targetNetworks = useMemo(() => {
    return (tokenMap.getSupportedChains(sourceField.value) as Network[])
      .filter((chain) => NETWORK_VALUES.includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [sourceField.value, tokenMap]);

  /**
   * a list of available tokens in the selected network
   */
  const tokens = useMemo(() => {
    if (!targetField.value || !sourceField.value) return [];

    return tokenMap.getTokens(sourceField.value, targetField.value);
  }, [targetField.value, sourceField.value, tokenMap]);

  return {
    availableNetworks: availableNetworkObjects,
    selectedNetwork: sourceField.value
      ? availableNetworks[sourceField.value as Network]
      : null,
    targetNetworks: targetNetworks,
    tokens,
    selectedTargetNetwork: targetField.value
      ? availableNetworks[targetField.value as Network]
      : null,
  };
};

export default useNetwork;
