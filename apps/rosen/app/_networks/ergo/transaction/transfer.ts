'use server';

import { EipWalletApi } from '@rosen-ui/wallet-api';
import { generateUnsignedTx } from './generateTx';

/**
 * generates, signs and sends lock transaction on Ergo
 * @param wallet
 * @param lockAddress
 * @param toChain
 * @param toAddress
 * @param tokenId
 * @param amount
 * @param bridgeFee
 * @param networkFee
 * @returns
 */
export const transferOnErgo = async (
  wallet: EipWalletApi,
  lockAddress: string,
  toChain: string,
  toAddress: string,
  tokenId: string,
  amount: bigint,
  bridgeFee: bigint,
  networkFee: bigint,
): Promise<string> => {
  const unsignedTx = await generateUnsignedTx(
    wallet,
    lockAddress,
    toChain,
    toAddress,
    tokenId,
    amount,
    bridgeFee,
    networkFee,
  );
  const signedTx = await wallet.sign_tx(unsignedTx);
  return await wallet.submit_tx(signedTx);
};
