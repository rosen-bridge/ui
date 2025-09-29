'use client';

import { Button, Center, DividerNew } from '@rosen-bridge/ui-kit';

import { UseAllAmount } from '@/app/(bridge)/UseAllAmount';

const Page = () => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 224px)' }}>
      <UseAllAmount
        disabled={false}
        value={'1285.50'}
        error={false}
        onClick={() => console.log('')}
        unit={'ETH'}
        onRetry={() => console.log('')}
        loading={false}
      />
      <Button
      // sx={{ whiteSpace: 'nowrap' }}
      // disabled={disabled}
      // onClick={onClick}
      >
        <span style={{ whiteSpace: 'nowrap' }}>
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
