'use client';

import { ReactNode } from 'react';

import { Box, PageHeading } from '@rosen-bridge/ui-kit';

import { Actions as ActionsCore } from '@/components';

type ActionsProps = {
  form: ReactNode;
  text: ReactNode;
};

const Actions = ({ form, text }: ActionsProps) => {
  return (
    <>
      <PageHeading title="Actions" />
      <ActionsCore>
        <Box
          mt={3}
          sx={{
            display: 'grid',
            gap: {
              mobile: 0,
              tablet: 6,
            },
            gridTemplateColumns: {
              mobile: '1fr',
              tablet: '1fr 1fr',
              laptop: '1fr 2fr',
            },
          }}
        >
          <div>{text}</div>
          <div>{form}</div>
        </Box>
      </ActionsCore>
    </>
  );
};

export default Actions;
