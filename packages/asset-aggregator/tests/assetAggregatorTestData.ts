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
      { address: '92f7_test-address-1', balance: 1000n },
      { address: '92f7_test-address-2', balance: 2000n },
    ],
  },
  binance: {
    'bnb': [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
    '0xce5307d968c5d298239ffb7a6b0abd31aba5712e': [
      { address: '0xce_test-address-1', balance: 1000n },
      { address: '0xce_test-address-2', balance: 2000n },
    ],
  },
};

/**
 * sample analyzer output for bridged token
 */
export const SAMPLE_ANALYZER_BRIDGED_TOKEN = [
  {
    amount: 7000n,
    bridgedTokenId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
    chain: 'binance',
    tokenId: 'erg',
  },
  {
    amount: 7000n,
    chain: 'ergo',
    tokenId: 'bnb',
    bridgedTokenId:
      '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
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
export const SAMPLE_TOTAL_SUPPLY: { [chain: string]: TotalSupply[] } = {
  ergo: [
    {
      assetId:
        'b2dcea48caf0e73309138d659f6eb69d7ec8793dee989670c72dd4ffde7ebeb3',
      totalSupply: 2100000000000000n,
    },
    {
      assetId:
        '08779df8d22fe096de6b382264af0ed6859326a47212484fffffe3fb212d7a1f',
      totalSupply: 45000000000000000n,
    },
    {
      assetId:
        '6cf0dd0ebd2c791c2aa8c2a083c16d15fc0e7b609d1dbddb553f319754acfcc1',
      totalSupply: 120383000000000000n,
    },
    {
      assetId:
        'ea94bcd86000d85518ae4fd9ec328018e4be9eee4d1081e3c42746c5bf62c352',
      totalSupply: 10000000000n,
    },
    {
      assetId:
        '21d2cd3c488d530bb7d2c8f3e9c1f495ee5a4f30ab798b83b481c978ece75f83',
      totalSupply: 148000000000000000n,
    },
    {
      assetId:
        '82f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc98c',
      totalSupply: 200000000000000000n,
    },
    {
      assetId:
        '8b35fd2dabc9bdf2b69aa9c25eb7e7818297add61b2dd3b5ab039439e100e487',
      totalSupply: 1000000000n,
    },
    {
      assetId:
        'd8ed061f2eb0a50ad7db8970e347356247faefe8ec5c3c786b0f7b55a5279465',
      totalSupply: 10000000000000n,
    },
  ],
  binance: [
    {
      assetId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
      totalSupply: 1000000000000n,
    },
    {
      assetId: '0x6c0694e681f97f2a3c86202ee9221bdfd6198578',
      totalSupply: 2100000000000000n,
    },
    {
      assetId: '0x788b22ca96bd6a6f8094e1ec11a82c77b7ecfec4',
      totalSupply: 45000000000000000n,
    },
    {
      assetId: '0x96cb997a115b7f57bd144ef4d1e8a68194444e91',
      totalSupply: 120383000000000000n,
    },
    {
      assetId: '0xae7d4d48939d3edcae1b8103a2e01acd3f51ecea',
      totalSupply: 1000000000000n,
    },
    {
      assetId: '0x2ad2474f38572a1b408d42d66f63244a02f406ab',
      totalSupply: 10000000000n,
    },
    {
      assetId: '0xfa0f85673a4a83ea19d09448e02f3f98e82f1a6d',
      totalSupply: 148000000000000000n,
    },
    {
      assetId: '0xbda81585b76a4b52955e68da77aad4398c1bb2d3',
      totalSupply: 1000000000000n,
    },
    {
      assetId: '0x70735aa53b8efff4aa655995df2e6c91fe8d1c50',
      totalSupply: 1000000000n,
    },
    {
      assetId: '0xa5e39005da08a7fc872ccdb62f40bff67c3f67cb',
      totalSupply: 10000000000000n,
    },
    {
      assetId: '0xbc152e294a24d777e640e6a491edbd3ca461c51f',
      totalSupply: 97739924500000000n,
    },
  ],
};

/**
 * sample wrapped token total supply
 */
export const WRAPPED_TOKEN_TOTAL_SUPPLY: { [chain: string]: TotalSupply[] } = {
  ergo: [
    {
      assetId:
        '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
      totalSupply: 10000n,
    },
  ],
  binance: [
    {
      assetId: '0xce5307d968c5d298239ffb7a6b0abd31aba5712e',
      totalSupply: 10000n,
    },
  ],
};
