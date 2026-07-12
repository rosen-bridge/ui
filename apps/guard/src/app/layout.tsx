import { type PropsWithChildren, Suspense } from 'react';

import type { Metadata } from 'next';

import '@rosen-bridge/ui-kit/style.css';

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
        <Suspense fallback={null}>
          <App>{children}</App>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
