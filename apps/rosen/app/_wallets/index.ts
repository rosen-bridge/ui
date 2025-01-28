import { eternl } from './eternl';
import { lace } from './lace';
import { metamask } from './metamask';
import { nami } from './nami';
import { nautilus } from './nautilus';
import { okx } from './okx';

export const availableWallets = {
  [eternl.name]: eternl,
  [lace.name]: lace,
  [metamask.name]: metamask,
  [nami.name]: nami,
  [nautilus.name]: nautilus,
  [okx.name]: okx,
} as const;
