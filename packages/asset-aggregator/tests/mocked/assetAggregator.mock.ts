import { RosenTokens } from '@rosen-bridge/tokens';
import { AssetBalance } from '@rosen-ui/asset-data-adapter';

import { TotalSupply } from '../../lib/types';

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
 * Sample chain asset balance info for testing update method
 */
export const SAMPLE_CHAIN_ASSET_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    'erg': [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
    '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900': [
      { address: 'test-address-3', balance: 5000n },
    ],
  },
  binance: {
    bnb: [{ address: 'test-address-4', balance: 3000n }],
  },
};

/**
 * Sample chain asset balance info for native token test
 */
export const NATIVE_TOKEN_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    erg: [
      { address: 'test-address-1', balance: 1000n },
      { address: 'test-address-2', balance: 2000n },
    ],
  },
};

/**
 * Sample total supply for native token test
 */
export const NATIVE_TOKEN_TOTAL_SUPPLY: TotalSupply[] = [
  { assetId: 'erg', totalSupply: 1000000n },
];

/**
 * Sample chain asset balance info for wrapped token test
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
 * Sample total supply for wrapped token test
 */
export const WRAPPED_TOKEN_TOTAL_SUPPLY: TotalSupply[] = [
  {
    assetId: '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
    totalSupply: 10000n,
  },
];

/**
 * Sample chain asset balance info for mixed tokens test (native + wrapped)
 */
export const MIXED_TOKENS_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    'erg': [{ address: 'test-address-1', balance: 1000n }],
    '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900': [
      { address: 'test-address-2', balance: 5000n },
    ],
  },
};

/**
 * Sample total supply for mixed tokens test
 */
export const MIXED_TOKENS_TOTAL_SUPPLY: TotalSupply[] = [
  { assetId: 'erg', totalSupply: 100000n },
  {
    assetId: '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
    totalSupply: 10000n,
  },
];

/**
 * Sample chain asset balance info for multiple chains test
 */
export const MULTI_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    erg: [{ address: 'test-address-1', balance: 1000n }],
  },
  binance: {
    bnb: [{ address: 'test-address-2', balance: 2000n }],
  },
};

/**
 * Sample chain asset balance info for bridged amount calculation test
 */
export const BRIDGED_AMOUNT_CHAIN_BALANCE_INFO: Record<string, AssetBalance> = {
  ergo: {
    '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900': [
      { address: 'addr1', balance: 100n },
      { address: 'addr2', balance: 200n },
      { address: 'addr3', balance: 50n },
    ],
  },
};

/**
 * Sample total supply for bridged amount calculation test
 */
export const BRIDGED_AMOUNT_TOTAL_SUPPLY: TotalSupply[] = [
  {
    assetId: '92f7cec6d682e8a0d965e6d93de66ec18933f72181c59a5d85802f0fe2afc900',
    totalSupply: 500n,
  },
];
