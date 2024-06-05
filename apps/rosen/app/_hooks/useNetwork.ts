import { TokenMap } from '@rosen-bridge/tokens';
import { useMemo } from 'react';

import { Networks } from '@/_constants';
import { AvailableNetworks, availableNetworks } from '@/_networks';

import useBridgeForm from './useBridgeForm';
import { useTokensMap } from './useTokensMap';

type Chain = string;
type SourceFieldValue = Chain & AvailableNetworks;

/**
 * handles network related operations and provide list of
 * available tokens in network
 */
const useNetwork = () => {
  const { sourceField, targetField } = useBridgeForm();
  const tokensMapObject = useTokensMap();

  const tokensMap = useMemo(() => {
    return new TokenMap(tokensMapObject);
  }, [tokensMapObject]);

  /**
   * returns the list of available network objects if a and filters out
   * unsupported networks
   */
  const availableNetworkObjects = useMemo(() => {
    return (tokensMap.getAllChains() as SourceFieldValue[])
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokensMap]);

  /**
   * returns the list of available target network objects if a and filters out
   * unsupported networks
   */
  const targetNetworks = useMemo(() => {
    return (
      tokensMap.getSupportedChains(sourceField.value) as SourceFieldValue[]
    )
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [sourceField.value, tokensMap]);

  /**
   * a list of available tokens in the selected network
   */
  const tokens = useMemo(() => {
    if (!targetField.value || !sourceField.value) return [];

    return tokensMap.getTokens(sourceField.value, targetField.value);
  }, [targetField.value, sourceField.value, tokensMap]);

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
