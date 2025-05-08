import { EventStatus, TxStatus } from '../src/constants';
import { GuardStatusEntity } from '../src/db/entities/GuardStatusEntity';
import { TxEntity } from '../src/db/entities/TxEntity';
import { guardPk0, id0 } from './testData';

class TestUtils {
  static incrementHex = (hexStr: string, byNumber: bigint = 1n): string => {
    const normalizedHex = hexStr.startsWith('0x') ? hexStr.slice(2) : hexStr;
    const number = BigInt(`0x${normalizedHex}`);
    const incremented = number + byNumber;
    return incremented.toString(16);
  };

  static tx0 = { txId: id0, chain: 'c1' } as unknown as TxEntity;

  static makeStatus = (
    index: number,
    status: EventStatus,
    txStatus?: TxStatus,
  ): GuardStatusEntity => ({
    eventId: '',
    guardPk: TestUtils.incrementHex(guardPk0, BigInt(index)),
    updatedAt: 0,
    status,
    tx: txStatus ? TestUtils.tx0 : null,
    txStatus: txStatus ?? null,
  });
}

export default TestUtils;
