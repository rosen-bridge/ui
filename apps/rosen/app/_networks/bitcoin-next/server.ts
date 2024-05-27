'use server';

import { getBalance as getBalanceCore } from '@rosen-ui/xdefi-wallet-next/dist/src/getBalance';
import { transfer as transferCore } from '@rosen-ui/xdefi-wallet-next/dist/src/transfer';

export const getBalance = getBalanceCore;
export const transfer = transferCore;
