import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractLockedAssetsMetricService extends PeriodicTaskService {
  protected static instance: AbstractLockedAssetsMetricService;
  static name = 'LockedAssetsMetric';

  /**
   * Returns the singleton instance of AbstractLockedAssetsMetricService
   *
   * @static
   * @return {AbstractLockedAssetsMetricService}
   * @memberof AbstractLockedAssetsMetricService
   */
  static getInstance = (): AbstractLockedAssetsMetricService => {
    return AbstractLockedAssetsMetricService.instance;
  };
}
