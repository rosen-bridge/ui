import { In, Repository } from '@rosen-bridge/extended-typeorm';
import {
  EventStatus,
  TxStatus,
  GuardStatusChangedEntity,
} from '@rosen-ui/public-status';

class GuardStatusChangedAction {
  private static instance?: GuardStatusChangedAction;

  protected constructor() {}

  /**
   * initialize GuardStatusChangedAction
   */
  static init = () => {
    GuardStatusChangedAction.instance = new GuardStatusChangedAction();
  };

  /**
   * get GuardStatusChangedAction instance or throw
   * @returns GuardStatusChangedAction instance
   */
  static getInstance = () => {
    if (!GuardStatusChangedAction.instance)
      throw Error(
        `GuardStatusChangedAction should have been initialized before getInstance`,
      );
    return GuardStatusChangedAction.instance;
  };

  /**
   * retrieves the most recent GuardStatusChangedEntity for a given eventId and guardPk
   * @param repository
   * @param eventId
   * @param guardPk
   * @returns a promise resolving to the most recent GuardStatusChangedEntity or null if no matching entity is found
   */
  getLast = async (
    repository: Repository<GuardStatusChangedEntity>,
    eventId: string,
    guardPk: string,
  ): Promise<GuardStatusChangedEntity | null> => {
    return repository.findOne({
      where: { eventId, guardPk },
      relations: ['tx'],
      order: { insertedAt: 'DESC' },
    });
  };

  /**
   * retrieves multiple GuardStatusChangedEntity objects for a given eventId and guardPks array (timeline)
   * empty guardPks will be ignored from filter
   * @param repository
   * @param eventId
   * @param guardPks
   * @param skip
   * @param take
   * @returns a promise that resolves to an array of GuardStatusChangedEntity objects
   */
  getMany = async (
    repository: Repository<GuardStatusChangedEntity>,
    eventId: string,
    guardPks: string[],
    skip: number,
    take: number,
  ): Promise<GuardStatusChangedEntity[]> => {
    const whereClause =
      guardPks.length > 0 ? { eventId, guardPk: In(guardPks) } : { eventId };

    return repository.find({
      where: whereClause,
      relations: ['tx'],
      order: { insertedAt: 'DESC' },
      skip,
      take,
    });
  };

  /**
   * inserts an GuardStatusChangedEntity into database if it differs from its last value
   * @param repository
   * @param eventId
   * @param guardPk
   * @param insertedAt
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  insertOne = async (
    repository: Repository<GuardStatusChangedEntity>,
    eventId: string,
    guardPk: string,
    insertedAt: number,
    status: EventStatus,
    tx?: {
      txId: string;
      chain: string;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    const lastValue = await this.getLast(repository, eventId, guardPk);

    if (
      lastValue &&
      status === lastValue.status &&
      tx?.txId === lastValue.tx?.txId &&
      tx?.chain === lastValue.tx?.chain &&
      tx?.txStatus === (lastValue.txStatus ?? undefined)
    ) {
      throw new Error('guard_status_not_changed');
    }

    await repository.insert({
      eventId,
      guardPk,
      insertedAt,
      status,
      tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
      txStatus: tx?.txStatus ?? null,
    });
  };
}

export default GuardStatusChangedAction;
