'use client';

import React, { useState } from 'react';

import { CheckCircle, CloseCircle, Exchange, Eye } from '@rosen-bridge/icons';
import {
  Columns,
  DisclosureButton,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  IconButton,
  Identifier,
  Label,
  InjectOverrides,
  Stack,
  SvgIcon,
  Table,
  TableBody as TableBodyMui,
  TableCell as TableCellBase,
  TableHead as TableHeadMui,
  TableRow as TableRowBase,
  Typography,
  useDisclosure,
  LabelGroup,
  useBreakpoint,
  TableContainer,
} from '@rosen-bridge/ui-kit';
import { fetcher } from '@rosen-ui/swr-helpers';
import useSWR from 'swr';

import { Text } from '@/app/events/[details]/Text';
import { rowTypes, WatchersApiResponse } from '@/app/events/[details]/type';

import { Section } from './Section';

const TableRow = InjectOverrides(TableRowBase);
const TableCell = InjectOverrides(TableCellBase);
const TableHead = InjectOverrides(TableHeadMui);
const TableBody = InjectOverrides(TableBodyMui);

export const Watchers = ({ id }: { id: string }) => {
  const { data, isLoading, mutate } = useSWR<WatchersApiResponse>(
    `/v1/events/${id}/watchers`,
    fetcher,
  );

  const compressed = useBreakpoint('laptop-down');

  const [details, setDetails] = useState<rowTypes>();

  const disclosure = useDisclosure({
    onOpen: async () => void (await mutate()),
  });

  return (
    <Section
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Watchers"
    >
      <Stack flexDirection="column" gap={1}>
        <Columns width="150px" count={3} gap="24px">
          <Label label="Commitments" orientation="vertical">
            <Text value={data?.commitments} loading={isLoading} />
          </Label>
          <Label label="Triggered by" orientation="vertical" info="TODO">
            <Text value={data?.triggeredBy} loading={isLoading} />
          </Label>
          <Label
            label="Rewarded to"
            orientation="vertical"
            info="TODO: In tedad mitune bishtar az triggered by bashe chun baezi commitment haye valid momkene tu trigger merge nashode bashan."
          >
            <Text value={data?.rewardedTo} loading={isLoading} />
          </Label>
        </Columns>
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead
            sx={(theme) => ({
              '& .MuiTableCell-root': {
                'backgroundColor': theme.palette.secondary.light,
                'padding': compressed ? '0' : theme.spacing(1, 1),
                'font-size': compressed ? '0' : undefined,
                'line-height': compressed ? '0' : undefined,
              },
            })}
          >
            <TableRow>
              <TableCell style={{ width: '2.5rem' }} align="center">
                #
              </TableCell>
              {compressed && (
                <TableCell style={{ width: '2.5rem' }}></TableCell>
              )}
              <TableCell>WID</TableCell>
              {!compressed && <TableCell>COMMITMENT</TableCell>}
              {!compressed && (
                <TableCell style={{ width: '7.5rem' }}>REWARDED</TableCell>
              )}
              {compressed && <TableCell style={{ width: '5rem' }}></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& tr': {
                height: '50px',
              },
              '& td': {
                padding: (theme) => theme.spacing(0, 1),
              },
            }}
          >
            {data?.watchers.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                {compressed && (
                  <TableCell align="center">
                    <Rewarded value={row.rewarded === 'Yes'} variant="icon" />
                  </TableCell>
                )}
                <TableCell>
                  <Identifier value={row.wid} />
                </TableCell>
                {!compressed && (
                  <TableCell>
                    <Identifier value={row.commitment} href={row.commitment} />
                  </TableCell>
                )}
                {!compressed && (
                  <TableCell>
                    <Rewarded value={row.rewarded === 'Yes'} variant="label" />
                  </TableCell>
                )}
                {compressed && (
                  <TableCell align="center">
                    <IconButton onClick={() => setDetails(row)}>
                      <SvgIcon>
                        <Eye />
                      </SvgIcon>
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
      {!!details && (
        <Drawer open value={details} onClose={() => setDetails(undefined)} />
      )}
    </Section>
  );
};

type DrawerProps = {
  value: rowTypes;
  open: boolean;
  onClose: () => void;
};

const Drawer = ({ value, open, onClose }: DrawerProps) => {
  return (
    <EnhancedDialog open={open} stickOn="tablet" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />} onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <LabelGroup>
          <Label label="Wid" orientation="horizontal">
            <Identifier value={value.wid} copyable />
          </Label>
          <Label label="Commitment" orientation="horizontal">
            <Identifier
              value={value.commitment}
              href={value.commitment}
              copyable
            />
          </Label>
          <Label label="Rewarded" orientation="horizontal">
            <Rewarded
              value={value.rewarded === 'Yes'}
              variant="label-reverse"
            />
          </Label>
        </LabelGroup>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

type RewardedProps = {
  value: boolean;
  variant: 'icon' | 'label' | 'label-reverse';
};

const Rewarded = ({ value, variant }: RewardedProps) => {
  return (
    <Stack
      display="inline-flex"
      alignItems="center"
      flexDirection={variant === 'label-reverse' ? 'row-reverse' : 'row'}
      gap={1}
      flexWrap="nowrap"
    >
      <SvgIcon
        sx={{
          color: value ? 'success.main' : 'text.secondary',
        }}
      >
        {value ? <CheckCircle /> : <CloseCircle />}
      </SvgIcon>
      {variant !== 'icon' && <Typography>{value ? 'Yes' : 'No'}</Typography>}
    </Stack>
  );
};
