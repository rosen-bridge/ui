import { WalletConfig } from '@rosen-ui/wallet-api';

export type XverseWalletConfig = WalletConfig & {};

export enum AddressPurpose {
  Ordinals = 'ordinals',
  Payment = 'payment',
  Stacks = 'stacks',
}
