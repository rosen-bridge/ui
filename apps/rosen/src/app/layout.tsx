import { type PropsWithChildren, Suspense } from 'react';
import type { Metadata } from 'next';

import '@rosen-bridge/ui-kit/style.css';

import { App } from './App';

export const metadata: Metadata = {
  title: 'Rosen Bridge',
  other: {
    /**
     * Disable browser auto-translation; it modifies the DOM outside React and breaks rendering.
     */
    google: 'notranslate',
  },
};

const RootLayout = ({ children }: PropsWithChildren) => {
  return (
    /**
     * TODO: get `lang` from url language path segment
     * local:ergo/rosen-bridge/ui#13
     */
    <html lang="en" translate="no">
      <body>
        <Suspense fallback={null}>
          <App>{children}</App>
        </Suspense>
      </body>
    </html>
  );
};

export default RootLayout;
