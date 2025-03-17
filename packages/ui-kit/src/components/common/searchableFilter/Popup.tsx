import { ReactNode } from 'react';

import { Popper, styled } from '@mui/material';

const Root = styled('div')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[8],
  overflow: 'hidden',
}));

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
      <Root>{children}</Root>
    </Popper>
  );
};
