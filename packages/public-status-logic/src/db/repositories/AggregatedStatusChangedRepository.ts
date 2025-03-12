import { AggregateEventStatus, AggregateTxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { AggregatedStatusChangedEntity } from '../entities/AggregatedStatusChangedEntity';

export const AggregatedStatusChangedRepository = dataSource
  .getRepository(AggregatedStatusChangedEntity)
  .extend({
    /**
     * retrieves the most recent AggregatedStatusChangedEntity for a given eventId
     * @param eventId
     * @returns a promise resolving to the most recent AggregatedStatusChangedEntity or null if no matching entity is found
     */
    async getLast(
      eventId: string,
    ): Promise<AggregatedStatusChangedEntity | null> {
      return this.findOne({
        where: { eventId },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    },

    /**
     * retrieves multiple AggregatedStatusChangedEntity objects for a given eventId (timeline)
     * @param eventId
     * @returns a promise that resolves to an array of AggregatedStatusChangedEntity objects
     */
    async getMany(eventId: string): Promise<AggregatedStatusChangedEntity[]> {
      return this.find({
        where: { eventId },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    },

    /**
     * inserts a single AggregatedStatusChangedEntity record if it differs in status or transaction
     * information from its last value
     * @param eventId
     * @param insertedAt
     * @param status
     * @param txStatus
     * @param tx
     * @returns a promise that resolves to void
     */
    async insertOne(
      eventId: string,
      insertedAt: number,
      status: AggregateEventStatus,
      txStatus: AggregateTxStatus,
      tx?: {
        txId: string;
        chain: string;
      },
    ): Promise<void> {
      const lastValue = await this.getLast(eventId);

      if (
        lastValue &&
        status === lastValue.status &&
        txStatus === lastValue.txStatus &&
        tx?.txId === lastValue.tx?.txId &&
        tx?.chain === lastValue.tx?.chain
      ) {
        return;
      }

      await this.insert({
        eventId,
        insertedAt,
        status,
        txStatus,
        tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
      });
    },
  });
