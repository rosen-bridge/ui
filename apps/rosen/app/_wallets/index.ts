import { eternl } from './eternl';
import { lace } from './lace';
import { metamask } from './metamask';
import { myDoge } from './my-doge';
import { nautilus } from './nautilus';
import { okx } from './okx';
import { walletConnectEVM } from './wallet-connect-evm';

export const wallets = {
  [eternl.name]: eternl,
  [lace.name]: lace,
  [metamask.name]: metamask,
  [myDoge.name]: myDoge,
  [nautilus.name]: nautilus,
  [okx.name]: okx,
  [walletConnectEVM.name]: walletConnectEVM,
} as const;
