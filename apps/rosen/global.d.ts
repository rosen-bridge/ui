import type { DefaultColor } from '@rosen-bridge/ui-kit';

declare module '@rosen-bridge/ui-kit' {
  interface ColorOverrides extends Record<DefaultColor, true> {
    UNLISTED: false;
  }

  interface GapOverrides {}

  interface IconOverrides {}
}
export {};
