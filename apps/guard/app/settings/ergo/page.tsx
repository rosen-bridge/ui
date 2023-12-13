'use client';

import {
  Button,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@rosen-bridge/ui-kit';

const ErgoSettings = () => {
  return (
    <>
      <Grid container spacing={1} mb={2}>
        <Grid item mobile={12} desktop={5}>
          <Typography variant="body2" color="textPrimary">
            Network Type
          </Typography>
        </Grid>
        <Grid item mobile={12} desktop={7}>
          <Select fullWidth defaultValue="testnet">
            <MenuItem value="testnet">Testnet</MenuItem>
            <MenuItem value="mainnet">Mainnet</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={1} mb={2}>
        <Grid item mobile={12} desktop={5}>
          <Typography variant="body2" color="textPrimary">
            Chain Network
          </Typography>
        </Grid>
        <Grid item mobile={12} desktop={7}>
          <Select fullWidth defaultValue="explorer">
            <MenuItem value="explorer">Explorer</MenuItem>
            <MenuItem value="node">Node</MenuItem>
          </Select>
        </Grid>
      </Grid>
      <Grid container spacing={1} mb={2}>
        <Grid item mobile={12} desktop={5}>
          <Typography variant="body2" color="textPrimary">
            Minimum Box Value
          </Typography>
          <Typography variant="body2">minimum nano-erg for a box</Typography>
        </Grid>
        <Grid item mobile={12} desktop={7}>
          <TextField fullWidth defaultValue={300000} />
        </Grid>
      </Grid>
      <Divider sx={{ mb: 2 }} />
      <Stack
        direction={{ mobile: 'column', tablet: 'row-reverse' }}
        spacing={2}
      >
        <Button variant="contained" sx={{ minWidth: 120 }}>
          Save
        </Button>
        <Button>Discard changes</Button>
      </Stack>
    </>
  );
};

export default ErgoSettings;
