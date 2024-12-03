import { Metadata } from 'next';

import { App } from './App';

export const metadata: Metadata = {
  title: 'Rosen Bridge',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    /**
     * TODO: get `lang` from url language path segment
     * local:ergo/rosen-bridge/ui#13
     */
    <html lang="en">
      <body>
        <div>VERCEL_BRANCH_URL: {process.env.VERCEL_BRANCH_URL}</div>
        <div>
          NEXT_PUBLIC_ROOT_DOMAIN: {process.env.NEXT_PUBLIC_ROOT_DOMAIN}
        </div>
        <div>
          NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX:
          {process.env.NEXT_PUBLIC_VERCEL_DEPLOYMENT_SUFFIX}
        </div>
        <App>{children}</App>
      </body>
    </html>
  );
};

export default RootLayout;
