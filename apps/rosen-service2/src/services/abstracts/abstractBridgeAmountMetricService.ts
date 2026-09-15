import { PeriodicTaskService } from '@rosen-bridge/service-manager';

export abstract class AbstractBridgeAmountMetricService extends PeriodicTaskService {
  static name = 'BridgeAmountMetric';
  protected static instance: AbstractBridgeAmountMetricService;

  /**
   * Returns the singleton instance of AbstractBridgeAmountMetricService
   *
   * @static
   * @return {AbstractBridgeAmountMetricService}
   * @memberof AbstractBridgeAmountMetricService
   */
  static getInstance = (): AbstractBridgeAmountMetricService => {
    return AbstractBridgeAmountMetricService.instance;
  };
}
