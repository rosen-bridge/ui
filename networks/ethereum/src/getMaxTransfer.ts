import { TokenMap } from '@rosen-bridge/tokens';
import {
  EvmChains,
  getMaxTransferCreator as getMaxTransferCreatorBase,
} from '@rosen-network/evm';

export const getMaxTransferCreator = (getTokenMap: () => Promise<TokenMap>) => {
  return getMaxTransferCreatorBase(getTokenMap, EvmChains.ETHEREUM);
};
