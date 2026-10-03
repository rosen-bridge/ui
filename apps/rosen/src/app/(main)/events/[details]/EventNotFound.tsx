'use client';

import { Avatar, Button, Center, Icon, Stack, Toolbar, Typography } from '@rosen-bridge/ui-kit';

export const EventNotFound = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <Center style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Stack align="center" spacing={2} style={{ maxWidth: '30rem' }}>
        <Avatar background="primary-light" color="primary" size={64}>
          <Icon name="Search" size="32px" />
        </Avatar>
        <Typography align="center" variant="h3">
          Event Not Found
        </Typography>
        <Typography align="center" variant="body2" color="text-secondary">
          This event does not exist, or it has not been observed yet. New events may take a few
          minutes to appear after the source transaction is confirmed.
        </Typography>
        <Toolbar>
          <Button variant="outlined" onClick={onRetry}>
            Check Again
          </Button>
          <Button variant="contained" href="/events">
            Back To Events
          </Button>
        </Toolbar>
      </Stack>
    </Center>
  );
};
