import { EventStatus, TxStatus } from '../../constants';
import { dataSource } from '../dataSource';
import { GuardStatusEntity } from '../entities/GuardStatusEntity';

export const GuardStatusRepository = dataSource
  .getRepository(GuardStatusEntity)
  .extend({
    /**
     * gets one GuardStatusEntity
     * @param eventId
     * @param guardPk
     * @returns promise of GuardStatusEntity or null
     */
    async getOne(
      eventId: string,
      guardPk: string,
    ): Promise<GuardStatusEntity | null> {
      return await this.createQueryBuilder('record')
        .leftJoinAndSelect('record.tx', 'tx')
        .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
          eventId,
          guardPk,
        })
        .getOne();
    },

    /**
     * gets array of GuardStatusEntity records
     * empty guardPks will be ignored
     * @param eventId
     * @param guardPks
     * @returns promise of GuardStatusEntity array
     */
    async getMany(
      eventId: string,
      guardPks: string[],
    ): Promise<GuardStatusEntity[]> {
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

      return await query.orderBy('record.updatedAt', 'DESC').getMany();
    },

    /**
     * upserts an GuardStatusEntity into database if it differs from its stored value
     * @param eventId
     * @param guardPk
     * @param updatedAt
     * @param status
     * @param txId
     * @param txStatus
     * @returns promise of void
     */
    async upsertOne(
      eventId: string,
      guardPk: string,
      updatedAt: number,
      status: EventStatus,
      txId?: string,
      txStatus?: TxStatus,
    ): Promise<void> {
      const storedValue = await this.getOne(eventId, guardPk);

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
            guardPk,
            updatedAt,
            status,
            tx: txId ? { txId } : undefined,
            txStatus,
          },
        ],
        ['eventId', 'guardPk'],
      );
    },
  });
