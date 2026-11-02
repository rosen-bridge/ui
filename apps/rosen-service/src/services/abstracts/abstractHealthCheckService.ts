import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractHealthService extends PeriodicTaskService {
  static name = 'HealthCheck';
  protected static instance: AbstractHealthService;

  /**
   * Returns the singleton instance of AbstractHealthService
   *
   * @static
   * @return {AbstractHealthService}
   * @memberof AbstractHealthService
   */
  static getInstance = (): AbstractHealthService => {
    return AbstractHealthService.instance;
  };
}
