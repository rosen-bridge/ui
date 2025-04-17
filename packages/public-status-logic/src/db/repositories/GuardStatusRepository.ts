import { DataSource } from '@rosen-bridge/extended-typeorm';
import { In } from 'typeorm';

import { EventStatus, TxStatus } from '../../constants';
import { GuardStatusEntity } from '../entities/GuardStatusEntity';

export const createGuardStatusRepository = (dataSource: DataSource) => {
  return dataSource.getRepository(GuardStatusEntity).extend({
    /**
     * retrieves one GuardStatusEntity matching the specified eventId and guardPk
     * @param eventId
     * @param guardPk
     * @returns a promise that resolves to an GuardStatusEntity or null if no matching entity is found
     */
    async getOne(
      eventId: string,
      guardPk: string,
    ): Promise<GuardStatusEntity | null> {
      return this.findOne({
        where: { eventId, guardPk },
        relations: ['tx'],
      });
    },

    /**
     * retrieves multiple GuardStatusEntity objects for a given eventId and guardPks array
     * empty guardPks will be ignored from filter
     * @param eventId
     * @param guardPks
     * @returns a promise that resolves to an array of GuardStatusEntity objects
     */
    async getMany(
      eventId: string,
      guardPks: string[],
    ): Promise<GuardStatusEntity[]> {
      const whereClause =
        guardPks.length > 0 ? { eventId, guardPk: In(guardPks) } : { eventId };

      return this.find({
        where: whereClause,
        relations: ['tx'],
        order: { updatedAt: 'DESC' },
      });
    },

    /**
     * upserts an GuardStatusEntity into database if it differs from its stored value
     * @param eventId
     * @param guardPk
     * @param updatedAt
     * @param status
     * @param tx
     * @returns a promise that resolves to void
     */
    async upsertOne(
      eventId: string,
      guardPk: string,
      updatedAt: number,
      status: EventStatus,
      tx?: {
        txId: string;
        chain: string;
        txStatus: TxStatus;
      },
    ): Promise<void> {
      const storedValue = await this.getOne(eventId, guardPk);

      if (
        storedValue &&
        status === storedValue.status &&
        tx?.txId === storedValue.tx?.txId &&
        tx?.chain === storedValue.tx?.chain &&
        tx?.txStatus === (storedValue.txStatus ?? undefined)
      ) {
        return;
      }

      await this.upsert(
        [
          {
            eventId,
            guardPk,
            updatedAt,
            status,
            tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
            txStatus: tx?.txStatus ?? null,
          },
        ],
        ['eventId', 'guardPk'],
      );
    },
  });
};

export type GuardStatusRepository = ReturnType<
  typeof createGuardStatusRepository
>;
