'use client';

import { Alert, Center } from '@rosen-bridge/ui-kit';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <Alert severity="warning" style={{ margin: '1rem 0' }}>
        It may be necessary to reload this page after the following extensions
        have been installed in order to connect to them.
      </Alert>
    </Center>
  );
};

export default Page;
