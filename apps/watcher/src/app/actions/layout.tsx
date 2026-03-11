'use client';

import { Route } from 'next';
import { useRouter, useSelectedLayoutSegments } from 'next/navigation';
import { Fragment, ReactNode, SyntheticEvent } from 'react';

import {
  Box,
  ToggleButtonGroup,
  styled,
  Grid,
  PageHeading,
  Icon,
} from '@rosen-bridge/ui-kit';

import { ToggleButton } from './ToggleButton';

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

type ActionsProps = {
  form: ReactNode;
  text: ReactNode;
};

const Actions = ({ form, text }: ActionsProps) => {
  const segments = useSelectedLayoutSegments('form');

  const router = useRouter();

  const handleActionChange = (event: SyntheticEvent, action: string) => {
    router.push(`/actions/${action}` as Route);
  };

  return (
    <Fragment>
      <PageHeading title="Actions" />
      <ScrollableContainer>
        <CustomToggleButtonGroup
          value={segments.at(-1)}
          exclusive
          onChange={handleActionChange}
          fullWidth
        >
          <ToggleButton
            value="withdraw"
            label="Withdraw"
            icon={<Icon name="MoneyWithdrawal" />}
          />
          <ActionsDivider />
          <ToggleButton
            value="pause"
            label="Pause"
            disabled
            icon={<Icon name="Pause" />}
          />
          <ActionsDivider />
          <ToggleButton
            value="stop"
            label="Stop"
            disabled
            icon={<Icon name="SquareShape" />}
          />
          <ActionsDivider />
          <ToggleButton
            value="lock"
            label="Lock"
            icon={<Icon name="LockAlt" />}
          />
          <ActionsDivider />
          <ToggleButton
            value="unlock"
            label="Unlock"
            icon={<Icon name="Unlock" />}
          />
        </CustomToggleButtonGroup>
      </ScrollableContainer>
      <Box mt={3}>
        <Grid container spacing={{ mobile: 0, tablet: 6 }}>
          <Grid size={{ mobile: 12, tablet: 6, laptop: 4 }}>{text}</Grid>
          <Grid flexGrow={1} size={{ mobile: 12, tablet: 6, laptop: 8 }}>
            {form}
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
};

export default Actions;
