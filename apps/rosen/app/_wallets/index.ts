import { eternl } from './eternl';
import { lace } from './lace';
import { metamask } from './metamask';
import { myDoge } from './my-doge';
import { nautilus } from './nautilus';
import { okx } from './okx';

export const wallets = {
  [eternl.name]: eternl,
  [lace.name]: lace,
  [metamask.name]: metamask,
  [nautilus.name]: nautilus,
  [okx.name]: okx,
  [myDoge.name]: myDoge,
} as const;
