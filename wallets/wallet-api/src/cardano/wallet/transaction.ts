import { Address } from '../../types';

// raw wrappers around the wallet ap
import { sign } from './sign';
import { submit } from './submit';
import { getChangeAddress } from './getChangeAddr';
import { getUtxos } from './getUtxos';
import { RosenChainToken } from '@rosen-bridge/tokens';

// this function does not have access to server actions used for decoding
// the cardano values those function is defined inside the rosen app itself
// it is recommended to not put server request or any logic that is not
// general to the cardano wallet ecosystem here
// if you need to make any sort of server request you can handle that request inside the
// rosen app using the apis and tools that already exist on there

// this function is not using an enable wrapper so the wallet must be full connected before
// using it, if you use any of the predefined functions this problem is already handled

/**
 * a low level function to handle transactions in wallet level
 * @param token
 * @param toChain
 * @param toAddress
 * @param bridgeFee
 * @param networkFee
 */
export const transfer = (
  token: RosenChainToken,
  toChain: string,
  toAddress: Address,
  bridgeFee: number,
  networkFee: number,
  lockAddress: string
) => {
  // only use if absolutely necessary otherwise it is recommended to use the wrapper
  // functions that have been already defined
  const context = cardano;
};
// please fix the return type of this function after the implementation is finished
