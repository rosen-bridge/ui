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
    <Grid container gap={(theme) => theme.spacing(2)}>
      <Grid size={12}>
        <Grid
          container
          wrap="nowrap"
          gap={(theme) => theme.spacing(2)}
          style={{ width: '100%', minWidth: 0 }}
        >
          <Grid flexGrow={1} minWidth={0}>
            {search}
          </Grid>

          <Grid flexBasis="auto">{sort}</Grid>
          {view && <Grid flexBasis="auto">{view}</Grid>}
        </Grid>
      </Grid>

      <Grid size={12}>
        <Grid container wrap="nowrap" style={{ width: '100%' }}>
          <Grid flexGrow={1} minWidth={0} sx={{ width: '100%' }}>
            <Grid container spacing={2} sx={{ width: '100%' }}>
              <Grid size={12} sx={{ width: '100%' }}>
                {children}
              </Grid>

              <Grid size={12}>{pagination}</Grid>
            </Grid>
          </Grid>

          <Grid
            flexShrink={0}
            style={{
              position: 'sticky',
              top: 16,
              alignSelf: 'flex-start',
              zIndex: 2,
            }}
          >
            {sidebar}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};
