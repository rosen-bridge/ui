'use client';

import {
  LockAlt,
  MoneyWithdrawal,
  Pause,
  SquareShape,
  Unlock,
} from '@rosen-bridge/icons';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Stack,
  SvgIcon,
  Typography,
} from '@rosen-bridge/ui-kit';

import { HomeActionButton } from '@/_components/HomeActionButton';

const Actions = () => {
  return (
    <Card backgroundColor="background.paper">
      <CardHeader>
        <CardTitle>
          <Typography fontWeight="700">Actions</Typography>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Stack direction="row">
          <HomeActionButton
            action="withdraw"
            label="Withdraw"
            icon={
              <SvgIcon>
                <MoneyWithdrawal />
              </SvgIcon>
            }
          />
          <HomeActionButton
            action="pause"
            label="Pause"
            disabled={true}
            icon={
              <SvgIcon>
                <Pause />
              </SvgIcon>
            }
          />
          <HomeActionButton
            action="stop"
            label="Stop"
            disabled={true}
            icon={
              <SvgIcon>
                <SquareShape />
              </SvgIcon>
            }
          />
          <HomeActionButton
            action="lock"
            label="Lock"
            icon={
              <SvgIcon>
                <LockAlt />
              </SvgIcon>
            }
          />
          <HomeActionButton
            action="unlock"
            label="Unlock"
            icon={
              <SvgIcon>
                <Unlock />
              </SvgIcon>
            }
          />
        </Stack>
      </CardBody>
    </Card>
  );
};

export default Actions;
