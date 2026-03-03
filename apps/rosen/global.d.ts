import * as AllIcons from '@rosen-bridge/icons';
import type { DefaultColor } from '@rosen-bridge/ui-kit';
import { Network } from '@rosen-ui/types';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface GapOverrides {}

  interface IconOverrides {
    name: Exclude<keyof typeof AllIcons, 'TOKENS'>;
  }

  interface NetworkOverrides {
    name: Network;
  }
}
export {};
