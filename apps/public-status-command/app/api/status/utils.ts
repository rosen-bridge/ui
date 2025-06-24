import { Params } from './validator';

export const paramsToSignMessage = (
  params: Params,
  timestampSeconds: number,
): string => {
  return params.tx
    ? `${params.eventId}${params.status}${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}${timestampSeconds}`
    : `${params.eventId}${params.status}${timestampSeconds}`;
};
