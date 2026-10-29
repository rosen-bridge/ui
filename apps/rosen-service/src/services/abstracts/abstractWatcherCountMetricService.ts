import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractWatcherCountMetricService extends PeriodicTaskService {
  static name = 'WatcherCountMetric';
  protected static instance: AbstractWatcherCountMetricService;

  /**
   * Returns the singleton instance of AbstractWatcherCountMetricService
   *
   * @static
   * @return {AbstractWatcherCountMetricService}
   * @memberof AbstractWatcherCountMetricService
   */
  static getInstance = (): AbstractWatcherCountMetricService => {
    return AbstractWatcherCountMetricService.instance;
  };
}
