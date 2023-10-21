import { ConnectorContextApi } from '../../bridges';

export const getChangeAddress = (context: ConnectorContextApi) =>
  context.getChangeAddress();
