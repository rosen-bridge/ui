import React from 'react';

import { Wallet } from '@rosen-ui/wallet-api';

declare module '@rosen-ui/wallet-api' {
  interface Wallet {
    iconReact: () => JSX.Element;
  }
}

Object.defineProperty(Wallet.prototype, 'iconReact', {
  get() {
    return () => {
      this.iconReactElement ||= React.createElement('span', {
        style: {
          width: '100%',
          height: '100%',
          display: `inline-flex`,
          alignItems: 'center',
          justifyContent: 'center',
        },
        dangerouslySetInnerHTML: {
          __html: this.icon,
        },
      });
      return this.iconReactElement;
    };
  },
});
