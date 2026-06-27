import { AbstractLogger } from '@rosen-bridge/abstract-logger';
import { Dependency, ServiceStatus } from '@rosen-bridge/service-manager';
import { createClient, VercelKV } from '@vercel/kv';

import { configs } from '../configs';
import { AbstractRedisService } from './abstracts/abstractRedisService';

export class RedisService extends AbstractRedisService {
  redis: VercelKV;
  protected dependencies: Dependency[] = [];

  /**
   * Protected constructor
   * @param {AbstractLogger} [logger] - Optional logger instance for recording service operations.
   */
  protected constructor(logger?: AbstractLogger) {
    super(logger);
  }

  /**
   * Start service
   * @returns {Promise<boolean>} True if the service started successfully, false otherwise.
   */
  protected start = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.running);
    return true;
  };

  /**
   * initializes the singleton instance of HealthService
   *
   * @static
   * @memberof HealthService
   */
  static readonly init = (logger?: AbstractLogger) => {
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
   * returns of redis client
   *
   * @returns {VercelKV}
   */
  getRedisClient = (): VercelKV => {
    return this.redis;
  };

  /**
   * Stop service
   * @returns {Promise<boolean>} True if the service stopped successfully, false otherwise.
   */
  protected stop = async (): Promise<boolean> => {
    this.setStatus(ServiceStatus.dormant);
    return true;
  };
}
