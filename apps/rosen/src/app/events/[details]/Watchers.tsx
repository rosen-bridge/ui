'use client';

import React, { useCallback, useState } from 'react';

import { CheckCircle, Exchange, Eye } from '@rosen-bridge/icons';
import {
  Columns,
  DisclosureButton,
  EnhancedDialog,
  EnhancedDialogContent,
  EnhancedDialogTitle,
  IconButton,
  Identifier,
  Label,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useBreakpoint,
  useCurrentBreakpoint,
  useDisclosure,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/';

type rowTypes = {
  id: number;
  wid: string;
  commitment: string;
  rewarded?: 'Yes' | 'No';
};
//TODO: data types
const rows: rowTypes[] = [
  {
    id: 1,
    wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd393030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 2,
    wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd39.3030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 3,
    wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd393030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 4,
    wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd393030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'No',
  },
  {
    id: 5,
    wid: '3030527c8fc3b92734b408d82f1c27e1e929fdcd393030527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903e115851fb798253030527c8fc3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
];

export const Watchers = () => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<rowTypes>();
  const currentSize = useCurrentBreakpoint();

  const isMobile = useBreakpoint('tablet-down');

  const size = useCallback(
    (custom?: string) => {
      switch (currentSize) {
        case 'mobile':
          return '150px';
        case 'tablet':
          return '150px';
        case 'laptop':
          return '250px';
        case 'desktop':
          return custom ?? '350px';
        default:
          return '150px';
      }
    },
    [currentSize],
  );

  const handelOpen = (value: rowTypes) => {
    setOpen(true);
    setData(value);
  };

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
      title="Wids"
    >
      <div
        style={{ marginBottom: '8px', display: isMobile ? 'none' : 'block' }}
      >
        <Columns width="100px" count={3} gap="24px">
          <Label label="Commitments" orientation="vertical">
            44
          </Label>
          <Label label="Triggered by" orientation="vertical">
            15
          </Label>
          <Label label="Rewarded to" orientation="vertical">
            N/A
          </Label>
        </Columns>
      </div>

      <TableContainer>
        <Table>
          <TableHead
            sx={(theme) => ({
              '& .MuiTableCell-root': {
                backgroundColor: theme.palette.secondary.light,
                padding: theme.spacing(0.5, 2),
              },
            })}
          >
            <TableRow style={{ display: !isMobile ? 'table-row' : 'none' }}>
              <TableCell>#</TableCell>
              <TableCell>WID</TableCell>
              <TableCell>COMMITMENT</TableCell>
              <TableCell>REWARDED</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {!isMobile && (
                  <TableCell align="center" style={{ maxWidth: '10px' }}>
                    {row.id}
                  </TableCell>
                )}
                <TableCell align="center" style={{ maxWidth: size('400px') }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1}
                  >
                    {isMobile && <Typography>{row.id}</Typography>}
                    {isMobile && (
                      <SvgIcon
                        sx={{
                          color:
                            row.rewarded === 'Yes'
                              ? 'secondary.main'
                              : 'text.secondary',
                        }}
                      >
                        <CheckCircle />
                      </SvgIcon>
                    )}
                    <div style={{ maxWidth: size('450px'), width: '100%' }}>
                      <Identifier value={row.wid} />
                    </div>
                  </Stack>
                </TableCell>

                {isMobile && (
                  <TableCell align="right" style={{ maxWidth: '40px' }}>
                    <IconButton onClick={() => handelOpen(row)}>
                      <SvgIcon>
                        <Eye />
                      </SvgIcon>
                    </IconButton>
                  </TableCell>
                )}

                {!isMobile && (
                  <TableCell style={{ maxWidth: size() }}>
                    <div style={{ maxWidth: size() }}>
                      <Identifier
                        value={row.commitment}
                        href={row.commitment}
                      />
                    </div>
                  </TableCell>
                )}
                {/*Reward Icon*/}
                {!isMobile && (
                  <TableCell align="center" style={{ maxWidth: '80px' }}>
                    <Stack alignItems="center" flexDirection="row" gap={1}>
                      <SvgIcon
                        sx={{
                          color:
                            row.rewarded === 'Yes'
                              ? 'secondary.main'
                              : 'text.secondary',
                        }}
                      >
                        <CheckCircle />
                      </SvgIcon>
                      {row.rewarded}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isMobile && (
        <Drawer open={open} onClose={() => setOpen(false)} value={data} />
      )}
    </DetailsCard>
  );
};

type DrawerProps = {
  value?: rowTypes;
  onClose: () => void;
  open: boolean;
};

const Drawer = ({ value, onClose, open = false }: DrawerProps) => {
  return (
    <EnhancedDialog open={open} stickOn="tablet" onClose={onClose}>
      <EnhancedDialogTitle icon={<Exchange />} onClose={onClose}>
        Event Details
      </EnhancedDialogTitle>
      <EnhancedDialogContent>
        <Stack>
          <Label label="Wid" orientation="horizontal">
            {value && <Identifier value={value?.wid} copyable />}
          </Label>
          <Label label="Commitment" orientation="horizontal">
            {value && (
              <Identifier
                value={value?.commitment}
                href={value?.commitment}
                copyable
              />
            )}
          </Label>
          <Label label="Rewarded" orientation="horizontal">
            {value && (
              <Stack flexDirection="row" gap={1}>
                <Typography>{value.rewarded}</Typography>
                <SvgIcon
                  sx={{
                    color:
                      value.rewarded === 'Yes'
                        ? 'secondary.main'
                        : 'text.secondary',
                  }}
                >
                  <CheckCircle />
                </SvgIcon>
              </Stack>
            )}
          </Label>
        </Stack>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};
