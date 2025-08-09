'use client';

import { Eye } from '@rosen-bridge/icons';
import {
  Identifier,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useBreakpoint,
  useMediaQuery,
} from '@rosen-bridge/ui-kit';

import { DetailsCard } from '@/app/events/[details]/DetailsCard';

export const Wids = () => {
  const isMobile = useBreakpoint('tablet-to-mobile');
  const rows = [
    {
      id: '1',
      address:
        '20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab3b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab',
    },
    {
      id: '2',
      address:
        '20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab3b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab',
    },
    {
      id: '3',
      address:
        '20dae02b01ab75f435be6813b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab3b1d2908e39ea8e6ac3113d1b125b211fb85eb0ab',
    },
  ];

  return (
    <DetailsCard title="Wids">
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead
            //TODO :remove sx
            sx={(theme) => ({
              '& .MuiTableCell-root': {
                backgroundColor: theme.palette.secondary.light,
                padding: theme.spacing(0.5, 2),
              },
              '& .MuiTableCell-root:first-of-type': {
                borderTopLeftRadius: theme.spacing(3),
                borderBottomLeftRadius: theme.spacing(3),
              },
              '& .MuiTableCell-root:last-of-type': {
                borderTopRightRadius: theme.spacing(3),
                borderBottomRightRadius: theme.spacing(3),
              },
            })}
          >
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>WID</TableCell>
              <TableCell>{isMobile ? '' : 'Commitment'}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody
            sx={(theme) => ({
              // TODO
              '& .MuiTableCell-root': {
                padding: theme.spacing(1, 2),
              },
            })}
          >
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Stack flexDirection="row" gap={2} alignItems="center">
                    {/*TODO*/}
                    <div
                      style={{ maxWidth: '320px', width: 'calc(90% - 16px)' }}
                    >
                      <Identifier value={row.address} />
                    </div>
                  </Stack>
                </TableCell>

                {!isMobile ? (
                  <TableCell>
                    {/*TODO*/}
                    <div style={{ maxWidth: 'calc(80% - 20px)' }}>
                      <Identifier href={row.address} value={row.address} />
                    </div>
                  </TableCell>
                ) : (
                  <TableCell>
                    <SvgIcon>
                      <Eye />
                    </SvgIcon>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </DetailsCard>
  );
};
