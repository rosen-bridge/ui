import { ECDSA } from '@rosen-bridge/encryption';

import { PublicStatusActions } from '@/_backend/actions';
import { configs } from '@/_backend/configs';
import { AccessDeniedError, withValidation } from '@/api/withValidation';

import { validator, Params } from './validator';

// generating an ECDSA encryption object with no secret only for verification
const ecdsa = new ECDSA('');

function paramsToSignMessage(params: Params, timestampSeconds: number): string {
  return params.tx
    ? `${params.eventId}${params.status}${params.tx.txId}${params.tx.chain}${params.tx.txType}${params.tx.txStatus}${timestampSeconds}`
    : `${params.eventId}${params.status}${timestampSeconds}`;
}

async function handler(params: Params) {
  // check if pk is allowed
  if (!configs.allowedPks.includes(params.pk)) {
    throw new AccessDeniedError('access_denied');
  }

  // check timestamp
  const timestampSeconds = Math.floor(params.date.getTime() / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    nowSeconds < timestampSeconds ||
    nowSeconds - timestampSeconds >= configs.timeoutThresholdSeconds
  ) {
    throw new AccessDeniedError('bad_timestamp');
  }

  // verify signature
  const verified = await ecdsa.verify(
    paramsToSignMessage(params, timestampSeconds),
    params.signature,
    params.pk,
  );
  if (!verified) {
    throw new AccessDeniedError('verify_failed');
  }

  await PublicStatusActions.insertStatus(
    params.eventId,
    params.pk,
    nowSeconds,
    params.status,
    params.tx,
  );

  return {};
}

export const POST = withValidation(validator, handler);
