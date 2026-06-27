import { AbstractService } from '@rosen-bridge/service-manager';
import { VercelKV } from '@vercel/kv';

export abstract class AbstractRedisService extends AbstractService {
  static name = 'Redis';
  protected static instance: AbstractRedisService;

  /**
   * return the singleton instance of AbstractDBService
   *
   * @static
   * @return {AbstractDBService}
   * @memberof AbstractDBService
   */
  static getInstance = (): AbstractRedisService => {
    return AbstractRedisService.instance;
  };

  /**
   * returns of redis client
   *
   * @returns {VercelKV}
   */
  abstract getRedisClient: () => VercelKV;
}
