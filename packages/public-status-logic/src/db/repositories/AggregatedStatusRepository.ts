import { In } from 'typeorm';

import { AggregateEventStatus, AggregateTxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { AggregatedStatusEntity } from '../entities/AggregatedStatusEntity';

export const AggregatedStatusRepository = dataSource
  .getRepository(AggregatedStatusEntity)
  .extend({
    /**
     * retrieves one AggregatedStatusEntity matching the specified eventId
     * @param eventId
     * @returns a promise that resolves to an AggregatedStatusEntity or null if no matching entity is found
     */
    async getOne(eventId: string): Promise<AggregatedStatusEntity | null> {
      return this.findOne({
        where: { eventId },
        relations: ['tx'],
      });
    },

    /**
     * retrieves multiple AggregatedStatusEntity objects for the given eventIds array
     * @param eventIds
     * @returns a promise that resolves to an array of AggregatedStatusEntity objects
     */
    async getMany(eventIds: string[]): Promise<AggregatedStatusEntity[]> {
      return this.find({
        where: { eventId: In(eventIds) },
        relations: ['tx'],
        order: { eventId: 'ASC' },
      });
    },

    /**
     * upserts an AggregatedStatusEntity into database if it differs from its stored value
     * @param eventId
     * @param updatedAt
     * @param status
     * @param txStatus
     * @param tx
     * @returns a promise that resolves to void
     */
    async upsertOne(
      eventId: string,
      updatedAt: number,
      status: AggregateEventStatus,
      txStatus: AggregateTxStatus,
      tx?: {
        txId: string;
        chain: string;
      },
    ): Promise<void> {
      const storedValue = await this.getOne(eventId);

      if (
        storedValue &&
        status === storedValue.status &&
        txStatus === storedValue.txStatus &&
        tx?.txId === storedValue.tx?.txId &&
        tx?.chain === storedValue.tx?.chain
      ) {
        return;
      }

      await this.upsert(
        [
          {
            eventId,
            updatedAt,
            status,
            txStatus,
            tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
          },
        ],
        ['eventId'],
      );
    },
  });
