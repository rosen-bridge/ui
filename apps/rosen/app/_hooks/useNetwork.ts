import { useEffect, useMemo, useState } from 'react';

import { RosenChainToken } from '@rosen-bridge/tokens';
import { NETWORK_VALUES } from '@rosen-ui/constants';
import { Network } from '@rosen-ui/types';

import { AvailableNetworks, availableNetworks } from '@/_networks';

import { useBridgeForm } from './useBridgeForm';
import { useTokenMap } from './useTokenMap';

type BlackList = {
  fromChain: Network;
  toChain: Network;
  tokenName: string;
};

/**
 * handles network related operations and provide list of
 * available tokens in network
 */
export const useNetwork = () => {
  const { sourceField, targetField } = useBridgeForm();

  const tokenMap = useTokenMap();

  const [blacklist, setBlacklist] = useState<BlackList[]>();

  const [availableSources, setAvailableSources] = useState<AvailableNetworks[]>(
    [],
  );

  const [availableTargets, setAvailableTargets] = useState<AvailableNetworks[]>(
    [],
  );

  const [availableTokens, setAvailableTokens] = useState<RosenChainToken[]>([]);

  /**
   * returns the list of available network objects if a and filters out
   * unsupported networks
   */
  const sources = useMemo(() => {
    return (tokenMap.getAllChains() as Network[])
      .filter((chain) => NETWORK_VALUES.includes(chain))
      .map((chain) => availableNetworks[chain]);
  }, [tokenMap]);

  /**
   * returns the list of available target network objects if a and filters out
   * unsupported networks
   */
  const targets = useMemo(() => {
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

  const selectedSource =
    availableNetworks[sourceField.value as Network] || null;

  const selectedTarget =
    availableNetworks[targetField.value as Network] || null;

  useEffect(() => {
    if (!blacklist) return;

    const sources = new Set<AvailableNetworks>(),
      targets = new Set<AvailableNetworks>(),
      tokens = new Set<RosenChainToken>();

    for (const fromChain of tokenMap.getAllChains()) {
      if (!NETWORK_VALUES.includes(fromChain as Network)) continue;

      for (const toChain of tokenMap.getSupportedChains(fromChain)) {
        if (!NETWORK_VALUES.includes(toChain as Network)) continue;

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

          sources.add(availableNetworks[fromChain as Network]);

          if (sourceField.value != fromChain) continue;

          targets.add(availableNetworks[toChain as Network]);

          if (targetField.value != toChain) continue;

          tokens.add(token);
        }
      }
    }

    setAvailableSources(Array.from(sources));
    setAvailableTargets(Array.from(targets));
    setAvailableTokens(Array.from(tokens));
  }, [blacklist, tokenMap, sourceField.value, targetField.value]);

  useEffect(() => {
    const blacklist = (process.env.NEXT_PUBLIC_BLOCKED_TOKENS || '')
      .split(';')
      .map((raw) => raw.trim())
      .filter((raw) => !!raw)
      .reduce((items, raw) => {
        const [fromChain, toChain, tokenName] = raw
          .split(',')
          .map((value) => value.trim());
        const item = {
          fromChain: fromChain as Network,
          toChain: toChain as Network,
          tokenName,
        };
        return items.concat(item);
      }, [] as BlackList[]);
    setBlacklist(blacklist);
  }, []);

  return {
    sources,
    availableSources,
    selectedSource,

    targets,
    availableTargets,
    selectedTarget,

    tokens,
    availableTokens,
  };
};
