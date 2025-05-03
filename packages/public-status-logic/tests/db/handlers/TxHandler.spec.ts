import { Repository } from 'typeorm';

import { TxEntity } from '../../../src/db/entities/TxEntity';
import TxHandler from '../../../src/db/handlers/TxHandler';
import { mockTxs } from '../../testData';

describe('TxHandler', () => {
  describe('insertOne', () => {
    /**
     * @target TxHandler.insertOne should call insert when tx is new
     * @dependencies
     * @scenario
     * - stub repository.findOneBy and insert to resolve to null
     * - call insertOne
     * @expected
     * - insert should have been called once with the mock record
     */
    it('should call insert when tx is new', async () => {
      // arrange
      const repository = {
        findOneBy: vi.fn().mockResolvedValue(null),
        insert: vi.fn().mockResolvedValue(null),
      };

      const record = mockTxs[0];

      // act
      await TxHandler.getInstance().insertOne(
        repository as unknown as Repository<TxEntity>,
        record.txId,
        record.chain,
        record.eventId,
        record.insertedAt,
        record.txType,
      );

      // assert
      expect(repository.insert).toHaveBeenCalledOnce();
      expect(repository.insert.mock.calls[0][0]).toEqual(record);
    });

    /**
     * @target TxHandler.insertOne should throw when tx exists in database
     * @dependencies
     * @scenario
     * - define a mock TxEntity
     * - stub repository.findOneBy to resolve to the mock record and insert to resolve to null
     * - call insertOne with the mock record
     * @expected
     * - insertOne should have thrown `tx_exists` error
     * - repository.findOneBy should have been called once with txId and chain
     * - repository.insert should not have been called
     */
    it('should throw when tx exists in database', async () => {
      // arrange
      const record = mockTxs[0];

      const repository = {
        findOneBy: vi.fn().mockResolvedValue(record),
        insert: vi.fn().mockResolvedValue(null),
      };

      // act and assert
      await expect(async () => {
        await TxHandler.getInstance().insertOne(
          repository as unknown as Repository<TxEntity>,
          record.txId,
          record.chain,
          record.eventId,
          record.insertedAt + 10,
          record.txType,
        );
      }).rejects.toThrowError('tx_exists');

      expect(repository.findOneBy).toHaveBeenCalledOnce();
      expect(repository.findOneBy).toHaveBeenCalledWith({
        txId: record.txId,
        chain: record.chain,
      });
      expect(repository.insert).not.toHaveBeenCalled();
    });
  });
});
