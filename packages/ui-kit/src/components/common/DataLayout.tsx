import { ReactNode } from 'react';

import { Grid } from '../base';

export type DataLayoutProps = {
  children: ReactNode;
  pagination: ReactNode;
  search: ReactNode;
  sidebar: ReactNode;
  sort: ReactNode;
};

export const DataLayout = ({
  children,
  pagination,
  search,
  sidebar,
  sort,
}: DataLayoutProps) => {
  return (
    <Grid container gap={(theme) => theme.spacing(2)}>
      <Grid item mobile={12}>
        <Grid container wrap="nowrap" gap={(theme) => theme.spacing(2)}>
          <Grid flexGrow={1} minWidth={0}>
            {search}
          </Grid>
          <Grid flexBasis="auto">{sort}</Grid>
        </Grid>
      </Grid>
      <Grid item mobile={12}>
        <Grid container wrap="nowrap" gap={(theme) => theme.spacing(2)}>
          <Grid item flexGrow={1}>
            <Grid container gap={(theme) => theme.spacing(2)}>
              <Grid item mobile={12}>
                {children}
              </Grid>
              <Grid item mobile={12}>
                {pagination}
              </Grid>
            </Grid>
          </Grid>
          <Grid item>{sidebar}</Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
