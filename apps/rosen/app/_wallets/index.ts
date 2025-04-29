import { eternl } from './eternl';
import { lace } from './lace';
import { metamask } from './metamask';
import { myDoge } from './my-doge';
import { nautilus } from './nautilus';
import { okx } from './okx';
import { walletConnectBinance } from './wallet-connect-binance';
import { walletConnectEthereum } from './wallet-connect-ethereum';

export const wallets = {
  [eternl.name]: eternl,
  [lace.name]: lace,
  [metamask.name]: metamask,
  [myDoge.name]: myDoge,
  [nautilus.name]: nautilus,
  [okx.name]: okx,
  [walletConnectBinance.name]: walletConnectBinance,
  [walletConnectEthereum.name]: walletConnectEthereum,
} as const;
