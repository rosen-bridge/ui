/**
 * global type augmentation for the wallet
 */
declare global {
  interface Window {
    okxwallet: {
      bitcoin: {
        /**
         * TODO: replace the any type with an interface
         * local:ergo/rosen-bridge/ui#456
         */
        // eslint-disable-next-line
        [key: string]: any;
      };
    };
  }
}

export {};
