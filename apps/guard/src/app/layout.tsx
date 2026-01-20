import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

import { App } from './App';

export const metadata: Metadata = {
  title: 'Rosen Guard',
  icons: {
    icon: '/favicon.ico',
  },
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
