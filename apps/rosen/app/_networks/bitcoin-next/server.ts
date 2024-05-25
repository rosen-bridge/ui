'use server';

import {
  getBalance as getBalanceCore,
  transfer as transferCore,
} from '@rosen-ui/xdefi-wallet-next/dist/src/server';

export const getBalance = getBalanceCore;
export const transfer = transferCore;
