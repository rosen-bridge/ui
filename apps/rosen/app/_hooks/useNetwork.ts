import { useMemo } from 'react';
import { TokenMap } from '@rosen-bridge/tokens';

import useBridgeForm from './useBridgeForm';

import ErgoNetwork from '@/_networks/ergo';
import CardanoNetwork from '@/_networks/cardano';

import { Networks } from '@/_constants';

import tokensMap from '@/_configs/tokensMap-private-test-2.0.0-b3dc2da.json';

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

  const tokenMapper = useMemo(() => {
    return new TokenMap(tokensMap);
  }, []);

  const availableNetworkObjects = useMemo(() => {
    return (tokenMapper.getAllChains() as SourceFieldValue[])
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokenMapper]);

  const targetNetworks = useMemo(() => {
    return (
      tokenMapper.getSupportedChains(sourceField.value) as SourceFieldValue[]
    )
      .filter((chain) => Object.values<Chain>(Networks).includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [sourceField.value, tokenMapper]);

  const tokens = useMemo(() => {
    if (!targetField.value || !sourceField.value) return [];

    return tokenMapper.getTokens(sourceField.value, targetField.value);
  }, [targetField.value, sourceField.value, tokenMapper]);

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
