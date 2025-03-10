import { TxType } from '../../constants';
import { dataSource } from '../dataSource';
import { TxEntity } from '../entities/TxEntity';

export const TxRepository = dataSource.getRepository(TxEntity).extend({
  /**
   * inserts a TxEntity into database if it doesn't already exist
   * @param txId
   * @param eventId
   * @param insertedAt
   * @param txType
   * @returns promise of void
   */
  async insertOne(
    txId: string,
    eventId: string,
    insertedAt: number,
    txType: TxType,
  ): Promise<void> {
    const exists = await this.findOneBy({
      txId,
    });
    if (exists) return;

    await this.insert({
      txId,
      eventId,
      insertedAt,
      txType,
    });
  },
});
