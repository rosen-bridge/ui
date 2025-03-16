import { ReactNode } from 'react';

import { Popper, styled } from '@mui/material';

const Root = styled('div')(() => ({
  'border': '1px solid lightgray',
  'borderRadius': 1,
  'background': 'white',
  '.MuiListItem-root': {
    padding: '0.25rem',
  },
  '.MuiListItemButton-root': {
    paddingTop: 0,
    paddingBottom: 0,
  },
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
