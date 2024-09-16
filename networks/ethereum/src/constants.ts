import { Networks } from '@rosen-ui/constants';
import { InterfaceAbi } from 'ethers';

export const ETH = 'eth';

export const SUPPORTED_CHAINS = [
  Networks.ERGO,
  Networks.CARDANO,
  Networks.BITCOIN,
  Networks.ETHEREUM,
] as const;

export const transferABI: InterfaceAbi = [
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
