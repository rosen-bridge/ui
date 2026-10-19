import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractBridgeFeeMetricService extends PeriodicTaskService {
  static name = 'BridgeFeeMetric';
  protected static instance: AbstractBridgeFeeMetricService;

  /**
   * Returns the singleton instance of AbstractBridgeFeeMetricService
   *
   * @static
   * @return {AbstractBridgeFeeMetricService}
   * @memberof AbstractBridgeFeeMetricService
   */
  static getInstance = (): AbstractBridgeFeeMetricService => {
    return AbstractBridgeFeeMetricService.instance;
  };
}
