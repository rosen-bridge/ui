import { GuardStatusEntity, Threshold } from '../src';
import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from '../src/constants';
import { Utils } from '../src/utils';
import {
  guardPk0,
  guardPk1,
  guardPk2,
  guardPk3,
  guardPk4,
  id0,
  mockGuardStatusRecords,
  mockTx0,
} from './testData';

describe('Utils', () => {
  describe('encodeTxStatus', () => {
    /**
     * @target Utils.encodeTxStatus should it should return undefined when tx is missing from guard status
     * @scenario
     * - define a mock GuardStatusEntity object with tx set to undefined
     * - call Utils.encodeTxStatus with the mock object
     * @expected
     * - Utils.encodeTxStatus should have returned undefined
     */
    it('should it should return undefined when tx is missing from guard status', () => {
      // arrange
      const mockGuardStatus: GuardStatusEntity = {
        eventId: id0,
        guardPk: guardPk0,
        updatedAt: 0,
        status: EventStatus.inPayment,
        tx: null,
        txStatus: null,
      };

      // act
      const result = Utils.encodeTxStatus(mockGuardStatus);

      // assert
      expect(result).toBeUndefined();
    });

    /**
     * @target Utils.encodeTxStatus should it should return a formatted string when tx is present
     * @scenario
     * - define a mock GuardStatusEntity object with tx and txStatus values
     * - call Utils.encodeTxStatus with the mock object
     * @expected
     * - Utils.encodeTxStatus should have returned a string in the format '{"txId":"<txId>","chain":"<chain>"}::<aggregatedStatus>'
     */
    it('should it should return a formatted string when tx is present', () => {
      // arrange
      const mockGuardStatus: GuardStatusEntity = {
        eventId: id0,
        guardPk: guardPk0,
        updatedAt: 0,
        status: EventStatus.inPayment,
        tx: mockTx0,
        txStatus: TxStatus.inSign,
      };

      // act
      const result = Utils.encodeTxStatus(mockGuardStatus);

      // assert
      const expectedTxKey = JSON.stringify({
        txId: mockTx0.txId,
        chain: mockTx0.chain,
      });
      expect(result).toBe(`${expectedTxKey}::${TxStatus.inSign}`);
    });
  });

  describe('countSimilar', () => {
    /**
     * @target Utils.countSimilar should return an empty object when provided an empty array
     * @scenario
     * - define a mock array with no items
     * - call Utils.countSimilar with the empty array
     * @expected
     * - Utils.countSimilar should have returned an empty object
     */
    it('should return an empty object when provided an empty array', () => {
      // arrange
      const items: string[] = [];

      // act
      const result = Utils.countSimilar(items);

      // assert
      expect(result).toEqual({});
    });

    /**
     * @target Utils.countSimilar should return a count of one for each distinct element when no duplicates are present
     * @scenario
     * - define a mock array with items 'a', 'b', 'c'
     * - call Utils.countSimilar with the array
     * @expected
     * - Utils.countSimilar should have returned object with keys 'a', 'b', 'c' each equal to 1
     */
    it('should return a count of one for each distinct element when no duplicates are present', () => {
      // arrange
      const items = ['a', 'b', 'c'];

      // act
      const result = Utils.countSimilar(items);

      // assert
      expect(result).toEqual({ a: 1, b: 1, c: 1 });
    });

    /**
     * @target Utils.countSimilar should correctly count each element in a mixed array with duplicates
     * @scenario
     * - define a mock array with items 'aa', 'b', 'aa', 'c', 'b', 'aa'
     * - call Utils.countSimilar with the array
     * @expected
     * - Utils.countSimilar should have returned object with key 'aa' equal to 3, 'b' equal to 2, 'c' equal to 1
     */
    it('should correctly count each element in a mixed array with duplicates', () => {
      // arrange
      const items = ['aa', 'b', 'aa', 'c', 'b', 'aa'];

      // act
      const result = Utils.countSimilar(items);

      // assert
      expect(result).toEqual({ aa: 3, b: 2, c: 1 });
    });
  });

  describe('checkThresholds', () => {
    /**
     * @target Utils.checkThresholds should return the threshold key when the count is greater than the threshold count
     * @scenario
     * - define a mock counts record with key 'a' set to 10
     * - define a mock thresholds array with one threshold having key 'a' and count 5
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned 'a'
     */
    it('should return the threshold key when the count is greater than the threshold count', () => {
      // arrange
      const counts = { a: 10 };
      const thresholds = [{ key: 'a', count: 5 }];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toEqual('a');
    });

    /**
     * @target Utils.checkThresholds should return the threshold key when the count is equal to the threshold count
     * @scenario
     * - define a mock counts record with key 'b' set to 7
     * - define a mock thresholds array with one threshold having key 'b' and count 7
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned 'b'
     */
    it('should return the threshold key when the count is equal to the threshold count', () => {
      // arrange
      const counts = { b: 7 };
      const thresholds = [{ key: 'b', count: 7 }];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toEqual('b');
    });

    /**
     * @target Utils.checkThresholds should return undefined when the count is lower than the threshold count
     * @scenario
     * - define a mock counts record with key 'c' set to 3
     * - define a mock thresholds array with one threshold having key 'c' and count 5
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned undefined
     */
    it('should return undefined when the count is lower than the threshold count', () => {
      // arrange
      const counts = { c: 3 };
      const thresholds = [{ key: 'c', count: 5 }];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toBeUndefined();
    });

    /**
     * @target Utils.checkThresholds should return the first triggered threshold key when multiple thresholds are satisfied
     * @scenario
     * - define a mock counts record with keys 'x' set to 7 and 'y' set to 15
     * - define a mock thresholds array with two thresholds: first with key 'x' and count 8, second with key 'y' and count 12
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned 'y'
     */
    it('should return the first triggered threshold key when multiple thresholds are satisfied', () => {
      // arrange
      const counts = { x: 7, y: 15, z: 8 };
      const thresholds = [
        { key: 'x', count: 8 },
        { key: 'y', count: 12 },
        { key: 'z', count: 5 },
      ];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toEqual('y');
    });

    /**
     * @target Utils.checkThresholds should return undefined when counts record does not include the threshold key
     * @scenario
     * - define a mock counts record with key 'd' set to 0 (or missing key 'e')
     * - define a mock thresholds array with one threshold having key 'e' and count 1
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned undefined
     */
    it('should return undefined when counts record does not include the threshold key', () => {
      // arrange
      const counts = { d: 0 };
      const thresholds = [{ key: 'e', count: 1 }];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toBeUndefined();
    });

    /**
     * @target Utils.checkThresholds should handle multiple thresholds and return undefined if no counts satisfy any thresholds
     * @scenario
     * - define a mock counts record with keys 'm' set to 2 and 'n' set to 3
     * - define a mock thresholds array with two thresholds: one with key 'm' and count 5 and one with key 'n' and count 4
     * - call Utils.checkThresholds with the mock counts and thresholds
     * @expected
     * - Utils.checkThresholds should have returned undefined
     */
    it('should handle multiple thresholds and return undefined if no counts satisfy any thresholds', () => {
      // arrange
      const counts = { m: 2, n: 3 };
      const thresholds = [
        { key: 'm', count: 5 },
        { key: 'n', count: 4 },
      ];

      // act
      const result = Utils.checkThresholds(counts, thresholds);

      // assert
      expect(result).toBeUndefined();
    });
  });

  describe('getAggregatedTxStatus', () => {
    /**
     * @target getAggregatedTxStatus should return undefined when guardStatuses is an empty array
     * @scenario
     * - define a mock guardStatuses as empty array
     * - define a mock thresholds array
     * - call getAggregatedTxStatus
     * @expected
     * - getAggregatedTxStatus should have returned undefined
     */
    it('should return undefined when guardStatuses is an empty array', () => {
      // arrange
      const emptyGuardStatuses: GuardStatusEntity[] = [];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.completed, count: 3 },
      ];

      // act
      const result = Utils.getAggregatedTxStatus(
        emptyGuardStatuses,
        txStatusThresholds,
      );

      // assert
      expect(result).toBeUndefined();
    });

    /**
     * @target getAggregatedTxStatus should return undefined when none of the statuses trigger the thresholds
     * @scenario
     * - define a mock guardStatuses array with multiple elements
     * - define a mock thresholds array
     * - call getAggregatedTxStatus
     * @expected
     * - getAggregatedTxStatus should have returned undefined
     */
    it('should return undefined when none of the statuses trigger the thresholds', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [...mockGuardStatusRecords];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.completed, count: 3 },
      ];

      // act
      const result = Utils.getAggregatedTxStatus(
        guardStatuses,
        txStatusThresholds,
      );

      // assert
      expect(result).toBeUndefined();
    });

    /**
     * @target getAggregatedTxStatus should return the first triggered tx status when multiple statuses trigger thresholds
     * @scenario
     * - define a mock guardStatuses array with multiple elements mapping to different tx statuses, e.g. some 'id::statusA' and some 'id::statusB'
     * - define a mock thresholds array
     * - call getAggregatedTxStatus
     * @expected
     * - getAggregatedTxStatus should have returned the tx status corresponding to the first threshold triggered in the iteration order
     */
    it('should return the first triggered tx status when multiple statuses trigger thresholds', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [
        ...mockGuardStatusRecords,
        { ...mockGuardStatusRecords[1], guardPk: guardPk1 },
        { ...mockGuardStatusRecords[1], guardPk: guardPk2 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 6 },
        { key: AggregateTxStatus.signed, count: 3 },
        { key: AggregateTxStatus.completed, count: 3 },
      ];

      // act
      const result = Utils.getAggregatedTxStatus(
        guardStatuses,
        txStatusThresholds,
      );

      // assert
      expect(result).toBe(
        '{"txId":"0000000000000000000000000000000000000000000000000000000000000001","chain":"c1"}::signed',
      );
    });
  });

  describe('calcAggregatedStatus', () => {
    /**
     * @target Utils.calcAggregatedStatus should return default aggregated status when statuses array is empty
     * @scenario
     * - define a mock guardStatuses array with zero elements
     * - define a mock eventStatusThresholds with any valid thresholds
     * - define a mock txStatusThresholds with any valid thresholds
     * - call Utils.calcAggregatedStatus
     * @expected
     * - Utils.calcAggregatedStatus should have returned an object with status = waitingForConfirmation, tx & txStatus = undefined
     */
    it('should return default aggregated status when statuses array is empty', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [];
      const eventStatusThresholds: Threshold<AggregateEventStatus>[] = [
        { key: AggregateEventStatus.inPayment, count: 5 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 5 },
      ];

      // act
      const result = Utils.calcAggregatedStatus(
        guardStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.waitingForConfirmation,
        tx: undefined,
        txStatus: undefined,
      });
    });

    /**
     * @target Utils.calcAggregatedStatus should return default aggregated status when event status counts are lower than thresholds
     * @scenario
     * - define a mock guardStatuses array with at least one record
     * - define a mock eventStatusThresholds with valid thresholds
     * - define a mock txStatusThresholds with valid thresholds
     * - call Utils.calcAggregatedStatus
     * @expected
     * - Utils.calcAggregatedStatus should have returned an object with status = waitingForConfirmation, tx & txStatus = undefined
     */
    it('should return default aggregated status when event status counts are lower than thresholds', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = mockGuardStatusRecords;
      const eventStatusThresholds: Threshold<AggregateEventStatus>[] = [
        { key: AggregateEventStatus.inPayment, count: 5 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 5 },
      ];

      // act
      const result = Utils.calcAggregatedStatus(
        guardStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.waitingForConfirmation,
        tx: undefined,
        txStatus: undefined,
      });
    });

    /**
     * @target Utils.calcAggregatedStatus should return aggregated status with updated event status and no tx details when aggregated event status is not inPayment or inReward
     * @scenario
     * - define a mock guardStatuses array with enough records to trigger 'finished' aggregated event status
     * - define a mock eventStatusThresholds with valid thresholds
     * - define a mock txStatusThresholds with valid thresholds
     * - call Utils.calcAggregatedStatus
     * @expected
     * - Utils.calcAggregatedStatus should have returned an object with status = mock event status, tx & txStatus = undefined
     */
    it('should return aggregated status with updated event status and no tx details when aggregated event status is not inPayment or inReward', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [
        ...mockGuardStatusRecords,
        {
          ...mockGuardStatusRecords[0],
          guardPk: guardPk1,
          status: EventStatus.completed,
        },
        {
          ...mockGuardStatusRecords[0],
          guardPk: guardPk2,
          status: EventStatus.completed,
        },
        {
          ...mockGuardStatusRecords[0],
          guardPk: guardPk3,
          status: EventStatus.completed,
        },
      ];
      const eventStatusThresholds: Threshold<AggregateEventStatus>[] = [
        { key: AggregateEventStatus.inPayment, count: 5 },
        { key: AggregateEventStatus.inReward, count: 5 },
        { key: AggregateEventStatus.finished, count: 3 },
        { key: AggregateEventStatus.timeout, count: 3 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 5 },
      ];

      // act
      const result = Utils.calcAggregatedStatus(
        guardStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.finished,
        tx: undefined,
        txStatus: undefined,
      });
    });

    /**
     * @target Utils.calcAggregatedStatus should return aggregated status with updated event status and no tx details when aggregated tx status returns undefined
     * @scenario
     * - define a mock guardStatuses array with enough records to trigger 'inPayment' event status
     * - define a mock eventStatusThresholds with valid thresholds
     * - define a mock txStatusThresholds with valid thresholds
     * - call Utils.calcAggregatedStatus
     * @expected
     * - Utils.calcAggregatedStatus should have returned an object with status = inPayment, tx & txStatus = undefined
     */
    it('should return aggregated status with updated event status and no tx details when aggregated tx status returns undefined', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [
        ...mockGuardStatusRecords,
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk1,
          status: EventStatus.inPayment,
        },
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk2,
          status: EventStatus.inPayment,
        },
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk3,
          status: EventStatus.inPayment,
        },
      ];
      const eventStatusThresholds: Threshold<AggregateEventStatus>[] = [
        { key: AggregateEventStatus.inPayment, count: 3 },
        { key: AggregateEventStatus.inReward, count: 5 },
        { key: AggregateEventStatus.finished, count: 3 },
        { key: AggregateEventStatus.timeout, count: 3 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 5 },
        { key: AggregateTxStatus.signed, count: 5 },
      ];

      // act
      const result = Utils.calcAggregatedStatus(
        guardStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.inPayment,
        tx: undefined,
        txStatus: undefined,
      });
    });

    /**
     * @target Utils.calcAggregatedStatus should return aggregated status with updated event status and parsed tx details when aggregated tx status returns valid data
     * @scenario
     * - define a mock guardStatuses array with enough records to trigger 'inPayment' event status
     * - define a mock eventStatusThresholds with valid thresholds
     * - define a mock txStatusThresholds with valid thresholds
     * - define a valid tx status string by combining tx key and mock tx status separated by ::
     * - call Utils.calcAggregatedStatus
     * @expected
     * - Utils.calcAggregatedStatus should have returned an object with status = inPayment, tx = mock tx key, & txStatus = mock tx status
     */
    it('should return aggregated status with updated event status and parsed tx details when aggregated tx status returns valid data', () => {
      // arrange
      const guardStatuses: GuardStatusEntity[] = [
        ...mockGuardStatusRecords,
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk4,
          status: EventStatus.inPayment,
        },
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk2,
          status: EventStatus.inPayment,
        },
        {
          ...mockGuardStatusRecords[1],
          guardPk: guardPk3,
          status: EventStatus.inPayment,
        },
      ];
      const eventStatusThresholds: Threshold<AggregateEventStatus>[] = [
        { key: AggregateEventStatus.inPayment, count: 3 },
        { key: AggregateEventStatus.inReward, count: 5 },
        { key: AggregateEventStatus.finished, count: 3 },
        { key: AggregateEventStatus.timeout, count: 3 },
      ];
      const txStatusThresholds: Threshold<AggregateTxStatus>[] = [
        { key: AggregateTxStatus.inSign, count: 5 },
        { key: AggregateTxStatus.signed, count: 3 },
        { key: AggregateTxStatus.completed, count: 3 },
      ];

      // act
      const result = Utils.calcAggregatedStatus(
        guardStatuses,
        eventStatusThresholds,
        txStatusThresholds,
      );

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.inPayment,
        tx: { txId: mockTx0.txId, chain: mockTx0.chain },
        txStatus: AggregateTxStatus.signed,
      });
    });
  });

  describe('cloneOmitting', () => {
    /**
     * @target Utils.cloneOmitting should return an empty object when cloning an empty object
     * @dependencies
     * @scenario
     * - call cloneOmitting with {} and any fieldsToOmit (such as an empty array)
     * @expected
     * - the returned object should have been equal to {}
     */
    it('should return an empty object when cloning an empty object', () => {
      // arrange
      const input = {};

      // act
      const result = Utils.cloneOmitting(input, []);

      // assert
      expect(result).toEqual({});
    });

    /**
     * @target Utils.cloneOmitting should clone the object without omitting any fields when an empty omit list is provided
     * @dependencies
     * @scenario
     * - define an object with some key-value pairs (e.g., { a: 1, b: 'test', c: true })
     * - call cloneOmitting with the defined object and an empty array for fieldsToOmit
     * @expected
     * - the returned object should have been equal to the original object
     */
    it('should clone the object without omitting any fields when an empty omit list is provided', () => {
      // arrange
      const input = { a: 1, b: 'test', c: true };
      const fieldsToOmit: Array<keyof typeof input> = [];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit);

      // assert
      expect(result).toEqual(input);
    });

    /**
     * @target Utils.cloneOmitting should omit a single specified field from the object
     * @dependencies
     * @scenario
     * - define an object with multiple key-value pairs (e.g., { a: 1, b: 'test', c: true })
     * - call cloneOmitting with the defined object and ['b'] as fieldsToOmit
     * @expected
     * - the returned object should not have the key 'b'
     * - the returned object should have been equal to { a: 1, c: true }
     */
    it('should omit a single specified field from the object', () => {
      // arrange
      const input = { a: 1, b: 'test', c: true };
      const fieldsToOmit: Array<keyof typeof input> = ['b'];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit);

      // assert
      expect(result).not.toHaveProperty('b');
      expect(result).toEqual({ a: 1, c: true });
    });

    /**
     * @target Utils.cloneOmitting should omit multiple specified fields from the object
     * @dependencies
     * @scenario
     * - define an object with several key-value pairs (e.g., { a: 1, b: 'test', c: true, d: 42 })
     * - call cloneOmitting with the defined object and ['b', 'd'] as fieldsToOmit
     * @expected
     * - the returned object should not have contained keys 'b' and 'd'
     * - the returned object should have been equal to { a: 1, c: true }
     */
    it('should omit multiple specified fields from the object', () => {
      // arrange
      const input = { a: 1, b: 'test', c: true, d: 42 };
      const fieldsToOmit: Array<keyof typeof input> = ['b', 'd'];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit);

      // assert
      expect(result).not.toHaveProperty('b');
      expect(result).not.toHaveProperty('d');
      expect(result).toEqual({ a: 1, c: true });
    });

    /**
     * @target Utils.cloneOmitting should return the original object clone when fieldsToOmit contains keys that are not present in the object
     * @dependencies
     * @scenario
     * - define an object with some key-value pairs (e.g., { a: 1, b: 'test' })
     * - call cloneOmitting with the defined object and ['x', 'y'] as fieldsToOmit
     * @expected
     * - the returned object should have been equal to { a: 1, b: 'test' }
     * - the returned object should contain all original keys
     */
    it('should return the original object clone when fieldsToOmit contains keys that are not present in the object', () => {
      // arrange
      const input = { a: 1, b: 'test' };
      const fieldsToOmit = ['x', 'y'];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit as never);

      // assert
      expect(result).toEqual({ a: 1, b: 'test' });
      expect(Object.keys(result)).toEqual(['a', 'b']);
    });

    /**
     * @target Utils.cloneOmitting should perform a shallow clone and retain references for nested objects
     * @dependencies
     * @scenario
     * - define an object with a nested object (e.g., { a: { nested: 'value' }, b: 2 })
     * - call cloneOmitting with the defined object and ['b'] as fieldsToOmit
     * @expected
     * - the returned object should have been equal to { a: { nested: 'value' } }
     * - the nested object reference should have been equal to the original nested object
     */
    it('should perform a shallow clone and retain references for nested objects', () => {
      // arrange
      const nested = { nested: 'value' };
      const input = { a: nested, b: 2 };

      // act
      const result = Utils.cloneOmitting(input, ['b']);

      // assert
      expect(result).toEqual({ a: { nested: 'value' } });
      expect(result.a).toBe(nested);
    });

    /**
     * @target Utils.cloneOmitting should correctly clone an object when all fields are omitted resulting in an empty object
     * @dependencies
     * @scenario
     * - define an object with multiple key-value pairs (e.g., { a: 1, b: 2, c: 3 })
     * - call cloneOmitting with the defined object and ['a', 'b', 'c'] as fieldsToOmit
     * @expected
     * - the returned object should have been equal to {}
     * - the returned object should have no keys
     */
    it('should correctly clone an object when all fields are omitted resulting in an empty object', () => {
      // arrange
      const input = { a: 1, b: 2, c: 3 };
      const fieldsToOmit: Array<keyof typeof input> = ['a', 'b', 'c'];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit);

      // assert
      expect(result).toEqual({});
      expect(Object.keys(result)).toEqual([]);
    });

    /**
     * @target Utils.cloneOmitting should ignore duplicate field names in the fieldsToOmit array without affecting the clone output
     * @dependencies
     * @scenario
     * - define an object with key-value pairs (e.g., { a: 1, b: 2, c: 3 })
     * - call cloneOmitting with the defined object and ['a', 'a', 'b'] as fieldsToOmit
     * @expected
     * - the returned object should have been equal to { c: 3 }
     * - the returned object should not have contained keys 'a' or 'b'
     */
    it('should ignore duplicate field names in the fieldsToOmit array without affecting the clone output', () => {
      // arrange
      const input = { a: 1, b: 2, c: 3 };
      const fieldsToOmit: Array<keyof typeof input> = ['a', 'a', 'b'];

      // act
      const result = Utils.cloneOmitting(input, fieldsToOmit);

      // assert
      expect(result).toEqual({ c: 3 });
      expect(result).not.toHaveProperty('a');
      expect(result).not.toHaveProperty('b');
    });

    /**
     * @target Utils.cloneOmitting should work with objects having keys that are numbers or symbols when accessed as strings
     * @dependencies
     * @scenario
     * - define an object with number-like keys (e.g., { '1': 'one', '2': 'two', '3': 'three' })
     * - call cloneOmitting with the defined object and ['2'] as fieldsToOmit
     * @expected
     * - the returned object should have been equal to { '1': 'one', '3': 'three' }
     * - the returned object should not have contained the key '2'
     */
    it('should work with objects having keys that are numbers or symbols when accessed as strings', () => {
      // arrange
      const input = { '1': 'one', '2': 'two', '3': 'three' };

      // act
      const result = Utils.cloneOmitting(input, ['2']);

      // assert
      expect(result).toEqual({ '1': 'one', '3': 'three' });
      expect(result).not.toHaveProperty('2');
    });
  });

  describe('cloneFilterPush', () => {
    /**
     * @target Utils.cloneFilterPush should return a new array with new object pushed when original array is empty
     * @scenario
     * - define a mock empty array
     * - define a key with any valid property name
     * - define a value to filter out
     * - define a new object with that property set to a value different from the filter value
     * - call Utils.cloneFilterPush with the mock empty array, key, value, and new object
     * @expected
     * - Utils.cloneFilterPush should have returned an array with one element
     * - the returned array should have contained the new object
     */
    it('should return a new array with new object pushed when original array is empty', () => {
      // arrange
      const arr: Array<{ id: number }> = [];
      const key: keyof { id: number } = 'id';
      const value = 1;
      const newObj = { id: 2 };

      // act
      const result = Utils.cloneFilterPush(arr, key, value, newObj);

      // assert
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(newObj);
    });

    /**
     * @target Utils.cloneFilterPush should return a cloned array with new object pushed when no objects match the filter value
     * @scenario
     * - define a mock array with objects that have the property key not equal to the filter value
     * - define a key corresponding to the property in the objects
     * - define a value that does not match any object's property value in the array
     * - define a new object
     * - call Utils.cloneFilterPush with the mock array, key, value, and new object
     * @expected
     * - Utils.cloneFilterPush should have returned an array with all original objects and the new object appended
     * - the length of the returned array should have been one greater than the original array length
     */
    it('should return a cloned array with new object pushed when no objects match the filter value', () => {
      // arrange
      const arr = [{ id: 2 }, { id: 3 }];
      const key: keyof { id: number } = 'id';
      const value = 1; // not present in any object
      const newObj = { id: 4 };
      const originalLength = arr.length;

      // act
      const result = Utils.cloneFilterPush(arr, key, value, newObj);

      // assert
      expect(result.length).toBe(originalLength + 1);
      expect(result.slice(0, originalLength)).toEqual(arr);
      expect(result[originalLength]).toEqual(newObj);
    });

    /**
     * @target Utils.cloneFilterPush should return a cloned array with new object pushed after filtering out objects that match the filter value
     * @scenario
     * - define a mock array with multiple objects where some objects have the property equal to the filter value and others do not
     * - define a key corresponding to the property in the objects
     * - define a value that matches some of the objects in the array
     * - define a new object
     * - call Utils.cloneFilterPush with the mock array, key, value, and new object
     * @expected
     * - Utils.cloneFilterPush should have returned an array containing only the objects whose key did not equal the filter value and the new object appended
     * - the returned array should have had a length equal to the count of non-matching objects plus one
     */
    it('should return a cloned array with new object pushed after filtering out objects that match the filter value', () => {
      // arrange
      const arr = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
      const key: keyof { id: number } = 'id';
      const filterValue = 1;
      const newObj = { id: 4 };
      const nonMatching = arr.filter((item) => item.id !== filterValue);

      // act
      const result = Utils.cloneFilterPush(arr, key, filterValue, newObj);

      // assert
      expect(result.length).toBe(nonMatching.length + 1);
      expect(result.slice(0, nonMatching.length)).toEqual(nonMatching);
      expect(result[result.length - 1]).toEqual(newObj);
    });

    /**
     * @target Utils.cloneFilterPush should use strict equality for filtering values
     * @scenario
     * - define a mock array with objects where the property key values are of mixed types (e.g., numbers and strings) but compare only those matching the filter value type
     * - define a key corresponding to the property in the objects
     * - define a value that matches some objects when using strict equality
     * - define a new object
     * - call Utils.cloneFilterPush with the mock array, key, value, and new object
     * @expected
     * - Utils.cloneFilterPush should have returned an array without objects whose key strictly equaled the filter value and with the new object appended
     * - the length of the returned array should have been equal to the number of objects not matching the filter value plus one
     */
    it('should use strict equality for filtering values', () => {
      // arrange
      type Mixed = { key: number | string };
      const arr: Mixed[] = [
        { key: 1 },
        { key: '1' },
        { key: 2 },
        { key: '2' },
        { key: 1 },
      ];
      const key: keyof Mixed = 'key';
      const filterValue: number | string = 1; // strictly matches numbers equal to 1
      const newObj: Mixed = { key: 'new' };
      const nonMatching = arr.filter((item) => item.key !== filterValue);

      // act
      const result = Utils.cloneFilterPush(arr, key, filterValue, newObj);

      // assert
      expect(result.length).toBe(nonMatching.length + 1);
      expect(result.slice(0, nonMatching.length)).toEqual(nonMatching);
      expect(result[result.length - 1]).toEqual(newObj);
    });
  });
});
