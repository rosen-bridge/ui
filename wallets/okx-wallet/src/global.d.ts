/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    okxwallet: {
      bitcoin: {
        /**
         * TODO:
         * local:ergo/rosen-bridge/ui#456
         */
        // eslint-disable-next-line
        [key: string]: any;
      };
    };
  }
}

export {};
