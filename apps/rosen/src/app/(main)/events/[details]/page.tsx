'use client';

import { useState } from 'react';

import { useParams } from 'next/navigation';

import { Stack } from '@rosen-bridge/ui-kit';

import { Overview } from './Overview';
import { Process } from './Process';
import { SourceTx } from './SourceTx';
import { TransactionsAndFees } from './TransactionsAndFees';
import { Watchers } from './Watchers';

const Page = () => {
  const { details } = useParams();

  const [flowId, setFlowId] = useState('');

  const id = details as string;

  return (
    <Stack spacing={2} direction="column">
      <Overview id={id} flowId={flowId} onFlowIdChange={setFlowId} />
      <TransactionsAndFees id={id} flowId={flowId} />
      <Process id={id} flowId={flowId} />
      <Watchers />
      <SourceTx />
    </Stack>
  );
};

export default Page;
