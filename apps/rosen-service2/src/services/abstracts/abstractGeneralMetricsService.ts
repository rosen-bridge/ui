import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractGeneralMetricsService extends PeriodicTaskService {
  protected static instance: AbstractGeneralMetricsService;
  static name = 'GeneralMetricsService';

  /**
   * return the singleton instance of AbstractGeneralMetricsService
   *
   * @static
   * @return {AbstractGeneralMetricsService}
   * @memberof AbstractGeneralMetricsService
   */
  static getInstance = (): AbstractGeneralMetricsService => {
    return AbstractGeneralMetricsService.instance;
  };
}
