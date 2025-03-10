import { AggregateEventStatus, AggregateTxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { AggregatedStatusEntity } from '../entities/AggregatedStatusEntity';

export const AggregatedStatusRepository = dataSource
  .getRepository(AggregatedStatusEntity)
  .extend({
    /**
     * gets one AggregatedStatusEntity
     * @param eventId
     * @returns promise of AggregatedStatusEntity or null
     */
    async getOne(eventId: string): Promise<AggregatedStatusEntity | null> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId,
        })
        .getOne();
    },

    /**
     * gets array of AggregatedStatusEntity
     * @param eventIds
     * @returns promise of AggregatedStatusEntity array
     */
    async getMany(eventIds: string[]): Promise<AggregatedStatusEntity[]> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId IN (:...eventIds)', {
          eventIds,
        })
        .orderBy('record.eventId', 'ASC')
        .getMany();
    },

    /**
     * upserts an AggregatedStatusEntity into database if it differs from its stored value
     * @param eventId
     * @param updatedAt
     * @param status
     * @param txId
     * @param txStatus
     * @returns promise of void
     */
    async upsertOne(
      eventId: string,
      updatedAt: number,
      status: AggregateEventStatus,
      txId?: string,
      txStatus?: AggregateTxStatus,
    ): Promise<void> {
      const storedValue = await this.getOne(eventId);

      if (
        storedValue &&
        status === storedValue.status &&
        txId === storedValue.tx?.txId &&
        txStatus === (storedValue.txStatus ?? undefined)
      ) {
        return;
      }

      await this.upsert(
        [
          {
            eventId,
            updatedAt,
            status,
            tx: txId ? { txId } : undefined,
            txStatus,
          },
        ],
        ['eventId'],
      );
    },
  });
