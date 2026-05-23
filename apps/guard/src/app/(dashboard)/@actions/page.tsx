'use client';

import { useState } from 'react';

import {
  Tabs,
  TabsList,
  TabsPanel,
  TabsTab,
  useResponsive,
} from '@rosen-bridge/ui-kit';

import { RequestAnOrderForm } from './RequestAnOrderForm';
import { RequestToSignForm } from './RequestToSignForm';
import './style.css';

const Actions = () => {
  const [tab, setTab] = useState(3);

  const tabsListGrow = useResponsive({
    mobile: true,
    tablet: false,
  } as const);

  const tabsOrientation = useResponsive({
    mobile: 'horizontal',
    tablet: 'vertical',
  } as const);

  const tabsTabIconPosition = useResponsive({
    mobile: 'top',
    tablet: 'start',
  } as const);

  return (
    <Tabs
      className="actions"
      gap={2}
      value={tab}
      orientation={tabsOrientation}
      onChange={(value) => setTab(value as number)}
    >
      <TabsList align="center" grow={tabsListGrow}>
        <TabsTab
          disabled
          icon="Pause"
          iconPosition={tabsTabIconPosition}
          value={0}
        >
          Pause Service
        </TabsTab>
        <TabsTab
          disabled
          icon="StopCircle"
          iconPosition={tabsTabIconPosition}
          value={1}
        >
          Stop Service
        </TabsTab>
        <TabsTab
          disabled
          icon="Pause"
          iconPosition={tabsTabIconPosition}
          value={2}
        >
          Pause Network
        </TabsTab>
        <TabsTab
          icon="FileEditAlt"
          iconPosition={tabsTabIconPosition}
          value={3}
        >
          Request To Sign
        </TabsTab>
        <TabsTab icon="ReceiptAlt" iconPosition={tabsTabIconPosition} value={4}>
          Request An Order
        </TabsTab>
        <TabsTab
          disabled
          icon="KeySkeleton"
          iconPosition={tabsTabIconPosition}
          value={5}
        >
          Generate Key
        </TabsTab>
        <TabsTab
          disabled
          icon="Redo"
          iconPosition={tabsTabIconPosition}
          value={6}
        >
          Key Reconstruction
        </TabsTab>
      </TabsList>
      <TabsPanel value={0}></TabsPanel>
      <TabsPanel value={1}></TabsPanel>
      <TabsPanel value={2}></TabsPanel>
      <TabsPanel value={3}>
        <RequestToSignForm />
      </TabsPanel>
      <TabsPanel value={4}>
        <RequestAnOrderForm />
      </TabsPanel>
      <TabsPanel value={5}></TabsPanel>
      <TabsPanel value={6}></TabsPanel>
    </Tabs>
  );
};

export default Actions;
