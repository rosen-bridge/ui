import { TokenMap } from '@rosen-bridge/tokens';
import {
  EvmChains,
  getMaxTransferCreator as getMaxTransferCreatorBase,
} from '@rosen-network/evm';

export const getMaxTransferCreator = (tokenMap: TokenMap) => {
  return getMaxTransferCreatorBase(tokenMap, EvmChains.ETHEREUM);
};
