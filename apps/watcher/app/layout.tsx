import React from 'react';

import { App } from './App';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
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
