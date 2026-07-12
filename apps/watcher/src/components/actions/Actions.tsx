'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Tabs, TabsList, TabsTab } from '@rosen-bridge/ui-kit';

import './style.css';

export type ActionsProps = {
  children?: ReactNode;
};

export const Actions = ({ children }: ActionsProps) => {
  const pathname = usePathname();

  return (
    <Tabs className="actions" value={pathname}>
      <TabsList grow>
        <TabsTab
          href="/actions/withdraw"
          icon="MoneyWithdrawal"
          iconPosition="top"
        >
          Withdraw
        </TabsTab>
        <TabsTab disabled icon="Pause" iconPosition="top" value="">
          Pause
        </TabsTab>
        <TabsTab disabled icon="SquareShape" iconPosition="top" value="">
          Stop
        </TabsTab>
        <TabsTab href="/actions/lock" icon="LockAlt" iconPosition="top">
          Lock
        </TabsTab>
        <TabsTab href="/actions/unlock" icon="Unlock" iconPosition="top">
          Unlock
        </TabsTab>
      </TabsList>
      {children}
    </Tabs>
  );
};
