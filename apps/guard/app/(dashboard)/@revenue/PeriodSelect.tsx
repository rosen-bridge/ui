import React, { useState } from 'react';

import { AngleDown } from '@rosen-bridge/icons';
import { Box, Button, Menu, MenuItem, SvgIcon } from '@rosen-bridge/ui-kit';
import { ChartPeriod } from '@rosen-ui/types';

const periodOptions = ['week', 'month', 'year'] as const;

interface PeriodSelectProps {
  period: string;
  setPeriod: React.Dispatch<React.SetStateAction<ChartPeriod>>;
}
/**
 * render a period select to be used inside parent page
 * @param period
 * @param setPeriod
 */
const PeriodSelect = ({ period, setPeriod }: PeriodSelectProps) => {
  const [anchorElement, setAnchorElement] = useState<HTMLButtonElement | null>(
    null
  );
  const open = !!anchorElement;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElement(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElement(null);
  };

  const handleSelect = (newPeriod: ChartPeriod) => () => {
    setPeriod(newPeriod);
    handleClose();
  };

  const renderPeriodSelectMenu = () => (
    <Menu
      anchorEl={anchorElement}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={open}
      onClose={handleClose}
      MenuListProps={{ dense: true }}
      slotProps={{
        paper: {
          elevation: 1,
          sx: { borderRadius: 0.5 },
        },
      }}
    >
      {periodOptions.map((periodOption) => (
        <MenuItem
          onClick={handleSelect(periodOption)}
          selected={periodOption === period}
          key={periodOption}
        >
          {periodOption}
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <Box>
      <Button
        onClick={handleClick}
        endIcon={
          <SvgIcon>
            <AngleDown size={20} />
          </SvgIcon>
        }
        size="small"
      >
        {period}
      </Button>
      {renderPeriodSelectMenu()}
    </Box>
  );
};

export default PeriodSelect;
