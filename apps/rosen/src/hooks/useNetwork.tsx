import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { Network } from '@rosen-network/base';
import { NETWORKS } from '@rosen-ui/constants';
import { Network as NetworkKey } from '@rosen-ui/types';

import * as networks from '@/networks';

import { useBridgeForm } from './useBridgeForm';
import { useTokenMap } from './useTokenMap';

/**
 * handles network related operations and provide list of
 * available tokens in network
 */
export const useNetwork = () => {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }

  return context;
};

export type NetworkContextType = {
  sources: Network[];
  availableSources: Network[];
  selectedSource?: Network;

  targets: Network[];
  availableTargets: Network[];
  selectedTarget?: Network;

  tokens: RosenChainToken[];
  availableTokens: RosenChainToken[];
};

export const NetworkContext = createContext<NetworkContextType | null>(null);

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const { sourceField, targetField } = useBridgeForm();

  const tokenMap = useTokenMap();

  const [availableSources, setAvailableSources] = useState<Network[]>([]);

  const [availableTargets, setAvailableTargets] = useState<Network[]>([]);

  const [availableTokens, setAvailableTokens] = useState<RosenChainToken[]>([]);

  const blacklist = useMemo(
    () =>
      (process.env.NEXT_PUBLIC_BLOCKED_TOKENS || '')
        .split(';')
        .map((raw) => raw.trim())
        .filter(Boolean)
        .map((raw) => {
          const [fromChain, toChain, tokenName] = raw
            .split(',')
            .map((value) => value.trim());
          return {
            fromChain,
            toChain,
            tokenName,
          };
        }),
    [],
  );

  const getNetwork = useCallback((name: NetworkKey) => {
    return Object.values<Network>(networks).find(
      (wallet) => wallet.name == name,
    );
  }, []);

  /**
   * returns the list of available network objects if a and filters out
   * unsupported networks
   */
  const sources = useMemo(() => {
    return (tokenMap.getAllChains() as NetworkKey[])
      .filter((chain) => !!NETWORKS[chain])
      .map((chain) => getNetwork(chain))
      .filter((chain) => !!chain);
  }, [tokenMap, getNetwork]);

  /**
   * returns the list of available target network objects if a and filters out
   * unsupported networks
   */
  const targets = useMemo(() => {
    return (tokenMap.getSupportedChains(sourceField.value) as NetworkKey[])
      .filter((chain) => !!NETWORKS[chain])
      .map((chain) => getNetwork(chain))
      .filter((chain) => !!chain);
  }, [sourceField.value, tokenMap, getNetwork]);

  /**
   * a list of available tokens in the selected network
   */
  const tokens = useMemo(() => {
    if (!targetField.value || !sourceField.value) return [];

    return tokenMap.getTokens(sourceField.value, targetField.value);
  }, [targetField.value, sourceField.value, tokenMap]);

  const selectedSource = getNetwork(sourceField.value);

  const selectedTarget = getNetwork(targetField.value);

  useEffect(() => {
    if (!blacklist) return;

    const sources = new Set<Network>(),
      targets = new Set<Network>(),
      tokens = new Set<RosenChainToken>();

    for (const fromChain of tokenMap.getAllChains()) {
      if (!NETWORKS[fromChain as NetworkKey]) continue;

      for (const toChain of tokenMap.getSupportedChains(fromChain)) {
        if (!NETWORKS[toChain as NetworkKey]) continue;

        for (const token of tokenMap.getTokens(fromChain, toChain)) {
          const isBlocked = blacklist.some(
            (item) =>
              ![
                [fromChain, item.fromChain],
                [toChain, item.toChain],
                [token.name, item.tokenName],
              ].some(([a, b]) => b != a && b != '*'),
          );

          if (isBlocked) continue;
          const sourceNetwork = getNetwork(fromChain as NetworkKey);

          if (sourceNetwork) sources.add(sourceNetwork);

          if (sourceField.value != fromChain) continue;

          const targetNetwork = getNetwork(toChain as NetworkKey);

          if (targetNetwork) targets.add(targetNetwork);

          if (targetField.value != toChain) continue;

          tokens.add(token);
        }
      }
    }

    setAvailableSources(Array.from(sources));
    setAvailableTargets(Array.from(targets));
    setAvailableTokens(Array.from(tokens));
  }, [blacklist, tokenMap, sourceField.value, targetField.value, getNetwork]);

  const state = {
    sources,
    availableSources,
    selectedSource,

    targets,
    availableTargets,
    selectedTarget,

    tokens,
    availableTokens,
  };

  return (
    <NetworkContext.Provider value={state}>{children}</NetworkContext.Provider>
  );
};
