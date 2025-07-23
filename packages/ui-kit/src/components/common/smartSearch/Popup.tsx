import { ReactNode, useEffect, useRef } from 'react';

import { Popper } from '@mui/material';

import { styled } from '../../../styling';

const Root = styled('div')(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  background: theme.palette.background.paper,
  boxShadow: theme.shadows[8],
  padding: theme.spacing(1, 0),
}));

const Scrollable = styled('div')(({ theme }) => ({
  'overflow': 'hidden',
  'overflowY': 'auto',
  'maxHeight': '25rem',
  '::-webkit-scrollbar': {
    background: 'transparent',
    width: theme.spacing(1),
  },
  '::-webkit-scrollbar-thumb': {
    background: theme.palette.neutral.main,
    borderRadius: theme.shape.borderRadius,
  },
  '::-webkit-scrollbar-track': {
    background: 'transparent',
  },
}));

export type PopupProps = {
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
  open?: boolean;
  onFocusOut?: () => void;
};

export const Popup = ({ anchorEl, children, open, onFocusOut }: PopupProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const time = Date.now();

    const handleClick = (event: MouseEvent) => {
      if (time + 250 > Date.now()) return;

      const has = event
        .composedPath()
        .find((element) => element === ref.current);

      if (has) return;

      onFocusOut?.();
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [open, onFocusOut]);

  return (
    <Popper
      ref={ref}
      anchorEl={anchorEl}
      open={!!open}
      placement="bottom-start"
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 12],
          },
        },
      ]}
    >
      <Root>
        <Scrollable>{children}</Scrollable>
      </Root>
    </Popper>
  );
};
