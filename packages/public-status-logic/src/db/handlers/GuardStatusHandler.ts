import { In, Repository } from 'typeorm';

import { EventStatus, TxStatus } from '../../constants';
import { GuardStatusEntity } from '../entities/GuardStatusEntity';

class GuardStatusHandler {
  private static instance?: GuardStatusHandler;

  protected constructor() {}

  /**
   * generates a GuardStatusHandler object if it doesn't exist
   * @returns GuardStatusHandler instance
   */
  public static getInstance = () => {
    if (!GuardStatusHandler.instance) {
      GuardStatusHandler.instance = new GuardStatusHandler();
    }
    return GuardStatusHandler.instance;
  };

  /**
   * retrieves one GuardStatusEntity matching the specified eventId and guardPk
   * @param eventId
   * @param guardPk
   * @returns a promise that resolves to an GuardStatusEntity or null if no matching entity is found
   */
  getOne = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    guardPk: string,
  ): Promise<GuardStatusEntity | null> => {
    return repository.findOne({
      where: { eventId, guardPk },
      relations: ['tx'],
    });
  };

  /**
   * retrieves multiple GuardStatusEntity objects for a given eventId and guardPks array
   * empty guardPks will be ignored from filter
   * @param eventId
   * @param guardPks
   * @returns a promise that resolves to an array of GuardStatusEntity objects
   */
  getMany = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusEntity[]> => {
    const whereClause =
      guardPks.length > 0 ? { eventId, guardPk: In(guardPks) } : { eventId };

    return repository.find({
      where: whereClause,
      relations: ['tx'],
      order: { updatedAt: 'DESC' },
    });
  };

  /**
   * upserts an GuardStatusEntity into database if it differs from its stored value
   * @param eventId
   * @param guardPk
   * @param updatedAt
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  upsertOne = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    guardPk: string,
    updatedAt: number,
    status: EventStatus,
    tx?: {
      txId: string;
      chain: string;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    const storedValue = await this.getOne(repository, eventId, guardPk);

    if (
      storedValue &&
      status === storedValue.status &&
      tx?.txId === storedValue.tx?.txId &&
      tx?.chain === storedValue.tx?.chain &&
      tx?.txStatus === (storedValue.txStatus ?? undefined)
    ) {
      return;
    }

    await repository.upsert(
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
  };
}

export default GuardStatusHandler;
