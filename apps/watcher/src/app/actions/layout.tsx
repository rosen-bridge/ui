'use client';

import { CSSProperties, ReactNode } from 'react';

import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Divider,
  PageHeading,
  Stack,
  Typography,
  useResponsive,
} from '@rosen-bridge/ui-kit';

import { Actions as ActionsCore } from '@/components';

import { Transactions } from './transactions';

type ActionsProps = {
  form: ReactNode;
  text: ReactNode;
  title: ReactNode;
};

const Actions = ({ form, text, title }: ActionsProps) => {
  const style = useResponsive<CSSProperties>({
    mobile: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
    },
    laptop: {
      gridTemplateColumns: '1fr auto 1fr',
    },
    desktop: {
      gridTemplateColumns: '3fr auto 2fr',
    },
  });

  const wide = useResponsive<boolean>({
    laptop: true,
  });

  return (
    <>
      <PageHeading title="Actions" />
      <Stack spacing={2}>
        <ActionsCore />
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardBody style={style}>
            <div style={{ order: wide ? '-1' : '1' }}>{form}</div>
            {wide && <Divider orientation="vertical" />}
            <Typography component="div" color="text-secondary">
              {text}
            </Typography>
          </CardBody>
        </Card>
        <Transactions />
      </Stack>
    </>
  );
};

export default Actions;
