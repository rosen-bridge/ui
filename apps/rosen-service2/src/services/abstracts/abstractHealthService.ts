import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractHealthService extends PeriodicTaskService {
  static name = 'HealthService';
  protected static instance: AbstractHealthService;

  /**
   * return the singleton instance of AbstractHealthService
   *
   * @static
   * @return {AbstractHealthService}
   * @memberof AbstractHealthService
   */
  static getInstance = (): AbstractHealthService => {
    return AbstractHealthService.instance;
  };
}
