import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractEventCountMetricService extends PeriodicTaskService {
  protected static instance: AbstractEventCountMetricService;
  static Name = 'EventCountMetricService';

  /**
   * return the singleton instance of AbstractEventCountMetricService
   *
   * @static
   * @return {AbstractEventCountMetricService}
   * @memberof AbstractEventCountMetricService
   */
  static getInstance = (): AbstractEventCountMetricService => {
    return AbstractEventCountMetricService.instance;
  };
}
