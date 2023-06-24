import { ApiAddressAssetsResponse, ApiInfoResponse } from '@/_types/api';

export const info: ApiInfoResponse = {
  address: '3WvuxxkcM5gRhfktbKTn3Wvux1xkcM5gRhTn1WfktbGoSqpW',
  currentBalance: 150n,
  health: 'Unstable',
  network: 'ergo',
  permitCount: 100n,
};

export const addressAssets: ApiAddressAssetsResponse = [
  {
    name: 'awesome token',
    tokenId: '2162efc108a0aeba2c040a3a29b1e8573dc6b6d746d33e5fe9cf9ccc1796f630',
    amount: 10000n,
    decimals: 2,
  },
  {
    tokenId: '91e9086194cd9144a1661c5820dd53869afd1711d4c5a305b568a452e86f81b1',
    amount: 2n,
    decimals: 0,
  },
  {
    name: 'another awesome token',
    tokenId: 'c6cce2d65182c2e4343d942000263b75d103e6d56fea08ded6dfc25548c2d34d',
    amount: 200n,
    decimals: 1,
  },
  {
    name: 'yet another token',
    tokenId: '6c1526b2a5ef010edb622719d9d7fbde8437a39543547c3effbe72ad33504cf1',
    amount: 20n,
    decimals: 5,
  },
];
