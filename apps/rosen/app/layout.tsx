import fs from 'fs';
import path from 'path';

import { Metadata } from 'next';

import App from './App';

export const metadata: Metadata = {
  title: 'Rosen Bridge',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const tokensMap = JSON.parse(
    fs.readFileSync(path.resolve('./configs/tokensMap.json'), {
      encoding: 'utf-8',
    }),
  );

  return (
    /**
     * TODO: get `lang` from url language path segment
     * local:ergo/rosen-bridge/ui#13
     */
    <html lang="en">
      <body>
        <App tokensMap={tokensMap}>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
