import JsonBigInt from '@rosen-bridge/json-bigint';
import { ErgoNetworkType } from '@rosen-bridge/scanner-interfaces';

import { configs } from './configs/index';
import { ERGO_METHOD_EXPLORER } from './constants';
import { ErgoNetworkConfig } from './types/index';

/**
 * map bigint value in data to string before inserting in redis
 *
 * @returns string
 */
export const stringSerializer = (data: unknown): string =>
  JsonBigInt.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value,
  );

/**
 * Resolves Ergo network type and connection URL based on configuration.
 *
 * @returns {{ networkType: ErgoNetworkType; url: string }} Network type and URL
 */
export const resolveErgoNetworkConfig = (): ErgoNetworkConfig => {
  if (configs.chains.ergo.method === ERGO_METHOD_EXPLORER) {
    return {
      networkType: ErgoNetworkType.Explorer,
      url: configs.chains.ergo.explorer.connections[0].url!,
    };
  }
  return {
    networkType: ErgoNetworkType.Node,
    url: configs.chains.ergo.node.connections[0].url!,
  };
};

/**
 * Converts chain key to camelCase or PascalCase.
 */
export const formatChainName = (
  chain: string,
  mode: 'camel' | 'pascal' = 'camel',
): string => {
  const parts = chain.split('-');

  return parts
    .map((part, index) => {
      if (index === 0 && mode === 'camel') return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
};
