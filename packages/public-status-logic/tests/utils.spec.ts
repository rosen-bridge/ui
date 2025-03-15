import { GuardStatusEntity } from '../src';
import {
  AggregateEventStatus,
  AggregateTxStatus,
  EventStatus,
  TxStatus,
} from '../src/constants';
import { TxEntity } from '../src/db/entities/TxEntity';
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
      const statuses0: GuardStatusEntity[] = [];
      const statuses1: GuardStatusEntity[] = [
        {
          eventId: '',
          guardPk: guardPk0,
          updatedAt: 0,
          status: EventStatus.pendingPayment,
          tx: null,
          txStatus: null,
        },
      ];
      const statuses2: GuardStatusEntity[] = [
        {
          eventId: '',
          guardPk: guardPk0,
          updatedAt: 0,
          status: EventStatus.inPayment,
          tx: {
            txId: id0,
            chain: 'c1',
          } as unknown as TxEntity,
          txStatus: TxStatus.approved,
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
      expect(result0).toEqual(waitingForConfirmationObj);
      expect(result1).toEqual(waitingForConfirmationObj);
      expect(result2).toEqual(waitingForConfirmationObj);
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
      const tx0 = { txId: id0, chain: 'c1' } as unknown as TxEntity;
      const statuses: GuardStatusEntity[] = [
        {
          eventId: '',
          guardPk: guardPk3,
          updatedAt: 0,
          status: EventStatus.pendingPayment,
          tx: null,
          txStatus: null,
        },
        {
          eventId: '',
          guardPk: guardPk0,
          updatedAt: 0,
          status: EventStatus.inReward,
          tx: tx0,
          txStatus: TxStatus.signed,
        },
        {
          eventId: '',
          guardPk: guardPk1,
          updatedAt: 0,
          status: EventStatus.inReward,
          tx: tx0,
          txStatus: TxStatus.signed,
        },
        {
          eventId: '',
          guardPk: guardPk2,
          updatedAt: 0,
          status: EventStatus.inReward,
          tx: tx0,
          txStatus: TxStatus.signed,
        },
      ];

      // act
      const result = Utils.calcAggregatedStatus(statuses);

      // assert
      expect(result).toEqual({
        status: AggregateEventStatus.inReward,
        txStatus: AggregateTxStatus.signed,
        tx: tx0,
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
