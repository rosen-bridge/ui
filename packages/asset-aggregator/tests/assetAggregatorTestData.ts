import { RosenTokens } from '@rosen-bridge/tokens';

import { AssetBalance, TotalSupply } from '../lib/types';

/**
 * sample mapping of tokens across multiple chains
 */
export const SAMPLE_TOKEN_MAP: RosenTokens = [
  {
    ergo: {
      tokenId: 'erg',
      name: 'erg',
      decimals: 9,
      type: 'native',
      residency: 'native',
      extra: {},
    },
    binance: {
      tokenId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
      name: 'rpnErg',
      decimals: 6,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: {},
    },
  },
  {
    ergo: {
      tokenId:
        'e752bede1a85891fff344604431fd6dc30ba685b382f2e0fe15da8141d36e300',
      name: 'RSN-Pandora',
      decimals: 3,
      type: 'EIP-004',
      residency: 'native',
      extra: {},
    },
    ethereum: {
      tokenId: '0xe56a632afd90e68a4b3147720b1b4e974bca8200',
      name: 'rpnRSN',
      decimals: 3,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: {},
    },
    cardano: {
      tokenId:
        '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb.72706e525300',
      name: 'rpnRSN',
      decimals: 3,
      type: 'CIP26',
      residency: 'wrapped',
      extra: {
        policyId: '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb200',
        assetName: '72706e52534e',
      },
    },
    binance: {
      tokenId: '0xbe7d4d48939d3edcae1b8103a2e01acd3f51ec00',
      name: 'rpnRSN',
      decimals: 3,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: {},
    },
  },
  {
    binance: {
      tokenId: 'bnb',
      name: 'BNB',
      decimals: 18,
      type: 'native',
      residency: 'native',
      extra: {},
    },
    ethereum: {
      tokenId: '0x4189b3d05ddff3c5e9755579830be2cbe512f211',
      name: 'rpnBNB',
      decimals: 18,
      type: 'ERC-20',
      residency: 'wrapped',
      extra: {},
    },
    ergo: {
      tokenId:
        '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
      name: 'rpnBNB',
      decimals: 9,
      type: 'EIP-004',
      residency: 'wrapped',
      extra: {},
    },
    cardano: {
      tokenId:
        '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb.72706e424e00',
      name: 'rpnBNB',
      decimals: 9,
      type: 'CIP26',
      residency: 'wrapped',
      extra: {
        policyId: '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb',
        assetName: '72706e424e00',
      },
    },
  },
];

/**
 * simplified token entity data for database storage
 */
export const SAMPLE_TOKEN_ENTITY_DATA = [
  {
    chain: 'ergo',
    decimal: 9,
    id: 'erg',
    isNative: true,
    name: 'erg',
    significantDecimal: 6,
  },
  {
    chain: 'ergo',
    decimal: 3,
    id: 'e752bede1a85891fff344604431fd6dc30ba685b382f2e0fe15da8141d36e300',
    isNative: false,
    name: 'RSN-Pandora',
    significantDecimal: 3,
  },
  {
    chain: 'ergo',
    decimal: 9,
    id: '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
    isNative: false,
    name: 'rpnBNB',
    significantDecimal: 9,
  },
  {
    chain: 'binance',
    decimal: 6,
    id: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
    isNative: false,
    name: 'rpnErg',
    significantDecimal: 6,
  },
  {
    chain: 'binance',
    decimal: 3,
    id: '0xbe7d4d48939d3edcae1b8103a2e01acd3f51ec00',
    isNative: false,
    name: 'rpnRSN',
    significantDecimal: 3,
  },
  {
    chain: 'binance',
    decimal: 18,
    id: 'bnb',
    isNative: true,
    name: 'BNB',
    significantDecimal: 9,
  },
  {
    chain: 'ethereum',
    decimal: 3,
    id: '0xe56a632afd90e68a4b3147720b1b4e974bca8200',
    isNative: false,
    name: 'rpnRSN',
    significantDecimal: 3,
  },
  {
    chain: 'ethereum',
    decimal: 18,
    id: '0x4189b3d05ddff3c5e9755579830be2cbe512f211',
    isNative: false,
    name: 'rpnBNB',
    significantDecimal: 9,
  },
  {
    chain: 'cardano',
    decimal: 3,
    id: '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb.72706e525300',
    isNative: false,
    name: 'rpnRSN',
    significantDecimal: 3,
  },
  {
    chain: 'cardano',
    decimal: 9,
    id: '67abe42f549784c88f14e78872127d62fc0a7bfbed0ad7d41e5eb2fb.72706e424e00',
    isNative: false,
    name: 'rpnBNB',
    significantDecimal: 9,
  },
];

/**
 * sample native token balances per chain
 */
export const NATIVE_TOKEN_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    'erg': [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
    '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900': [
      { address: 'ergo_test-address-1', balance: 1000n },
      { address: 'ergo_test-address-2', balance: 2000n },
    ],
  },
  binance: {
    'bnb': [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
    '0xce5307d968c5d298239ffb7a6b0abd31aba5712e': [
      { address: 'binance_test-address-1', balance: 1000n },
      { address: 'binance_test-address-2', balance: 2000n },
    ],
  },
};

/**
 * sample analyzer output for bridged token
 */
export const SAMPLE_ANALYZER_BRIDGED_TOKEN = [
  {
    amount: 7000n,
    chain: 'ergo',
    tokenId: 'bnb',
    bridgedTokenId:
      '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
  },
  {
    amount: 7000n,
    chain: 'binance',
    tokenId: 'erg',
    bridgedTokenId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
  },
];

/**
 * sample wrapped token balances per chain
 */
export const WRAPPED_TOKEN_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900': [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
  },
};

/**
 * sample wrapped token total supply
 */
export const WRAPPED_TOKEN_TOTAL_SUPPLY: TotalSupply[] = [
  {
    assetId: '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
    totalSupply: 10000n,
  },
  {
    assetId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
    totalSupply: 10000n,
  },
];
