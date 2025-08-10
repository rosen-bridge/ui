import { Check, HourGlass } from '@rosen-bridge/icons';
import { Stack, SvgIcon, Typography } from '@rosen-bridge/ui-kit';

import { Item } from '@/app/events/[details]/stepper/types';

export const StepIcon = ({ state }: Item) => {
  const style = {
    borderRadius: '50%',
    width: 32,
    height: 32,
    cursor: 'pointer',
    backgroundColor:
      state === 'done'
        ? 'success.main'
        : state === 'pending'
          ? 'info.main'
          : 'neutral.main',
  };

  return (
    <Stack sx={style} justifyContent="center" alignItems="center">
      {state === 'done' ? (
        <SvgIcon>
          <Check fontSize="small" color="#fff" />
        </SvgIcon>
      ) : state === 'pending' ? (
        <SvgIcon>
          <HourGlass fontSize="small" color="#fff" />
        </SvgIcon>
      ) : state === 'idle' ? (
        <Typography fontWeight="bold" color="#fff">
          #
        </Typography>
      ) : null}
    </Stack>
  );
};
