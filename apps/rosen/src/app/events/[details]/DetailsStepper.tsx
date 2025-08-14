import React from 'react';

import {
  DisclosureButton,
  stepItem,
  Stepper,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

const Steps: stepItem[] = [
  {
    id: 'Tx Created1ascaca',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approdvfj32ved3',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approscedveved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approveqs2d3d',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Created332acs',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approv86ed23asc',
        state: 'done',
        title: 'Tx Apstepproved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approvedzasca',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approvascwedascasca',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedaXAXW',
    state: 'pending',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovxsedASCSACA',
        state: 'done',
        title: 'Tx ApprovedVVE',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovsxedCADC',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedsxsSDVSDVEQ',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApprovedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
];

export const DetailsStepper = () => {
  const disclosure = useDisclosure({
    onOpen: () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.5) {
            resolve();
          } else {
            reject();
          }
        }, 500);
      });
    },
  });
  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Progress"
    >
      <div style={{ minHeight: '210px' }}>
        <Stepper data={Steps} />
      </div>
    </DetailsCard>
  );
};
