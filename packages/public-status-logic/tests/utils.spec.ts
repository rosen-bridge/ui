import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from '../src/constants';
import { StatusForAggregate } from '../src/types';
import { Utils } from '../src/utils';
import { guardPk0, guardPk1, guardPk2, guardPk3, id0 } from './testData';

describe('Utils', () => {
  describe('calcAggregatedStatus', () => {
    /**
     * @target Utils.calcAggregatedStatus should return waitingForConfirmation status if
     * no threshold is triggered
     * @dependencies
     * @scenario
     * - call calcAggregatedStatus with 3 different values
     * @expected
     * - each call of calcAggregatedStatus should have returned its correct value
     */
    it('should return waitingForConfirmation status if no threshold is triggered', async () => {
      // arrange
      const statuses0: StatusForAggregate[] = [];
      const statuses1: StatusForAggregate[] = [
        {
          guardPk: guardPk0,
          status: EventStatus.pendingPayment,
        },
      ];
      const statuses2: StatusForAggregate[] = [
        {
          guardPk: guardPk0,
          status: EventStatus.inPayment,
          tx: {
            txId: id0,
            chain: 'c1',
            txStatus: TxStatus.approved,
          },
        },
      ];

      // act
      const result0 = Utils.calcAggregatedStatus(statuses0);
      const result1 = Utils.calcAggregatedStatus(statuses1);
      const result2 = Utils.calcAggregatedStatus(statuses2);

      // assert
      const waitingForConfirmationObj = {
        status: AggregateEventStatus.waitingForConfirmation,
        txStatus: AggregateTxStatus.waitingForConfirmation,
        tx: undefined,
      };
      expect(result0).toMatchObject(waitingForConfirmationObj);
      expect(result1).toMatchObject(waitingForConfirmationObj);
      expect(result2).toMatchObject(waitingForConfirmationObj);
    });

    /**
     * @target calcAggregatedStatus should return the correct aggregated status
     * @dependencies
     * @scenario
     * - call calcAggregatedStatus with array of statuses that won't result in waitingForConfirmation
     * @expected
     * - should have returned the correct value
     */
    it('should return the correct aggregated status', async () => {
      // arrange
      const statuses: StatusForAggregate[] = [
        {
          guardPk: guardPk3,
          status: EventStatus.pendingPayment,
          tx: undefined,
        },
        {
          guardPk: guardPk0,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txStatus: TxStatus.signed,
          },
        },
        {
          guardPk: guardPk1,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txStatus: TxStatus.signed,
          },
        },
        {
          guardPk: guardPk2,
          status: EventStatus.inReward,
          tx: {
            txId: id0,
            chain: 'c1',
            txStatus: TxStatus.signed,
          },
        },
      ];

      // act
      const result = Utils.calcAggregatedStatus(statuses);

      // assert
      expect(result).toMatchObject({
        status: AggregateEventStatus.inReward,
        txStatus: AggregateTxStatus.signed,
        tx: {
          txId: id0,
          chain: 'c1',
        },
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
});
