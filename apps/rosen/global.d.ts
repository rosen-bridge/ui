import * as AllIcons from '@rosen-bridge/icons';
import type { DefaultColor } from '@rosen-bridge/ui-kit';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface GapOverrides {}

  interface IconOverrides {
    name: Exclude<keyof typeof AllIcons, 'TOKENS'>;
  }
}
export {};
