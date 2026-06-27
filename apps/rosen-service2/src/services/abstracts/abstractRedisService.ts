import { AbstractService } from '@rosen-bridge/service-manager';

export abstract class AbstractRedisService extends AbstractService {
  static name = 'Redis';
  protected static instance: AbstractRedisService;

  /**
   * Returns the singleton instance of AbstractRedisService
   *
   * @static
   * @return {AbstractRedisService}
   * @memberof AbstractRedisService
   */
  static getInstance = (): AbstractRedisService => {
    return AbstractRedisService.instance;
  };

  /**
   * Retrieves data with the specified key from the Redis.
   *
   * @template T - The expected type of data.
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  abstract getFromRedis: <T>(key: string) => Promise<T | null>;

  /**
   * Stores data in the Redis with the specified key.
   *
   * @param {string} key
   * @param {string} data
   * @returns {Promise<void>}
   */
  abstract setToRedis: (key: string, data: string) => Promise<void>;
}
