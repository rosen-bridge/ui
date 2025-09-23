'use client';

import { Button, Center, DividerNew } from '@rosen-bridge/ui-kit';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <Button
        sx={{ whiteSpace: 'nowrap' }}
        // disabled={disabled}
        // onClick={onClick}
      >
        <span>
          Use all
          <br />
          {9292556} <small style={{ textTransform: 'none' }}>PLAM AS C</small>
        </span>
      </Button>
      <div style={{ width: '50%', height: '100px' }}>
        <DividerNew
          orientation="vertical"
          style={{ borderStyle: 'dashed', marginTop: '50px' }}
        />
      </div>
    </Center>
  );
};

export default Page;
