import { ReactNode } from 'react';

import { Grid } from '../base';

export type DataLayoutProps = {
  children: ReactNode;
  pagination: ReactNode;
  search: ReactNode;
  sidebar: ReactNode;
  sort: ReactNode;
  view?: ReactNode;
};

export const DataLayout = ({
  children,
  pagination,
  search,
  sidebar,
  sort,
  view,
}: DataLayoutProps) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Grid container wrap="nowrap" spacing={2}>
          <Grid flexGrow={1} minWidth={0}>
            {search}
          </Grid>
          <Grid flexShrink={0}>{sort}</Grid>
          {view && <Grid flexShrink={0}>{view}</Grid>}
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container wrap="nowrap">
          <Grid flexGrow={1} minWidth={0}>
            <Grid container spacing={2}>
              <Grid size={12}>{children}</Grid>
              <Grid size={12}>{pagination}</Grid>
            </Grid>
          </Grid>
          <Grid flexShrink={0}>{sidebar}</Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
