import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Dependency, ServiceStatus } from '@rosen-bridge/service-manager';
import { createClient, VercelKV } from '@vercel/kv';

import { configs } from '../configs';
import { AbstractRedisService } from './abstracts/abstractRedisService';

export class RedisService extends AbstractRedisService {
  protected redis: VercelKV;
  static serviceName = AbstractRedisService.name;
  protected dependencies: Dependency[] = [];

  /**
   * Protected constructor
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * Starts service
   * @returns {Promise<boolean>} True if the service started successfully, false otherwise.
   */
  protected start = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.running);
    return true;
  };

  /**
   * Initializes the singleton instance of RedisService
   *
   * @static
   * @memberof RedisService
   */
  static init = (logger?: AbstractLogger) => {
    if (AbstractRedisService.instance != undefined) {
      return;
    }
    AbstractRedisService.instance = new RedisService(logger);
  };

  /**
   * Assembles the service by initializing dependencies
   * @async
   * @returns {Promise<boolean>} Resolves to `true` when the assembly is successfully completed.
   */
  protected assemble = async (): Promise<boolean> => {
    this.redis = createClient({
      url: configs.redis.address,
      token: configs.redis.token,
    });
    this.logger.info('Redis client is up');
    this.setStatus(ServiceStatus.dormant);
    return true;
  };

  /**
   * Retrieves data with the specified key from the Redis.
   *
   * @template T - The expected type of data.
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  getFromRedis = async <T>(key: string): Promise<T | null> => {
    return await this.redis.get<T>(key);
  };

  /**
   * Stores data in the Redis with the specified key.
   *
   * @param {string} key
   * @param {string} data
   * @returns {Promise<void>}
   */
  setToRedis = async (key: string, data: string): Promise<void> => {
    await this.redis.set(key, data);
  };

  /**
   * Stops service
   * @returns {Promise<boolean>} True if the service stopped successfully, false otherwise.
   */
  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
