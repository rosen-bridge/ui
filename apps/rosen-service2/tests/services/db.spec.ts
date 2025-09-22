import { DummyLogger } from '@rosen-bridge/abstract-logger';
import { BlockEntity } from '@rosen-bridge/abstract-scanner';
import { DataSource } from '@rosen-bridge/extended-typeorm';
import { describe, it, expect, beforeEach } from 'vitest';

import { DBService } from '../../src/services/db';
import { MockedBlockEntityData } from './mocked/db.mock';

describe('DBService', () => {
  describe('getLastSavedBlock', () => {
    let dataSource: DataSource;
    let service: DBService;

    beforeEach(async () => {
      dataSource = new DataSource({
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        synchronize: true,
        entities: [BlockEntity],
      });

      DBService.init(dataSource, new DummyLogger());
      service = DBService.getInstance();

      await service['start']();
    });

    /**
     * @target should return the last saved block when there is at least one matching record
     * @scenario
     * - insert multiple BlockEntity records with different heights and scanners into the database
     * - call getLastSavedBlock with a specific scanner name
     * @expected
     * - it should return the BlockEntity with the highest height for that scanner
     */
    it('should return the last saved block when data exists', async () => {
      const repo = dataSource.getRepository(BlockEntity);

      await repo.insert(MockedBlockEntityData);

      const result = await service.getLastSavedBlock('scannerA');

      expect(result.height).toBe(80);
      expect(result.scanner).toBe('scannerA');
    });

    /**
     * @target should throw an error when no block is found for the given scanner
     * @scenario
     * - call getLastSavedBlock with a scanner name that has no records in the database
     * @expected
     * - it should throw "No block found or error in database connection"
     */
    it('should throw an error when no blocks are found', async () => {
      await expect(service.getLastSavedBlock('scannerX')).rejects.toThrow(
        'No block found or error in database connection',
      );
    });
  });
});
