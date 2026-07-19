import { type PropsWithChildren, Suspense } from 'react';

import { App } from './App';

import '@rosen-bridge/ui-kit/style.css';

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
