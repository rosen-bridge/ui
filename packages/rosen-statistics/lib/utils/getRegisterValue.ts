import { Constant } from 'ergo-lib-wasm-nodejs';

import {
  type AbstractLogger,
  DummyLogger,
} from '@rosen-bridge/abstract-logger';
import type { IndexedErgoBox } from '@rosen-clients/ergo-node';

/**
 * Get the numeric value stored in a specific register of a node box.
 *
 * @param box - The IndexedErgoBox to read the register from
 * @param key - The register key to extract the value from
 * @param logger - Optional logger for debugging and error messages
 * @returns Number value decoded from the register, undefined if register is not present
 */
export const getRegisterValue = (
  box: IndexedErgoBox,
  key: string,
  logger: AbstractLogger = new DummyLogger(),
): number | undefined => {
  const reg = box.additionalRegisters[key];
  if (!reg) return undefined;

  try {
    const decoded = Constant.decode_from_base16(reg).to_i64().to_str();

    return Number(decoded);
  } catch (err) {
    logger.warn(`Failed to decode register ${key} with value ${reg}: ${err}`);
    return undefined;
  }
};
