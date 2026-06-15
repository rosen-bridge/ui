import { ECDSA } from '@rosen-bridge/encryption';
import { EventStatus, TxType } from '@rosen-ui/public-status';
import axios from 'axios';

import { apiBaseUrl, guardSecrets } from '../constants';
import { StatusDTO, StatusRecord } from '../types';

const sign = async (message: string, secret: string) => {
  const ecdsa = new ECDSA(secret);
  return ecdsa.sign(message);
};

const signDTO = async (dto: StatusDTO, secret: string) => {
  const tx = dto.tx
    ? `${dto.tx.txId}${dto.tx.chain}${dto.tx.txType}${dto.tx.txStatus}`
    : '';

  return {
    ...dto,
    signature: await sign(
      `${dto.eventId}${dto.status}${tx}${dto.date}`,
      secret,
    ),
  };
};

export const submitStatus = async (params: StatusRecord) => {
  const secret = guardSecrets[params.guardPk];

  const dto: StatusDTO = {
    date: params.insertedAt,
    eventId: params.eventId,
    status: params.status,
    pk: params.guardPk,
    signature: '',
    tx: params.txId
      ? {
          txId: params.txId!,
          chain: params.txChain!,
          txType:
            params.status === EventStatus.inPayment
              ? TxType.payment
              : TxType.reward,
          txStatus: params.txStatus!,
        }
      : undefined,
  };

  return axios.post(
    `${apiBaseUrl}/api/v1/status/submit`,
    await signDTO(dto, secret),
  );
};
