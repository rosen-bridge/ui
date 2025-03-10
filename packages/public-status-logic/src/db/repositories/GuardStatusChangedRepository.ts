import { EventStatus, TxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { GuardStatusChangedEntity } from '../entities/GuardStatusChangedEntity';

export const GuardStatusChangedRepository = dataSource
  .getRepository(GuardStatusChangedEntity)
  .extend({
    /**
     * gets last GuardStatusChangedEntity
     * @param eventId
     * @param guardPk
     * @returns promise of GuardStatusChangedEntity or null
     */
    async getLast(
      eventId: string,
      guardPk: string,
    ): Promise<GuardStatusChangedEntity | null> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
          eventId,
          guardPk,
        })
        .orderBy('record.insertedAt', 'DESC')
        .getOne();
    },

    /**
     * gets array of GuardStatusChangedEntity (timeline)
     * empty guardPks will be ignored
     * @param eventId
     * @param guardPks
     * @returns promise of GuardStatusChangedEntity array
     */
    async getMany(
      eventId: string,
      guardPks: string[],
    ): Promise<GuardStatusChangedEntity[]> {
      const query = this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId', {
          eventId,
        });

      if (guardPks.length > 0) {
        query.andWhere('record.guardPk IN (:...guardPks)', {
          guardPks,
        });
      }

      return await query.orderBy('record.insertedAt', 'DESC').getMany();
    },

    /**
     * inserts an GuardStatusChangedEntity into database if it differs from its last value
     * @param eventId
     * @param guardPk
     * @param insertedAt
     * @param status
     * @param txId
     * @param txStatus
     * @returns promise of void
     */
    async insertOne(
      eventId: string,
      guardPk: string,
      insertedAt: number,
      status: EventStatus,
      txId?: string,
      txStatus?: TxStatus,
    ): Promise<void> {
      const lastValue = await this.getLast(eventId, guardPk);

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
        guardPk,
        insertedAt,
        status,
        tx: txId ? { txId } : undefined,
        txStatus,
      });
    },
  });
