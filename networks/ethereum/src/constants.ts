import { InterfaceAbi } from 'ethers';

export const ETH = 'eth';
export const ETH_TRANSFER_GAS = 21000n;

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
