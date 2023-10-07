import { useMemo } from 'react';
import { TokenMap } from '@rosen-bridge/tokens';

import useBridgeForm from './useBridgeForm';
import { useTokensMap } from './useTokensMap';

import ErgoNetwork from '@/_networks/ergo';
import CardanoNetwork from '@/_networks/cardano';

import { Networks } from '@/_constants';

const availableNetworks = {
  [Networks.ergo]: ErgoNetwork,
  [Networks.cardano]: CardanoNetwork,
};

type Chain = string;
type SourceFieldValue = Chain & keyof typeof Networks;

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

  const availableNetworkObjects = useMemo(() => {
    return (tokensMap.getAllChains() as SourceFieldValue[])
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokensMap]);

  const targetNetworks = useMemo(() => {
    return (
      tokensMap.getSupportedChains(sourceField.value) as SourceFieldValue[]
    )
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [sourceField.value, tokensMap]);

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
