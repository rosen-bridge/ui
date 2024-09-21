import { useMemo } from 'react';

import { Networks } from '@rosen-ui/constants';
import { AvailableNetworks, availableNetworks } from '@/_networks';

import useBridgeForm from './useBridgeForm';
import { useTokenMap } from './useTokenMap';

type Chain = string;
type SourceFieldValue = Chain & AvailableNetworks;

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
    return (tokenMap.getAllChains() as SourceFieldValue[])
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokenMap]);

  /**
   * returns the list of available target network objects if a and filters out
   * unsupported networks
   */
  const targetNetworks = useMemo(() => {
    return (
      tokenMap.getSupportedChains(sourceField.value) as SourceFieldValue[]
    )
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
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
      ? availableNetworks[sourceField.value as SourceFieldValue]
      : null,
    targetNetworks: targetNetworks,
    tokens,
  };
};

export default useNetwork;
