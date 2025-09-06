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
  TableBody,
  TableCell as TableCellBase,
  TableContainer,
  TableHead,
  TableRow as TableRowBase,
  Typography,
  useBreakpoint,
  useDisclosure,
  Box as BoxMui,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/';
import { DetailsProps } from '@/app/events/[details]/type';

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
const TableRow = InjectOverrides(TableRowBase);
const TableCell = InjectOverrides(TableCellBase);
const Box = InjectOverrides(BoxMui);

const TableHeader = () => {
  return (
    <TableHead
      sx={(theme) => ({
        '& .MuiTableCell-root': {
          backgroundColor: theme.palette.secondary.light,
          padding: theme.spacing(0.5, 2),
        },
      })}
    >
      <TableRow
        overrides={{
          mobile: {
            style: { display: 'none' },
          },
          laptop: {
            style: { display: 'table-row' },
          },
        }}
      >
        <TableCell>#</TableCell>
        <TableCell>WID</TableCell>
        <TableCell>COMMITMENT</TableCell>
        <TableCell>REWARDED</TableCell>
      </TableRow>

      <TableRow
        overrides={{
          mobile: {
            style: { display: 'table-row' },
          },
          laptop: {
            style: { display: 'none' },
          },
        }}
      >
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
      </TableRow>
    </TableHead>
  );
};

export const Watchers = ({ details, loading: isLoading }: DetailsProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<rowTypes>();
  const isMobile = useBreakpoint('tablet-down');

  const handelOpen = (value: rowTypes) => {
    setOpen(true);
    setData(value);
  };

  const disclosure = useDisclosure();

  return (
    <DetailsCard
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state={disclosure.state}
      title="Watchers"
    >
      <div
        style={{ marginBottom: '8px', display: isMobile ? 'none' : 'block' }}
      >
        <Columns width="100px" count={3} gap="24px">
          <Label label="Commitments" orientation="vertical">
            TODO
          </Label>
          <Label
            label="Triggered by"
            orientation="vertical"
            info={'this is lorem text for show tooltip'}
          >
            TODO
          </Label>
          <Label
            label="Rewarded to"
            orientation="vertical"
            info="In tedad mitune bishtar az triggered by bashe chun baezi commitment haye valid momkene tu trigger merge nashode bashan."
          >
            TODO
          </Label>
        </Columns>
      </div>

      <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'auto', width: '100%' }}>
          <TableHeader />
          <TableBody
            sx={{
              '& > tr': {
                '& > td': {
                  padding: '0px 0',
                  height: '40px',
                },
              },
            }}
          >
            {rows.map((row) =>
              isMobile ? (
                <TableRowMobile key={row.wid} row={row} onClick={handelOpen} />
              ) : (
                <TableRowLaptop key={row.wid} row={row} />
              ),
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <Drawer open={open} onClose={() => setOpen(false)} value={data} />
      </Box>
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
                        ? 'success.main'
                        : 'text.secondary',
                  }}
                >
                  {value.rewarded === 'Yes' ? <CheckCircle /> : <CloseCircle />}
                </SvgIcon>
              </Stack>
            )}
          </Label>
        </Stack>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};

const TableRowMobile = ({
  row,
  onClick,
}: {
  row: rowTypes;
  onClick: (row: rowTypes) => void;
}) => {
  return (
    <TableRow>
      <TableCell
        overrides={{
          tablet: {
            style: { display: 'table-cell' },
          },
          laptop: {
            style: { display: 'none' },
          },
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {row.id}
        </Typography>
      </TableCell>

      <TableCell
        overrides={{
          tablet: {
            style: { display: 'table-cell' },
          },
          laptop: {
            style: { display: 'none' },
          },
        }}
      >
        <SvgIcon
          sx={{
            color: row.rewarded === 'Yes' ? 'success.main' : 'text.secondary',
          }}
        >
          {row.rewarded === 'Yes' ? <CheckCircle /> : <CloseCircle />}
        </SvgIcon>
      </TableCell>

      <TableCell
        overrides={{
          tablet: {
            style: { display: 'table-cell' },
          },
          laptop: {
            style: { display: 'none' },
          },
        }}
        sx={{
          maxWidth: 150,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        <Identifier value={row.wid} />
      </TableCell>

      <TableCell
        overrides={{
          tablet: {
            style: { display: 'table-cell' },
          },
          laptop: {
            style: { display: 'none' },
          },
        }}
      >
        <IconButton onClick={() => onClick(row)}>
          <SvgIcon>
            <Eye />
          </SvgIcon>
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const TableRowLaptop = ({ row }: { row: rowTypes }) => {
  return (
    <TableRow>
      {/* 1 */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body1" color="text.secondary">
          {row.id}
        </Typography>
      </TableCell>

      {/* 2 */}
      <TableCell
        sx={{
          maxWidth: 200, // حداکثر عرض ستون
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <Identifier value={row.commitment} href={row.commitment} />
      </TableCell>

      {/* 3 */}
      <TableCell
        sx={{
          maxWidth: 200,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        <Identifier value={row.commitment} href={row.commitment} />
      </TableCell>

      {/* 4 */}
      <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
        <Stack
          alignItems="center"
          justifyContent="center"
          flexDirection="row"
          gap={1}
        >
          <SvgIcon
            sx={{
              color: row.rewarded === 'Yes' ? 'success.main' : 'text.secondary',
            }}
          >
            {row.rewarded === 'Yes' ? <CheckCircle /> : <CloseCircle />}
          </SvgIcon>
          {row.rewarded}
        </Stack>
      </TableCell>
    </TableRow>
  );
};
