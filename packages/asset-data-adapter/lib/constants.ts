import { NETWORKS } from '@rosen-ui/constants';
import { InterfaceAbi } from 'ethers';

export const ERG_TOTAL_SUPPLY = 97_739_924_500_000_000n;
export const NATIVE_TOKENS_TOTAL_SUPPLIES: { [k: string]: bigint } = {
  [NETWORKS.ergo.key]: ERG_TOTAL_SUPPLY,
  [NETWORKS.bitcoin.key]: 2_100_000_000_000_000n,
  [NETWORKS['bitcoin-runes'].key]: 2_100_000_000_000_000n,
  [NETWORKS.ethereum.key]:
    999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999n,
  [NETWORKS.binance.key]: 200_000_000_000_000_000_000_000_000_000_000n,
  [NETWORKS.cardano.key]: 45_000_000_000_000_000n,
  [NETWORKS.doge.key]:
    999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999_999n,
};

export const PartialERC20ABI: InterfaceAbi = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    type: 'function',
  },
];
