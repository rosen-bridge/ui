import { ECDSA } from '@rosen-bridge/encryption';

import { EventStatusActions } from '@/_backend/actions';
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
  const timestamp = Math.floor(params.date.getTime() / 1000);
  const now = Math.floor(Date.now() / 1000);
  if (now < timestamp || now - timestamp >= configs.timeoutThresholdSeconds) {
    throw new AccessDeniedError('bad_timestamp');
  }

  // verify signature
  const verified = await ecdsa.verify(
    `${params.eventId}${params.status}${params.txId ?? ''}${params.txType ?? ''}${params.txStatus ?? ''}${timestamp}`,
    params.signature,
    params.pk,
  );
  if (!verified) {
    throw new AccessDeniedError('verify_failed');
  }

  await EventStatusActions.insertStatus(
    timestamp,
    params.pk,
    params.eventId,
    params.status,
    params.txId,
    params.txType,
    params.txStatus,
  );

  return {};
}

export const POST = withValidation(validator, handler);
