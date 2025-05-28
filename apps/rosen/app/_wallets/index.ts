import { eternl } from './eternl';
import { lace } from './lace';
import { metamask } from './metamask';
import { myDoge } from './my-doge';
import { nautilus } from './nautilus';
import { okx } from './okx';
import { walletConnectBinance } from './wallet-connect-binance';
import { walletConnectEthereum } from './wallet-connect-ethereum';
import { xverse } from './xverse';

export const wallets = {
  [eternl.name]: eternl,
  [lace.name]: lace,
  [metamask.name]: metamask,
  [nautilus.name]: nautilus,
  [okx.name]: okx,
  [myDoge.name]: myDoge,
  [xverse.name]: xverse,
  [walletConnectBinance.name]: walletConnectBinance,
  [walletConnectEthereum.name]: walletConnectEthereum,
} as const;
