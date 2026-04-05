'use client';

import { ReactNode } from 'react';

import {
  Box,
  Grid,
  PageHeading,
} from '@rosen-bridge/ui-kit';

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
        <Box mt={3}>
          <Grid container spacing={{ mobile: 0, tablet: 6 }}>
            <Grid size={{ mobile: 12, tablet: 6, laptop: 4 }}>{text}</Grid>
            <Grid flexGrow={1} size={{ mobile: 12, tablet: 6, laptop: 8 }}>
              {form}
            </Grid>
          </Grid>
        </Box>
      </ActionsCore>
    </>
  );
};

export default Actions;
