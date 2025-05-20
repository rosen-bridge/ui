import { binance } from './binance';
import { bitcoin } from './bitcoin';
import { cardano } from './cardano';
import { doge } from './doge';
import { ergo } from './ergo';
import { ethereum } from './ethereum';
import { runes } from './runes';

export const networks = {
  [binance.name]: binance,
  [bitcoin.name]: bitcoin,
  [runes.name]: runes,
  [cardano.name]: cardano,
  [ergo.name]: ergo,
  [ethereum.name]: ethereum,
  [doge.name]: doge,
} as const;
