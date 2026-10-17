export * from './binance';
export * from './bitcoin';
export * from './bitcoin-runes';
export * from './cardano';
export * from './doge';
export * from './ergo';
export * from './ethereum';
export * from './firo';
export * from './handshake';

/** Operational instances remain separate from namespace exports that can contain unavailable candidates. */
const networks: Readonly<Record<string, Network>> = withBitcoinCash<Network>(
  { binance, bitcoin, bitcoinRunes, cardano, doge, ergo, ethereum, firo, handshake },
  bitcoinCash,
);
export default networks;

import type { Network } from '@rosen-network/base';

import { binance } from './binance';
import { bitcoin } from './bitcoin';
import { bitcoinCash } from './bitcoin-cash/client';
import { withBitcoinCash } from './bitcoin-cash/registration';
import { bitcoinRunes } from './bitcoin-runes';
import { cardano } from './cardano';
import { doge } from './doge';
import { ergo } from './ergo';
import { ethereum } from './ethereum';
import { firo } from './firo';
import { handshake } from './handshake';
