import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractUserEventsMetricService extends PeriodicTaskService {
  static Name = 'UserEventsMetricService';
  protected static instance: AbstractUserEventsMetricService;

  /**
   * return the singleton instance of AbstractUserEventsMetricService
   *
   * @static
   * @return {AbstractUserEventsMetricService}
   * @memberof AbstractUserEventsMetricService
   */
  static getInstance = (): AbstractUserEventsMetricService => {
    return AbstractUserEventsMetricService.instance;
  };
}
