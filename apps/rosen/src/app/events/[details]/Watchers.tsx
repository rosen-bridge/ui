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
  TableContainer,
  TableHead as TableHeadMui,
  TableRow as TableRowBase,
  Typography,
  useDisclosure,
  Box as BoxMui,
  LabelGroup,
} from '@rosen-bridge/ui-kit';

import { Section } from './Section';
import { DetailsProps } from './type';

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
    wid: '3030527c8fc3b9271c27e1e929fdcd39e71e9',
    commitment: 'f366b7a2f50f6854b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 2,
    wid: '3030520527c8fc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment: 'f366b7a2f502734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 3,
    wid: '3030527c408d82f1c27e1e929fdcd39e71e9',
    commitment:
      'f366b7a2f50f685dfbf872903ec3b92734b408d82f1c27e1e929fdcd39851fb',
    rewarded: 'Yes',
  },
  {
    id: 4,
    wid: '3030527c8fc3bfc3b92734b408d82f1c27e1e929fdcd39e71e9',
    commitment: 'f366b7a2f50f692734b408d82f1c27e1e929fdcd39851fb',
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
const TableHead = InjectOverrides(TableHeadMui);
const TableBody = InjectOverrides(TableBodyMui);
const TableHeader = () => {
  return (
    <TableHead
      overrides={{
        mobile: {
          sx: (theme) => ({
            '& .MuiTableCell-root': {
              backgroundColor: 'transparent',
              padding: theme.spacing(1, 1),
            },
          }),
        },
        tablet: {
          sx: (theme) => ({
            '& .MuiTableCell-root': {
              backgroundColor: theme.palette.secondary.light,
              padding: theme.spacing(1, 2),
            },
          }),
        },
      }}
    >
      <TableRow
        overrides={{
          mobile: {
            style: { display: 'none' },
          },
          tablet: {
            style: { display: 'table-row' },
          },
        }}
      >
        <TableCell style={{ width: '2rem', textAlign: 'center' }}>#</TableCell>
        <TableCell>WID</TableCell>
        <TableCell>COMMITMENT</TableCell>
        <TableCell style={{ width: '7rem' }}>REWARDED</TableCell>
      </TableRow>

      <TableRow
        overrides={{
          mobile: {
            style: { display: 'table-row' },
          },
          tablet: {
            style: { display: 'none' },
          },
        }}
      >
        <TableCell style={{ width: '0.5rem' }}></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell style={{ width: '0.5rem' }}></TableCell>
      </TableRow>
    </TableHead>
  );
};

export const Watchers = ({ details, loading: isLoading }: DetailsProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<rowTypes>();

  const handelOpen = (value: rowTypes) => {
    setOpen(true);
    setData(value);
  };

  const disclosure = useDisclosure();

  return (
    <Section
      action={<DisclosureButton disabled={false} disclosure={disclosure} />}
      state="open"
      title="Watchers"
    >
      <div style={{ marginBottom: '8px' }}>
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
            overrides={{
              mobile: {
                sx: {
                  '& > tr': {
                    '& > td': {
                      padding: (theme) => theme.spacing(0.5, 1),
                    },
                  },
                },
              },
              tablet: {
                sx: {
                  '& > tr': {
                    '& > td': {
                      padding: (theme) => theme.spacing(0.5, 2),
                      height: '40px',
                    },
                  },
                },
              },
            }}
          >
            {rows.map((row, index) => (
              <TableRow key={index}>
                {/*In all sizes*/}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body1" color="text.secondary">
                    {row.id}
                  </Typography>
                </TableCell>

                {/*show in tablet down ::: Rewarded*/}
                <TableCell
                  style={{ width: '30px' }}
                  overrides={{
                    tablet: {
                      style: { display: 'none' },
                    },
                  }}
                >
                  <SvgIcon
                    sx={{
                      color:
                        row.rewarded === 'Yes'
                          ? 'success.main'
                          : 'text.secondary',
                    }}
                  >
                    {row.rewarded === 'Yes' ? <CheckCircle /> : <CloseCircle />}
                  </SvgIcon>
                </TableCell>

                {/* show in tablet down  ::: WID*/}
                <TableCell
                  sx={{
                    maxWidth: 130,
                  }}
                >
                  <Identifier value={row.wid} />
                </TableCell>

                {/*show in tablet down  ::: Drawer*/}
                <TableCell
                  style={{ width: '30px' }}
                  overrides={{
                    tablet: {
                      style: { display: 'none' },
                    },
                  }}
                >
                  <IconButton onClick={() => handelOpen(row)}>
                    <SvgIcon>
                      <Eye />
                    </SvgIcon>
                  </IconButton>
                </TableCell>

                {/*show in tablet up ::: Commitment*/}
                <TableCell
                  style={{ display: 'none' }}
                  sx={{
                    maxWidth: 0,
                  }}
                  overrides={{
                    tablet: {
                      style: { display: 'table-cell' },
                    },
                  }}
                >
                  <Identifier
                    style={{ width: 'auto' }}
                    value={row.commitment}
                    href={row.commitment}
                  />
                </TableCell>

                {/*show in tablet up ::: Reward icons*/}
                <TableCell
                  style={{ display: 'none' }}
                  overrides={{
                    tablet: {
                      style: { display: 'table-cell' },
                    },
                  }}
                  sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}
                >
                  <Stack
                    alignItems="center"
                    justifyContent="start"
                    flexDirection="row"
                    gap={1}
                  >
                    <SvgIcon
                      sx={{
                        color:
                          row.rewarded === 'Yes'
                            ? 'success.main'
                            : 'text.secondary',
                      }}
                    >
                      {row.rewarded === 'Yes' ? (
                        <CheckCircle />
                      ) : (
                        <CloseCircle />
                      )}
                    </SvgIcon>
                    {row.rewarded}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        <Drawer open={open} onClose={() => setOpen(false)} value={data} />
      </Box>
    </Section>
  );
};

type DrawerProps = {
  value?: rowTypes;
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
            <Identifier style={{ width: '90%' }} value={value?.wid} copyable />
          </Label>
          <Label label="Commitment" orientation="horizontal">
            <Identifier
              style={{ width: '90%' }}
              value={value?.commitment}
              href={value?.commitment}
              copyable
            />
          </Label>
          <Label label="Rewarded" orientation="horizontal">
            <Stack flexDirection="row" gap={1}>
              <Typography>{value?.rewarded}</Typography>
              <SvgIcon
                sx={{
                  color:
                    value?.rewarded === 'Yes'
                      ? 'success.main'
                      : 'text.secondary',
                }}
              >
                {value?.rewarded === 'Yes' ? <CheckCircle /> : <CloseCircle />}
              </SvgIcon>
            </Stack>
          </Label>
        </LabelGroup>
      </EnhancedDialogContent>
    </EnhancedDialog>
  );
};
