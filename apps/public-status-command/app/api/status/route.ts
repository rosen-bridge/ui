import { ECDSA } from '@rosen-bridge/encryption';

import { PublicStatusAction } from '@/_backend/actions';
import { configs } from '@/_backend/configs';
import { AccessDeniedError, withValidation } from '@/api/withValidation';

import { paramsToSignMessage } from './utils';
import { validator, Params } from './validator';

// generating an ECDSA encryption object with no secret only for verification
const ecdsa = new ECDSA('');

const handler = async (params: Params) => {
  // check if pk is allowed
  if (!configs.allowedPks.includes(params.pk)) {
    throw new AccessDeniedError('public key not allowed');
  }

  // check timestamp
  const timestampSeconds = Math.floor(params.date.getTime() / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    nowSeconds < timestampSeconds ||
    nowSeconds - timestampSeconds >= configs.timeoutThresholdSeconds
  ) {
    throw new AccessDeniedError('invalid timestamp');
  }

  // verify signature
  const verified = await ecdsa.verify(
    paramsToSignMessage(params, timestampSeconds),
    params.signature,
    params.pk,
  );
  if (!verified) {
    throw new AccessDeniedError('signature verification failed');
  }

  await PublicStatusAction.getInstance().insertStatus(
    params.eventId,
    params.pk,
    nowSeconds,
    params.status,
    configs.eventStatusThresholds,
    configs.txStatusThresholds,
    params.tx,
  );

  return { ok: true };
};

export const POST = withValidation(validator, handler);
