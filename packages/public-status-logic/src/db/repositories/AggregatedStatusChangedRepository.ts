import { AggregateEventStatus, AggregateTxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { AggregatedStatusChangedEntity } from '../entities/AggregatedStatusChangedEntity';

export const AggregatedStatusChangedRepository = dataSource
  .getRepository(AggregatedStatusChangedEntity)
  .extend({
    /**
     * gets last AggregatedStatusChangedEntity
     * @param eventId
     * @returns promise of AggregatedStatusChangedEntity or null
     */
    async getLast(
      eventId: string,
    ): Promise<AggregatedStatusChangedEntity | null> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId,
        })
        .orderBy('record.insertedAt', 'DESC')
        .getOne();
    },

    /**
     * gets array of AggregatedStatusChangedEntity (timeline)
     * @param eventId
     * @returns promise of AggregatedStatusChangedEntity array
     */
    async getMany(eventId: string): Promise<AggregatedStatusChangedEntity[]> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId,
        })
        .orderBy('record.insertedAt', 'DESC')
        .getMany();
    },

    /**
     * inserts an AggregatedStatusChangedEntity into database if it differs from its last value
     * @param eventId
     * @param insertedAt
     * @param status
     * @param txId
     * @param txStatus
     * @returns promise of void
     */
    async insertOne(
      eventId: string,
      insertedAt: number,
      status: AggregateEventStatus,
      txId?: string,
      txStatus?: AggregateTxStatus,
    ): Promise<void> {
      const lastValue = await this.getLast(eventId);

      if (
        lastValue &&
        status === lastValue.status &&
        txId === lastValue.tx?.txId &&
        txStatus === (lastValue.txStatus ?? undefined)
      ) {
        return;
      }

      await this.insert({
        eventId,
        insertedAt,
        status,
        tx: txId ? { txId } : undefined,
        txStatus,
      });
    },
  });
