import { createElement, FC, SVGAttributes } from 'react';

import { Wallet } from '@rosen-ui/wallet-api';

declare module '@rosen-ui/wallet-api' {
  interface Wallet {
    iconReact: FC<SVGAttributes<SVGElement>>;
  }
}

Object.defineProperty(Wallet.prototype, 'iconReact', {
  get() {
    if (!this.iconReactElement) {
      const viewBoxMatch = this.icon.match(/viewBox\s*=\s*["']([^"']+)["']/i);

      const viewBox = viewBoxMatch ? viewBoxMatch[1] : undefined;

      const innerMatch = this.icon.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);

      const innerHTML = innerMatch ? innerMatch[1].trim() : '';

      this._iconReactCache = {
        innerHTML,
        viewBox,
      };
    }

    return (props) => createElement('svg', {
      ...props,
      viewBox: this._iconReactCache.viewBox,
      dangerouslySetInnerHTML: { __html: this._iconReactCache.innerHTML },
    })
  },
});
