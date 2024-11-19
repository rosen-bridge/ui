'use client';

import {
  LockAlt,
  MoneyWithdrawal,
  Pause,
  SquareShape,
  Unlock,
} from '@rosen-bridge/icons';
import { FullCard, SvgIcon } from '@rosen-bridge/ui-kit';

import { HomeActionButton } from '@/_components/HomeActionButton';

const Actions = () => {
  return (
    <FullCard
      title="Actions"
      cardActions={
        <>
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
        </>
      }
    />
  );
};

export default Actions;
