'use client';

import { Route } from 'next';
import { useRouter, usePathname } from 'next/navigation';

import { Tabs, TabsList, TabsTab } from '@rosen-bridge/ui-kit';

import './style.css';
import { ReactNode } from 'react';

export type ActionsProps = {
  children?: ReactNode;
}

export const Actions = ({ children }: ActionsProps) => {
  const pathname = usePathname();

  const router = useRouter();

  return (
    <Tabs className="actions" value={pathname} onChange={(value) => router.push(value as Route)}>
      <TabsList grow>
        <TabsTab
          icon="MoneyWithdrawal"
          iconPosition="top"
          value="/actions/withdraw"
        >
          Withdraw
        </TabsTab>
        <TabsTab
          disabled
          icon="Pause"
          iconPosition="top"
          value="/actions/pause"
        >
          Pause
        </TabsTab>
        <TabsTab
          disabled
          icon="SquareShape"
          iconPosition="top"
          value="/actions/stop"
        >
          Stop
        </TabsTab>
        <TabsTab
          icon="LockAlt"
          iconPosition="top"
          value="/actions/lock"
        >
          Lock
        </TabsTab>
        <TabsTab
          icon="Unlock"
          iconPosition="top"
          value="/actions/unlock"
        >
          Unlock
        </TabsTab>
      </TabsList>
      {children}
    </Tabs>
  );
};
