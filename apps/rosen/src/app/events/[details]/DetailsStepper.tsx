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
    id: 'Tx Created1ascacaApprovedsxsSDVSDVEQ',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApproApprovedsxsSDVSDVEQdvfj32ved3',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx AApprovedsxsSDVSDVEQpproscedveved',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx AppApprovedsxsSDVSDVEQroveqs2d3d',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreatedApprovedsxsSDVSDVEQ332acs',
    state: 'done',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approv86ApprovedsxsSDVSDVEQed23aApprovedsxsSDVSDVEQsc',
        state: 'done',
        title: 'Tx Apstepproved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx AApprovedsxsSDVSDVEQpprovedzasca',
        state: 'done',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovascwedascascApprovedsxsSDVSDVEQa',
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
        id: 'Tx AppApprovedsxsSDVSDVEQrovxsedASCSACA',
        state: 'done',
        title: 'Tx ApprovedVVE',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovsApprovedsxsSDVSDVEQxedCADC',
        state: 'pending',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovedsxsSDVSDVEQApprovedsxsSDVSDVEQ',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Creaddbdn58tedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApqxcsprovedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approvednkih1DCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approerbddved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx Crea43tedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx Approefce34vedCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx ApprovdvedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Approved5ytDsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
  {
    id: 'Tx CreathyhyedSDVD',
    state: 'idle',
    title: 'Tx Created',
    subtitle: 'Tx Created',
    sub: [
      {
        id: 'Tx ApproveyydCDsEQW4',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx AppwdwvrgtrovedDCWE4Jss8',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
      {
        id: 'Tx Addwpproved5DsCCV5',
        state: 'idle',
        title: 'Tx Approved',
        subtitle: 'Tx Approved',
      },
    ],
  },
];

export const DetailsStepper = () => {
  return (
    <DetailsCard state="open" title="Progress">
      <div style={{ minHeight: '210px' }}>
        <Stepper data={Steps} />
      </div>
    </DetailsCard>
  );
};
