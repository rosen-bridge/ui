import { In } from 'typeorm';

import { EventStatus, TxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { GuardStatusChangedEntity } from '../entities/GuardStatusChangedEntity';

export const GuardStatusChangedRepository = dataSource
  .getRepository(GuardStatusChangedEntity)
  .extend({
    /**
     * retrieves the most recent GuardStatusChangedEntity for a given eventId and guardPk
     * @param eventId
     * @param guardPk
     * @returns a promise resolving to the most recent GuardStatusChangedEntity or null if no matching entity is found
     */
    async getLast(
      eventId: string,
      guardPk: string,
    ): Promise<GuardStatusChangedEntity | null> {
      return this.findOne({
        where: { eventId, guardPk },
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    },

    /**
     * retrieves multiple GuardStatusChangedEntity objects for a given eventId and guardPks array (timeline)
     * empty guardPks will be ignored from filter
     * @param eventId
     * @param guardPks
     * @returns a promise that resolves to an array of GuardStatusChangedEntity objects
     */
    async getMany(
      eventId: string,
      guardPks: string[],
    ): Promise<GuardStatusChangedEntity[]> {
      const whereClause =
        guardPks.length > 0 ? { eventId, guardPk: In(guardPks) } : { eventId };

      return this.find({
        where: whereClause,
        relations: ['tx'],
        order: { insertedAt: 'DESC' },
      });
    },

    /**
     * inserts an GuardStatusChangedEntity into database if it differs from its last value
     * @param eventId
     * @param guardPk
     * @param insertedAt
     * @param status
     * @param tx
     * @returns a promise that resolves to void
     */
    async insertOne(
      eventId: string,
      guardPk: string,
      insertedAt: number,
      status: EventStatus,
      tx?: {
        txId: string;
        chain: string;
        txStatus: TxStatus;
      },
    ): Promise<void> {
      const lastValue = await this.getLast(eventId, guardPk);

      if (
        lastValue &&
        status === lastValue.status &&
        tx?.txId === lastValue.tx?.txId &&
        tx?.chain === lastValue.tx?.chain &&
        tx?.txStatus === (lastValue.txStatus ?? undefined)
      ) {
        throw new Error('guard_status_not_changed');
      }

      await this.insert({
        eventId,
        guardPk,
        insertedAt,
        status,
        tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
        txStatus: tx?.txStatus ?? null,
      });
    },
  });
