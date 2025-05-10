import { EventStatus, TxStatus } from '../src/constants';
import { GuardStatusEntity } from '../src/db/entities/GuardStatusEntity';
import { guardPk0, tx0 } from './testData';

class TestUtils {
  /**
   * increments a hex string by a number
   * @param hexStr
   * @param byNumber
   * @returns hex string
   */
  static incrementHex = (hexStr: string, byNumber: number = 1): string => {
    const normalizedHex = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
    const number = BigInt(`0x${normalizedHex}`);
    const incremented = number + BigInt(byNumber);
    return incremented.toString(16);
  };

  /**
   * factory function for GuardStatusEntity
   * @param index
   * @param status
   * @param txStatus
   * @returns a GuardStatusEntity object
   */
  static makeStatus = (
    index: number,
    status: EventStatus,
    txStatus?: TxStatus,
  ): GuardStatusEntity => ({
    eventId: '',
    guardPk: TestUtils.incrementHex(guardPk0, index),
    updatedAt: 0,
    status,
    tx: txStatus ? tx0 : null,
    txStatus: txStatus ?? null,
  });
}

export default TestUtils;
