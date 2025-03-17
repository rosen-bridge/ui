import { ReactNode } from 'react';

import { Card, Popper } from '@mui/material';

export type PopupProps = {
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  open?: boolean;
};

export const Popup = ({ anchorEl, children, open }: PopupProps) => {
  return (
    <Popper
      anchorEl={anchorEl}
      open={!!open}
      placement="bottom-start"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      <Card elevation={8}>{children}</Card>
    </Popper>
  );
};
