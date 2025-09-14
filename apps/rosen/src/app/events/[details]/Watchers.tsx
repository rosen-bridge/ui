'use client';

import { useMemo, useState } from 'react';

import { CheckCircle, CloseCircle, Exchange, Eye } from '@rosen-bridge/icons';
import {
  Columns,
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
  LabelGroup,
  useBreakpoint,
  Text,
  Skeleton,
} from '@rosen-bridge/ui-kit';
import { NETWORKS } from '@rosen-ui/constants';
import { fetcher } from '@rosen-ui/swr-helpers';
import { getTxURL } from '@rosen-ui/utils';
import useSWR from 'swr';

import { rowTypes, WatchersApiResponse } from '@/app/events/[details]/type';

import { Section } from './Section';

const TableRow = InjectOverrides(TableRowBase);
const TableCell = InjectOverrides(TableCellBase);
const TableHead = InjectOverrides(TableHeadMui);
const TableBody = InjectOverrides(TableBodyMui);

export const Watchers = ({ id }: { id: string }) => {
  const { data, error, isLoading, mutate } = useSWR<WatchersApiResponse>(
    `/v1/events/${id}/watchers`,
    fetcher,
  );

  const compressed = useBreakpoint('laptop-down');

  const [details, setDetails] = useState<rowTypes>();

  const items = useMemo(() => {
    if (!isLoading) return data?.watchers || [];
    return Array(5).fill({});
  }, [data, isLoading]);

  return (
    <Section collapsible error={error} load={mutate} title="Watchers">
      <Stack flexDirection="column" gap={1}>
        <Columns width="150px" count={3} gap="24px">
          <Label label="Commitments" orientation="vertical">
            <Text loading={isLoading}>{data?.commitments}</Text>
          </Label>
          <Label label="Triggered by" orientation="vertical" info="TODO">
            <Text loading={isLoading}>{data?.triggeredBy}</Text>
          </Label>
          <Label
            label="Rewarded to"
            orientation="vertical"
            info="TODO: In tedad mitune bishtar az triggered by bashe chun baezi commitment haye valid momkene tu trigger merge nashode bashan."
          >
            <Text loading={isLoading}>{data?.rewardedTo}</Text>
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
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell align="center">{index + 1}</TableCell>
                {compressed && (
                  <TableCell align="center">
                    <Rewarded
                      loading={isLoading}
                      value={item?.rewarded === 'Yes'}
                      variant="icon"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Identifier loading={isLoading} value={item?.wid} />
                </TableCell>
                {!compressed && (
                  <TableCell>
                    <Identifier
                      href={getTxURL(NETWORKS.ergo.key, item?.commitment) || ''}
                      loading={isLoading}
                      value={item?.commitment}
                    />
                  </TableCell>
                )}
                {!compressed && (
                  <TableCell>
                    <Rewarded
                      loading={isLoading}
                      value={item?.rewarded === 'Yes'}
                      variant="label"
                    />
                  </TableCell>
                )}
                {compressed && (
                  <TableCell align="center">
                    <IconButton
                      disabled={isLoading}
                      onClick={() => setDetails(item)}
                    >
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
  loading?: boolean;
  value: boolean;
  variant: 'icon' | 'label' | 'label-reverse';
};

const Rewarded = ({ loading, value, variant }: RewardedProps) => {
  return (
    <Stack
      display="inline-flex"
      alignItems="center"
      flexDirection={variant === 'label-reverse' ? 'row-reverse' : 'row'}
      gap={1}
      flexWrap="nowrap"
    >
      {loading && <Skeleton variant="text" width="60px" height="24px" />}
      {!loading && (
        <>
          <SvgIcon
            sx={{
              color: value ? 'success.main' : 'text.secondary',
            }}
          >
            {value ? <CheckCircle /> : <CloseCircle />}
          </SvgIcon>
          {variant !== 'icon' && (
            <Typography>{value ? 'Yes' : 'No'}</Typography>
          )}
        </>
      )}
    </Stack>
  );
};
