import { ECDSA } from '@rosen-bridge/encryption';

import { PublicStatusActions } from '@/_backend/actions';
import { configs } from '@/_backend/configs';
import { AccessDeniedError, withValidation } from '@/api/withValidation';

import { validator, Params } from './validator';

const ecdsa = new ECDSA('');

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
    // TODO: extract
    `${params.eventId}${params.status}${params.txId ?? ''}${params.txType ?? ''}${params.txStatus ?? ''}${timestampSeconds}`,
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
    params.txId,
    params.txType,
    params.txStatus,
  );

  return {};
}

export const POST = withValidation(validator, handler);
