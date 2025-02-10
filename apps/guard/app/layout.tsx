import { Metadata } from 'next';
import React, { PropsWithChildren } from 'react';

import { App } from './App';

export const metadata: Metadata = {
  title: 'Rosen Guard',
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    /**
     * TODO: get `lang` from url language path segment
     * local:ergo/rosen-bridge/ui#13
     */
    <html lang="en">
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
