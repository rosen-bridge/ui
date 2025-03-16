import { useRef, useState } from 'react';

import { ClickAwayListener } from '@mui/material';
import { History as HistoryIcon } from '@rosen-bridge/icons';

import { IconButton, SvgIcon } from '../../base';
import { Popup } from './Popup';

export const History = () => {
  const $anchor = useRef<HTMLButtonElement | null>(null);

  const [open, setOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <div>
        <IconButton ref={$anchor} onClick={() => setOpen(!open)}>
          <SvgIcon>
            <HistoryIcon />
          </SvgIcon>
        </IconButton>
        <Popup anchorEl={$anchor.current} open={open}>
          ddd
        </Popup>
      </div>
    </ClickAwayListener>
  );
};
