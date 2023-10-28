'use client';

import { useRouter, useSelectedLayoutSegment } from 'next/navigation';
import React, { SyntheticEvent } from 'react';

import {
  LockAlt,
  MoneyWithdrawal,
  Pause,
  SquareShape,
  Unlock,
} from '@rosen-bridge/icons';
import {
  Box,
  SvgIcon,
  ToggleButtonGroup,
  styled,
  Grid,
} from '@rosen-bridge/ui-kit';

import ToggleButton from './ToggleButton';

import { LayoutProps } from '@rosen-ui/types';

/**
 * render a box which is scrollable in mobile devices
 */
const ScrollableContainer = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down('tablet')]: {
    margin: theme.spacing(0, -2),
    padding: theme.spacing(0, 2),
    overflowY: 'auto',
  },
}));

/**
 * wrap `ToggleButtonGroup` to add some styling
 */
const CustomToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  background:
    theme.palette.mode === 'light'
      ? theme.palette.primary.main
      : theme.palette.divider,
  padding: theme.spacing(1, 1, 0, 1),
  minWidth: 'fit-content',
}));

/**
 * render a divider for `ToggleButton`s
 */
const ActionsDivider = () => (
  <Box
    sx={{
      width: '1px !important',
      my: 1,
      flexShrink: 0,
      background: `linear-gradient(180deg, #ffffff00 0%, #ffffff33 20%, #ffffff33 80%, #ffffff00 100%)`,
    }}
  />
);

const Actions = ({ form, text }: LayoutProps) => {
  const currentAction = useSelectedLayoutSegment('form');

  const router = useRouter();

  const handleActionChange = (event: SyntheticEvent, action: string) => {
    // router.push(`/actions/${action}`);
  };

  return (
    <>
      <ScrollableContainer>
        <CustomToggleButtonGroup
          value={currentAction}
          exclusive
          onChange={handleActionChange}
          fullWidth
        >
          <ToggleButton
            value="withdraw"
            label="Withdraw"
            icon={
              <SvgIcon>
                <MoneyWithdrawal />
              </SvgIcon>
            }
          />
          <ActionsDivider />
          <ToggleButton
            value="pause"
            label="Pause"
            disabled
            icon={
              <SvgIcon>
                <Pause />
              </SvgIcon>
            }
          />
          <ActionsDivider />
          <ToggleButton
            value="stop"
            label="Stop"
            disabled
            icon={
              <SvgIcon>
                <SquareShape />
              </SvgIcon>
            }
          />
          <ActionsDivider />
          <ToggleButton
            value="lock"
            label="Lock"
            icon={
              <SvgIcon>
                <LockAlt />
              </SvgIcon>
            }
          />
          <ActionsDivider />
          <ToggleButton
            value="unlock"
            label="Unlock"
            icon={
              <SvgIcon>
                <Unlock />
              </SvgIcon>
            }
          />
        </CustomToggleButtonGroup>
      </ScrollableContainer>
      <Box mt={3}>
        <Grid container spacing={{ mobile: 0, tablet: 6 }}>
          <Grid item mobile={12} tablet={6} laptop={4}>
            {text}
          </Grid>
          <Grid item mobile={12} tablet={6} laptop={8}>
            {form}
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default Actions;
