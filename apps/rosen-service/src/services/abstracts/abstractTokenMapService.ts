import type { TokenMap } from '@rosen-bridge/extended-tokens';
import { AbstractService } from '@rosen-bridge/service-manager';

export abstract class AbstractTokenMapService extends AbstractService {
  protected static instance: AbstractTokenMapService;
  static name = 'TokenMap';

  /**
   * Returns the singleton instance of AbstractTokenMapService
   *
   * @static
   * @return {AbstractTokenMapService}
   * @memberof AbstractTokenMapService
   */
  static getInstance = (): AbstractTokenMapService => {
    return AbstractTokenMapService.instance;
  };

  /**
   * Returns of tokenMap
   *
   * @returns {TokenMap} tokenMap
   */
  abstract getTokenMap: () => TokenMap;
}
