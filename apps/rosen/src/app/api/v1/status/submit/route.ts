import { ECDSA } from '@rosen-bridge/encryption';

import { AccessDeniedError, withValidation } from '@/app/api/v1/withValidation';
import { dataSource } from '@/backend/dataSource';
import '@/backend/initialize-datasource-if-needed';
import { PublicStatusAction } from '@/backend/status/PublicStatusAction';
import { publicStatusConfigs } from '@/backend/status/services';

import { paramsToSignMessage, validator, Params } from './validator';

PublicStatusAction.init(dataSource);

// generating an ECDSA encryption object with no secret only for verification
const ecdsa = new ECDSA('');

const handler = async (params: Params) => {
  // check if pk is allowed
  if (!publicStatusConfigs.allowedPks.includes(params.pk)) {
    throw new AccessDeniedError('public key not allowed');
  }

  // check timestamp
  const timestampSeconds = Math.floor(params.date.getTime() / 1000);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    nowSeconds < timestampSeconds ||
    nowSeconds - timestampSeconds >= publicStatusConfigs.timeoutThresholdSeconds
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
    publicStatusConfigs.eventStatusThresholds,
    publicStatusConfigs.txStatusThresholds,
    params.tx,
  );

  return { ok: true };
};

export const POST = withValidation(validator, handler);
