import App from './App';

import fs from 'fs';
import path from 'path';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const tokensMap = JSON.parse(
    fs.readFileSync(path.resolve('./configs/tokensMap.json'), {
      encoding: 'utf-8',
    }),
  );

  return (
    /**
     * TODO: get `lang` from url language path segment
     *
     * local:ergo/rosen-bridge/ui/-/issues/13
     */
    <html lang="en">
      <body>
        <App tokensMap={tokensMap}>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
