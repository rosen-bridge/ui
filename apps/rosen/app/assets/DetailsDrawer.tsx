import {
  Avatar,
  Box,
  Grid,
  Id,
  Drawer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  CircularProgress,
} from '@rosen-bridge/ui-kit';

import useSWR from 'swr';
import { fetcher } from '@rosen-ui/swr-helpers';

import { ApiAssetResponse, Assets } from '@/_types/api';

interface DetailsDrawerProps {
  asset: Assets;
  open: boolean;
  onClose: () => void;
}

export const DetailsDrawer = ({ asset, open, onClose }: DetailsDrawerProps) => {
  const { data, isLoading } = useSWR<ApiAssetResponse>(
    open ? `/v1/assets/detail/${asset.id}` : null,
    fetcher,
  );

  return (
    <Drawer
      anchor="bottom"
      PaperProps={{
        sx: {
          borderRadius: (theme) =>
            `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0 0`,
        },
      }}
      open={open}
      onClose={onClose}
    >
      <Box padding={2}>
        {isLoading && (
          <Box textAlign="center">
            <CircularProgress size={24} />
          </Box>
        )}
        {!isLoading && data && (
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography variant="body2">Name</Typography>
              <Typography>{data.token.name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Id</Typography>
              <Typography style={{ wordBreak: 'break-all' }}>
                {data.token.id}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Type</Typography>
              <Typography>{data.token.chain}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Locked</Typography>
              <Typography>{asset.locked}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Bridged</Typography>
              <Typography>{asset.bridged}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Locked</Typography>
              {data.locked && (
                <Table size="small">
                  <TableBody>
                    {data.locked.map((row) => (
                      <TableRow
                        key={row.address}
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell>
                          <Avatar>T</Avatar>
                        </TableCell>
                        <TableCell>
                          <Id id={row.address} indicator="middle" />
                        </TableCell>
                        <TableCell>{row.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Grid>
            <Grid item>
              <Typography variant="body2">Bridged</Typography>
              {data.bridged && (
                <Table size="small">
                  <TableBody>
                    {data.bridged.map((item) => (
                      <TableRow
                        key={item.chain}
                        sx={{ '&:last-child td': { border: 0 } }}
                      >
                        <TableCell>
                          <Avatar>T</Avatar>
                        </TableCell>
                        <TableCell>{item.chain}</TableCell>
                        <TableCell>{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Grid>
          </Grid>
        )}
      </Box>
    </Drawer>
  );
};
