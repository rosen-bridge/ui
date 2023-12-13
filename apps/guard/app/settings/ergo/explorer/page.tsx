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

const ErgoExplorerSettings = () => {
  return (
    <>
      <Grid container spacing={2} mb={2}>
        <Grid item mobile={12} desktop={5}>
          <Typography variant="body2" color="textPrimary">
            URL
          </Typography>
        </Grid>
        <Grid item mobile={12} desktop={7}>
          <TextField fullWidth defaultValue="https://api.ergoplatform.com/" />
        </Grid>
      </Grid>
      <Grid container spacing={2} mb={2}>
        <Grid item mobile={12} desktop={5}>
          <Typography variant="body2" color="textPrimary">
            Timeout
          </Typography>
        </Grid>
        <Grid item mobile={12} desktop={7}>
          <TextField fullWidth defaultValue={8} />
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

export default ErgoExplorerSettings;
