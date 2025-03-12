import { TxType } from '../../constants';
import { dataSource } from '../dataSource';
import { TxEntity } from '../entities/TxEntity';

export const TxRepository = dataSource.getRepository(TxEntity).extend({
  /**
   * inserts a TxEntity into database if it doesn't already exist
   * @param txId
   * @param chain
   * @param eventId
   * @param insertedAt
   * @param txType
   * @returns a promise that resolves to void
   */
  async insertOne(
    txId: string,
    chain: string,
    eventId: string,
    insertedAt: number,
    txType: TxType,
  ): Promise<void> {
    const exists = await this.findOneBy({
      txId,
      chain,
    });
    if (exists) return;

    await this.insert({
      txId,
      chain,
      eventId,
      insertedAt,
      txType,
    });
  },
});
