import {
  EventStatus,
  TxStatus,
  TxType,
} from '@rosen-bridge/public-status-logic';
import { describe, expect, it } from 'vitest';

import { paramsToSignMessage } from '../../../app/api/status/utils';
import { Params } from '../../../app/api/status/validator';
import { id0, id1, mockChain } from './testData';

describe('paramsToSignMessage', () => {
  /**
   * @target paramsToSignMessage should return a sign message without tx information when params.tx field is undefined
   * @dependencies
   * @scenario
   * - define a mock Params object
   * - call paramsToSignMessage with the params
   * @expected
   * - should have returned the string sign message
   */
  it('should return a sign message without tx information when params.tx field is undefined', async () => {
    // arrange
    const date = new Date(0);
    const tsSeconds = Math.floor(date.valueOf() / 1000);

    const params: Params = {
      date,
      eventId: id0,
      status: EventStatus.inPayment,
      pk: '',
      signature: '',
      tx: undefined,
    };

    // act
    const result = paramsToSignMessage(params, tsSeconds);

    // assert
    expect(result).toBe(`${params.eventId}${params.status}${tsSeconds}`);
  });

  /**
   * @target paramsToSignMessage should return a sign message with tx information when params contains a tx
   * @dependencies
   * @scenario
   * - define a mock Params object
   * - call paramsToSignMessage with the params
   * @expected
   * - should have returned the string sign message also containing the tx info
   */
  it('should return a sign message with tx information when params contains a tx', async () => {
    // arrange
    const date = new Date(0);
    const tsSeconds = Math.floor(date.valueOf() / 1000);

    const params: Params = {
      date,
      eventId: id0,
      status: EventStatus.inPayment,
      pk: '',
      signature: '',
      tx: {
        txId: id1,
        chain: mockChain,
        txType: TxType.payment,
        txStatus: TxStatus.approved,
      },
    };

    // act
    const result = paramsToSignMessage(params, tsSeconds);

    // assert
    expect(result).toBe(
      `${params.eventId}${params.status}${params.tx!.txId}${params.tx!.chain}${
        params.tx!.txType
      }${params.tx!.txStatus}${tsSeconds}`,
    );
  });
});
