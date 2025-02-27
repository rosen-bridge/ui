import { DataSource, Repository } from 'typeorm';

import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
  TxType,
} from '../constants';
import { GuardStatusChangedEntity } from './entities/GuardStatusChangedEntity';
import { OverallStatusChangedEntity } from './entities/OverallStatusChangedEntity';
import { TxEntity } from './entities/TxEntity';

/**
 * methods that operate on a single entity belong here
 */
export class EventStatusActor {
  private static instance: EventStatusActor;
  dataSource: DataSource;
  overallStatusChangedRepository: Repository<OverallStatusChangedEntity>;
  guardStatusChangedRepository: Repository<GuardStatusChangedEntity>;
  txRepository: Repository<TxEntity>;

  protected constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.overallStatusChangedRepository = this.dataSource.getRepository(
      OverallStatusChangedEntity,
    );
    this.guardStatusChangedRepository = this.dataSource.getRepository(
      GuardStatusChangedEntity,
    );
    this.txRepository = this.dataSource.getRepository(TxEntity);
  }

  /**
   * inits EventStatusActor
   * @param dataSource
   * @returns EventStatusActor instance
   */
  static init = (dataSource: DataSource): EventStatusActor => {
    EventStatusActor.instance = new EventStatusActor(dataSource);
    return EventStatusActor.instance;
  };

  /**
   * gets the instance of EventStatusActor (throws error if it doesn't exist)
   * @returns EventStatusActor instance
   */
  static getInstance = (): EventStatusActor => {
    if (!EventStatusActor.instance)
      throw Error(`EventStatusActor is not instantiated yet`);
    return EventStatusActor.instance;
  };

  /**
   * inserts an OverallStatusChangedEntity into database if it differs from its last value
   * @param insertedAt
   * @param eventId
   * @param status
   * @param txId
   * @param txStatus
   * @returns promise of void
   */
  insertOverallStatus = async (
    insertedAt: number,
    eventId: string,
    status: AggregateEventStatus,
    txId?: string,
    txStatus?: AggregateTxStatus,
  ): Promise<void> => {
    const lastValue = await this.getLastOverallStatus(eventId);

    if (
      lastValue &&
      status === lastValue.status &&
      txId === lastValue.tx?.txId &&
      txStatus === (lastValue.txStatus ?? undefined)
    ) {
      return;
    }

    await this.overallStatusChangedRepository.insert({
      insertedAt,
      eventId,
      status,
      tx: txId ? { txId } : undefined,
      txStatus,
    });
  };

  /**
   * gets last OverallStatusChangedEntity by eventId
   * @param eventId
   * @returns promise of OverallStatusChangedEntity or null
   */
  getLastOverallStatus = async (
    eventId: string,
  ): Promise<OverallStatusChangedEntity | null> => {
    return await this.overallStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getOne();
  };

  /**
   * gets all OverallStatusChangedEntity records (timeline) by eventId
   * @param eventId
   * @returns promise of OverallStatusChangedEntity array
   */
  getOverallStatusTimeline = async (
    eventId: string,
  ): Promise<OverallStatusChangedEntity[]> => {
    return await this.overallStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  /**
   * gets array of last OverallStatusChangedEntity by eventIds
   * @param eventIds
   * @returns promise of OverallStatusChangedEntity array
   */
  getLastOverallStatusesByEventIds = async (
    eventIds: string[],
  ): Promise<OverallStatusChangedEntity[]> => {
    return await this.overallStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId IN (:...eventIds)', {
        eventIds,
      })
      .orderBy('record.eventId', 'ASC')
      .distinctOn(['record.eventId'])
      .addOrderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  /**
   * inserts a GuardStatusChangedEntity into database if it differs from its last value
   * @param insertedAt
   * @param guardPk
   * @param eventId
   * @param status
   * @param txId
   * @param txStatus
   * @returns promise of void
   */
  insertGuardStatus = async (
    insertedAt: number,
    guardPk: string,
    eventId: string,
    status: EventStatus,
    txId?: string,
    txStatus?: TxStatus,
  ): Promise<void> => {
    const lastValue = await this.getLastGuardStatus(eventId, guardPk);

    if (
      lastValue &&
      status === lastValue.status &&
      txId === lastValue.tx?.txId &&
      txStatus === (lastValue.txStatus ?? undefined)
    ) {
      return;
    }

    await this.guardStatusChangedRepository.insert({
      insertedAt,
      guardPk,
      eventId,
      status,
      tx: txId ? { txId } : undefined,
      txStatus,
    });
  };

  /**
   * gets last GuardStatusChangedEntity by eventId and guardPk
   * @param eventId
   * @param guardPk
   * @returns promise of GuardStatusChangedEntity or null
   */
  getLastGuardStatus = async (
    eventId: string,
    guardPk: string,
  ): Promise<GuardStatusChangedEntity | null> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId = :eventId AND record.guardPk = :guardPk', {
        eventId,
        guardPk,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getOne();
  };

  /**
   * gets all GuardStatusChangedEntity records (timeline) by eventId and guardPks
   * @param eventId
   * @param guardPks
   * @returns promise of GuardStatusChangedEntity array
   */
  getGuardStatusTimeline = async (
    eventId: string,
    guardPks: string[],
  ): Promise<GuardStatusChangedEntity[]> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId = :eventId AND record.guardPk IN (:...guardPks)', {
        eventId,
        guardPks,
      })
      .orderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  /**
   * gets last GuardStatusChangedEntity records by eventId distinctOn guardPk
   * @param eventId
   * @returns promise of GuardStatusChangedEntity array
   */
  getGuardsLastStatus = async (
    eventId: string,
  ): Promise<GuardStatusChangedEntity[]> => {
    return await this.guardStatusChangedRepository
      .createQueryBuilder('record')
      .leftJoinAndSelect('record.tx', 'tx')
      .where('record.eventId = :eventId', {
        eventId,
      })
      .orderBy('record.guardPk', 'DESC')
      .distinctOn(['record.guardPk'])
      .addOrderBy('record.insertedAt', 'DESC')
      .getMany();
  };

  /**
   * inserts a TxEntity into database if it doesn't already exist
   * @param txId
   * @param eventId
   * @param insertedAt
   * @param txType
   * @returns promise of void
   */
  insertTx = async (
    txId: string,
    eventId: string,
    insertedAt: number,
    txType: TxType,
  ): Promise<void> => {
    const exists = await this.txRepository.findOneBy({
      txId,
    });
    if (exists) return;

    await this.txRepository.insert({
      txId,
      eventId,
      insertedAt,
      txType,
    });
  };
}
