import { TokenMap } from '@rosen-bridge/tokens';

type MaxTransferCreator = (
  getTokenMap: () => Promise<TokenMap>,
) => () => Promise<bigint>;

export const getMaxTransferCreator: MaxTransferCreator = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTokenMap: () => Promise<TokenMap>,
) => {
  // TODO: implement logic in the runes-ui-network task
  throw new Error('not implemented yet');
};
