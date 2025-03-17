import { TxRepository } from '../../../src/db/repositories/TxRepository';
import { mockTxs } from '../../testData';
import { DataSourceMock } from '../mocked/DataSource.mock';

describe('TxRepository', () => {
  beforeEach(async () => {
    await DataSourceMock.clearTables();
  });

  describe('insertOne', () => {
    /**
     * @target TxRepository.insertOne should insert record in database when tx is new
     * @dependencies
     * @scenario
     * - spy on TxRepository.findOneBy
     * - spy on TxRepository.insert
     * - call insertOne
     * - get database records
     * @expected
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should have been called with correct arguments
     * - tx should have been inserted into database
     */
    it('should insert record in database when tx is new', async () => {
      // arrange
      const findOneBySpy = vi.spyOn(TxRepository, 'findOneBy');
      const insertSpy = vi.spyOn(TxRepository, 'insert');
      const tx0 = mockTxs[0];

      // act
      await TxRepository.insertOne(
        tx0.txId,
        tx0.chain,
        tx0.eventId,
        tx0.insertedAt,
        tx0.txType,
      );

      const records = await TxRepository.find();

      // assert
      expect(findOneBySpy).toHaveBeenCalledTimes(1);
      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
        chain: tx0.chain,
      });

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy).toHaveBeenNthCalledWith(1, tx0);

      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(tx0);
    });

    /**
     * @target TxRepository.insertOne should throw when tx exists in database
     * @dependencies
     * @scenario
     * - insert a tx
     * - spy on TxRepository.findOneBy
     * - spy on TxRepository.insert
     * - call insertOne with the same tx
     * - get database records
     * @expected
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should not have been called
     * - database should have contained only the original record
     */
    it('should throw when tx exists in database', async () => {
      // arrange
      const tx0 = mockTxs[0];
      await TxRepository.insertOne(
        tx0.txId,
        tx0.chain,
        tx0.eventId,
        tx0.insertedAt,
        tx0.txType,
      );

      const findOneBySpy = vi.spyOn(TxRepository, 'findOneBy');
      const insertSpy = vi.spyOn(TxRepository, 'insert');

      // act and assert
      await expect(async () => {
        await TxRepository.insertOne(
          tx0.txId,
          tx0.chain,
          tx0.eventId,
          tx0.insertedAt + 10,
          tx0.txType,
        );
      }).rejects.toThrowError('tx_exists');

      const records = await TxRepository.find();

      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
        chain: tx0.chain,
      });
      expect(insertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(1);
      expect(records[0]).toEqual(tx0);
    });

    /**
     * @target TxRepository.insertOne should throw when findOneBy throws
     * @dependencies
     * @scenario
     * - stub TxRepository.findOneBy to reject with an error
     * - spy on TxRepository.insert
     * - call insertOne
     * - get database records
     * @expected
     * - insertOne should have thrown 'custom_error'
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should not have been called
     * - tx should not have been inserted into database
     */
    it('should throw when findOneBy throws', async () => {
      // arrange
      const tx0 = mockTxs[0];
      const findOneBySpy = vi
        .spyOn(TxRepository, 'findOneBy')
        .mockRejectedValue(new Error('custom_error'));
      const insertSpy = vi.spyOn(TxRepository, 'insert');

      // act and assert
      await expect(
        async () =>
          await TxRepository.insertOne(
            tx0.txId,
            tx0.chain,
            tx0.eventId,
            tx0.insertedAt,
            tx0.txType,
          ),
      ).rejects.toThrowError('custom_error');

      const records = await TxRepository.find();

      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
        chain: tx0.chain,
      });
      expect(insertSpy).not.toHaveBeenCalled();
      expect(records).toHaveLength(0);
    });

    /**
     * @target TxRepository.insertOne should throw when insert throws
     * @dependencies
     * @scenario
     * - spy on TxRepository.findOneBy
     * - stub TxRepository.insert to reject with an error
     * - call insertOne
     * - get database records
     * @expected
     * - insertOne should have thrown 'custom_error'
     * - findOneBySpy should have been called with correct arguments
     * - insertSpy should have been called with correct arguments
     * - tx should not have been inserted into database
     */
    it('should throw when insert throws', async () => {
      // arrange
      const tx0 = mockTxs[0];
      const findOneBySpy = vi
        .spyOn(TxRepository, 'findOneBy')
        .mockResolvedValue(null);
      const insertSpy = vi
        .spyOn(TxRepository, 'insert')
        .mockRejectedValue(new Error('custom_error'));

      // act and assert
      await expect(
        async () =>
          await TxRepository.insertOne(
            tx0.txId,
            tx0.chain,
            tx0.eventId,
            tx0.insertedAt,
            tx0.txType,
          ),
      ).rejects.toThrowError('custom_error');

      const records = await TxRepository.find();

      expect(findOneBySpy).toHaveBeenCalledWith({
        txId: tx0.txId,
        chain: tx0.chain,
      });
      expect(insertSpy).toHaveBeenCalledWith(tx0);
      expect(records).toHaveLength(0);
    });
  });
});
