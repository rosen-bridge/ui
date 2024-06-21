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
import { useEffect, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { ApiAssetResponse, Assets } from '@/_types/api';

interface DetailsDrawerProps {
  asset: Assets;
  open: boolean;
  onClose: () => void;
}

export const DetailsDrawer = ({ asset, open, onClose }: DetailsDrawerProps) => {
  const id = asset.id;

  const [detail, setDetail] = useState<ApiAssetResponse>();

  const { isMutating, trigger } = useSWRMutation(
    `/api/v1/assets/detail/${id}`,
    (url) => fetch(url, { method: 'GET' }).then((res) => res.json()),
  );

  useEffect(() => {
    if (!id || !open) return;
    trigger()
      .then(setDetail)
      .catch(() => onClose());
  }, [id, open, trigger, onClose]);

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
        {isMutating && (
          <Box textAlign="center">
            <CircularProgress size={24} />
          </Box>
        )}
        {!isMutating && detail && (
          <Grid container spacing={2} direction="column">
            <Grid item>
              <Typography variant="body2">Name</Typography>
              <Typography>{detail.token.name}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Id</Typography>
              <Typography style={{ wordBreak: 'break-all' }}>
                {detail.token.id}
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2">Type</Typography>
              <Typography>{detail.token.chain}</Typography>
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
              {detail.locked && (
                <Table size="small">
                  <TableBody>
                    {detail.locked.map((row) => (
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
              {detail.bridged && (
                <Table size="small">
                  <TableBody>
                    {detail.bridged.map((item) => (
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
