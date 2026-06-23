import { In, Repository } from '@rosen-bridge/extended-typeorm';
import {
  EventStatus,
  TxStatus,
  GuardStatusEntity,
} from '@rosen-ui/public-status';

class GuardStatusAction {
  private static instance?: GuardStatusAction;

  protected constructor() {}

  /**
   * initialize GuardStatusAction
   */
  static init = () => {
    GuardStatusAction.instance = new GuardStatusAction();
  };

  /**
   * get GuardStatusAction instance or throw
   * @returns GuardStatusAction instance
   */
  static getInstance = () => {
    if (!GuardStatusAction.instance)
      throw Error(
        `GuardStatusAction should have been initialized before getInstance`,
      );
    return GuardStatusAction.instance;
  };

  /**
   * retrieves one GuardStatusEntity matching the specified eventId, triggerTxId, and guardPk
   * @param repository
   * @param eventId
   * @param triggerTxId
   * @param guardPk
   * @returns a promise that resolves to an GuardStatusEntity or null if no matching entity is found
   */
  getOne = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    triggerTxId: string,
    guardPk: string,
  ): Promise<GuardStatusEntity | null> => {
    return repository.findOne({
      where: { eventId, triggerTxId, guardPk },
      relations: ['tx'],
    });
  };

  /**
   * retrieves multiple GuardStatusEntity objects for a given eventId, triggerTxId and guardPks array
   * empty guardPks will be ignored from filter
   * @param repository
   * @param eventId
   * @param triggerTxId
   * @param guardPks
   * @param offset
   * @param limit
   * @returns a promise that resolves to an array of GuardStatusEntity objects
   */
  getMany = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    triggerTxId: string,
    guardPks: string[],
    offset?: number,
    limit?: number,
  ): Promise<{ total: number; items: GuardStatusEntity[] }> => {
    const whereClause =
      guardPks.length > 0
        ? { eventId, triggerTxId, guardPk: In(guardPks) }
        : { eventId, triggerTxId };

    const [items, total] = await repository.findAndCount({
      where: whereClause,
      relations: ['tx'],
      order: { eventId: 'ASC' },
      ...(Number.isFinite(offset) ? { skip: offset } : {}),
      ...(Number.isFinite(limit) ? { take: limit } : {}),
    });

    return {
      items,
      total,
    };
  };

  /**
   * upserts an GuardStatusEntity into database if it differs from its stored value
   * @param repository
   * @param eventId
   * @param triggerTxId
   * @param guardPk
   * @param updatedAt
   * @param status
   * @param tx
   * @returns a promise that resolves to void
   */
  upsertOne = async (
    repository: Repository<GuardStatusEntity>,
    eventId: string,
    triggerTxId: string,
    guardPk: string,
    updatedAt: number,
    status: EventStatus,
    tx?: {
      txId: string;
      chain: string;
      txStatus: TxStatus;
    },
  ): Promise<void> => {
    const storedValue = await this.getOne(
      repository,
      eventId,
      triggerTxId,
      guardPk,
    );

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
          triggerTxId,
          guardPk,
          updatedAt,
          status,
          tx: tx ? { txId: tx.txId, chain: tx.chain } : null,
          txStatus: tx?.txStatus ?? null,
        },
      ],
      ['eventId', 'triggerTxId', 'guardPk'],
    );
  };
}

export default GuardStatusAction;
